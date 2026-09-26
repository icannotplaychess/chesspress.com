import { Chess } from "chess.js";
import type { RawGame } from "@/lib/scout/fetch-games";
import type { ScoutPlatform } from "@/lib/scout/types";
import { detectOpeningFromPgn } from "@/lib/scout/opening-detect";

export type GameResult = "win" | "loss" | "draw";

export interface NormalizedMove {
  san: string;
  clockSeconds?: number;
}

export interface NormalizedGame {
  id: string;
  date: string;
  platform: ScoutPlatform;
  opponent: string;
  opponentRating?: number;
  color: "white" | "black";
  result: GameResult;
  timeControl: string;
  speed: "bullet" | "blitz" | "rapid" | "daily" | "unknown";
  eco?: string;
  openingName?: string;
  moves: NormalizedMove[];
  moveSans: string[];
  termination?: string;
  pgn: string;
  gameUrl?: string;
}

function normalizeUsername(a: string, b: string): boolean {
  return a.toLowerCase().trim() === b.toLowerCase().trim();
}

function parseResult(result: string, color: "white" | "black"): GameResult {
  if (result === "1/2-1/2" || result === "*") return "draw";
  if (color === "white") return result === "1-0" ? "win" : "loss";
  return result === "0-1" ? "win" : "loss";
}

function inferSpeed(
  timeControl: string,
  platform: ScoutPlatform
): NormalizedGame["speed"] {
  const t = timeControl.toLowerCase();
  if (t.includes("bullet") || t === "60" || t.startsWith("60+")) return "bullet";
  if (t.includes("blitz") || t.includes("180") || t.includes("300")) return "blitz";
  if (t.includes("rapid") || t.includes("600") || t.includes("900")) return "rapid";
  if (t.includes("daily") || t.includes("correspondence")) return "daily";
  if (platform === "lichess") {
    if (["ultraBullet", "bullet", "blitz", "rapid", "classical", "correspondence"].includes(t)) {
      if (t === "ultraBullet" || t === "bullet") return "bullet";
      if (t === "blitz") return "blitz";
      if (t === "rapid" || t === "classical") return "rapid";
      if (t === "correspondence") return "daily";
    }
  }
  if (platform === "chesscom") {
    if (t === "bullet") return "bullet";
    if (t === "blitz") return "blitz";
    if (t === "rapid") return "rapid";
    if (t === "daily") return "daily";
  }
  return "unknown";
}

function parseClockComments(pgn: string): number[] {
  const clocks: number[] = [];
  const re = /\{[%\[]clk\s+([0-9:]+)[%\]]\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pgn)) !== null) {
    const parts = m[1].split(":").map(Number);
    if (parts.length === 3) {
      clocks.push(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    } else if (parts.length === 2) {
      clocks.push(parts[0] * 60 + parts[1]);
    }
  }
  return clocks;
}

function parseTermination(pgn: string): string | undefined {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return undefined;
  }
  return chess.header().Termination ?? undefined;
}

export function normalizeRawGame(
  raw: RawGame,
  platform: ScoutPlatform,
  username: string
): NormalizedGame | null {
  const isWhite = normalizeUsername(raw.white, username);
  const isBlack = normalizeUsername(raw.black, username);
  if (!isWhite && !isBlack) return null;

  const color = isWhite ? "white" : "black";
  const opponent = isWhite ? raw.black : raw.white;
  const chess = new Chess();
  try {
    chess.loadPgn(raw.pgn);
  } catch {
    return null;
  }

  const history = chess.history({ verbose: true });
  const clocks = parseClockComments(raw.pgn);
  const moves: NormalizedMove[] = history.map((m, i) => ({
    san: m.san,
    clockSeconds: clocks[i],
  }));
  const moveSans = history.map((m) => m.san);

  const opening =
    raw.openingName && raw.openingEco
      ? { name: raw.openingName, eco: raw.openingEco }
      : detectOpeningFromPgn(raw.pgn);

  return {
    id: raw.id,
    date: raw.playedAt ?? new Date(0).toISOString(),
    platform,
    opponent,
    opponentRating: raw.opponentRating,
    color,
    result: parseResult(raw.result, color),
    timeControl: raw.timeControl,
    speed: inferSpeed(raw.timeControl, platform),
    eco: opening.eco,
    openingName: opening.name,
    moves,
    moveSans,
    termination: parseTermination(raw.pgn),
    pgn: raw.pgn,
    gameUrl: raw.gameUrl,
  };
}

export function normalizeRawGames(
  rawGames: RawGame[],
  platform: ScoutPlatform,
  username: string
): NormalizedGame[] {
  const out: NormalizedGame[] = [];
  for (const raw of rawGames) {
    const g = normalizeRawGame(raw, platform, username);
    if (g) out.push(g);
  }
  return out;
}

export function filterGamesByMonths(
  games: NormalizedGame[],
  monthsBack: number
): NormalizedGame[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  return games.filter((g) => new Date(g.date) >= cutoff);
}
