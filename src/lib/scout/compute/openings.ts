import type { NormalizedGame } from "@/lib/scout/normalized-game";
import { THRESHOLDS } from "@/lib/scout/scoring-config";

export interface OpeningLineStat {
  name: string;
  eco?: string;
  moves: string;
  gameCount: number;
  lastPlayed: string;
  winRate: number;
}

function openingKey(g: NormalizedGame): string {
  const name = g.openingName ?? "Unknown";
  const line = g.moveSans.slice(0, 6).join(" ");
  return `${g.eco ?? ""}:${name}:${line}`;
}

function aggregate(
  games: NormalizedGame[]
): Map<string, OpeningLineStat & { wins: number }> {
  const map = new Map<string, OpeningLineStat & { wins: number }>();
  for (const g of games) {
    const key = openingKey(g);
    const existing = map.get(key) ?? {
      name: g.openingName ?? "Unknown",
      eco: g.eco,
      moves: g.moveSans.slice(0, 8).join(" "),
      gameCount: 0,
      lastPlayed: g.date,
      winRate: 0,
      wins: 0,
    };
    existing.gameCount++;
    if (g.result === "win") existing.wins++;
    if (new Date(g.date) > new Date(existing.lastPlayed)) {
      existing.lastPlayed = g.date;
    }
    existing.winRate = existing.wins / existing.gameCount;
    map.set(key, existing);
  }
  return map;
}

export function computeOpeningBreakdown(
  games: NormalizedGame[],
  color: "white" | "black"
): { weaknesses: OpeningLineStat[]; strengths: OpeningLineStat[] } {
  const filtered = games.filter((g) => g.color === color);
  const map = aggregate(filtered);
  const stats = [...map.values()].filter(
    (s) => s.gameCount >= THRESHOLDS.openingMinGames
  );

  const weaknesses = stats
    .filter((s) => s.winRate <= THRESHOLDS.weaknessWinRate)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 6)
    .map(({ wins: _w, ...rest }) => rest);

  const strengths = stats
    .filter((s) => s.winRate >= THRESHOLDS.strengthWinRate)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 6)
    .map(({ wins: _w, ...rest }) => rest);

  return { weaknesses, strengths };
}
