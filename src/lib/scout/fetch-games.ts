import { Chess } from "chess.js";
import type { ScoutPlatform } from "@/lib/scout/types";

export interface RawGame {
  id: string;
  pgn: string;
  white: string;
  black: string;
  result: string;
  timeControl: string;
  playedAt?: string;
  openingEco?: string;
  openingName?: string;
}

const MAX_GAMES = 200;

export async function fetchPlayerGames(
  platform: ScoutPlatform,
  username: string,
  maxGames = MAX_GAMES
): Promise<RawGame[]> {
  if (platform === "lichess") {
    return fetchLichessGames(username, maxGames);
  }
  return fetchChesscomGames(username, maxGames);
}

export async function fetchPlayerProfile(
  platform: ScoutPlatform,
  username: string
): Promise<{ exists: boolean; title?: string; ratings: Record<string, number> }> {
  if (platform === "lichess") {
    const res = await fetch(`https://lichess.org/api/user/${username}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return { exists: false, ratings: {} };
    if (!res.ok) throw new Error("Lichess API unavailable");
    const data = await res.json();
    const perfs = data.perfs ?? {};
    const ratings: Record<string, number> = {};
    for (const [key, val] of Object.entries(perfs)) {
      const p = val as { rating?: number };
      if (p.rating) ratings[key] = p.rating;
    }
    return { exists: true, title: data.title, ratings };
  }

  const res = await fetch(`https://api.chess.com/pub/player/${username}`, {
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return { exists: false, ratings: {} };
  if (!res.ok) throw new Error("Chess.com API unavailable");
  const data = await res.json();
  const ratings: Record<string, number> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (typeof val === "object" && val && "last" in val) {
      ratings[key] = (val as { last: number }).last;
    }
  }
  return { exists: true, title: data.title, ratings };
}

async function fetchLichessGames(
  username: string,
  maxGames: number
): Promise<RawGame[]> {
  const res = await fetch(
    `https://lichess.org/api/games/user/${username}?max=${maxGames}&pgnInJson=true&clocks=false&evals=false&opening=true`,
    { headers: { Accept: "application/x-ndjson" } }
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("Could not fetch Lichess games");

  const text = await res.text();
  const lines = text.trim().split("\n").filter(Boolean);
  const games: RawGame[] = [];

  for (const line of lines) {
    try {
      const g = JSON.parse(line);
      const pgn = g.pgn as string;
      if (!pgn) continue;
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch {
        continue;
      }
      const headers = chess.header();
      games.push({
        id: g.id ?? `lichess-${games.length}`,
        pgn,
        white: headers.White ?? g.players?.white?.user?.name ?? "?",
        black: headers.Black ?? g.players?.black?.user?.name ?? "?",
        result: headers.Result ?? "*",
        timeControl: g.speed ?? headers.TimeControl ?? "unknown",
        playedAt: g.createdAt ? new Date(g.createdAt).toISOString() : undefined,
        openingEco: g.opening?.eco,
        openingName: g.opening?.name,
      });
    } catch {
      continue;
    }
  }
  return games;
}

async function fetchChesscomGames(
  username: string,
  maxGames: number
): Promise<RawGame[]> {
  const archivesRes = await fetch(
    `https://api.chess.com/pub/player/${username}/games/archives`,
    { next: { revalidate: 3600 } }
  );
  if (archivesRes.status === 404) return [];
  if (!archivesRes.ok) throw new Error("Could not fetch Chess.com archives");

  const { archives } = await archivesRes.json();
  const games: RawGame[] = [];

  for (const url of (archives as string[]).reverse()) {
    if (games.length >= maxGames) break;
    const monthRes = await fetch(url, { next: { revalidate: 3600 } });
    if (!monthRes.ok) continue;
    const monthData = await monthRes.json();
    for (const g of monthData.games ?? []) {
      if (games.length >= maxGames) break;
      if (!g.pgn) continue;
      const chess = new Chess();
      try {
        chess.loadPgn(g.pgn);
      } catch {
        continue;
      }
      const headers = chess.header();
      games.push({
        id: g.url ?? `chesscom-${games.length}`,
        pgn: g.pgn,
        white: headers.White ?? g.white?.username ?? "?",
        black: headers.Black ?? g.black?.username ?? "?",
        result: headers.Result ?? "*",
        timeControl: g.time_class ?? headers.TimeControl ?? "unknown",
        playedAt: g.end_time ? new Date(g.end_time * 1000).toISOString() : undefined,
        openingEco: g.eco,
        openingName: g.opening,
      });
    }
  }
  return games;
}
