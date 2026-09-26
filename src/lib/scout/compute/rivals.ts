import type { NormalizedGame } from "@/lib/scout/normalized-game";

export interface RivalRow {
  username: string;
  rating?: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
}

export function computeFrequentRivals(games: NormalizedGame[]): {
  rivals: RivalRow[];
  rivalCount: number;
  nemesisCount: number;
} {
  const map = new Map<
    string,
    { rating?: number; w: number; d: number; l: number }
  >();

  for (const g of games) {
    const key = g.opponent.toLowerCase();
    const row = map.get(key) ?? {
      rating: g.opponentRating,
      w: 0,
      d: 0,
      l: 0,
    };
    if (g.opponentRating) row.rating = g.opponentRating;
    if (g.result === "win") row.w++;
    else if (g.result === "draw") row.d++;
    else row.l++;
    map.set(key, row);
  }

  const rivals: RivalRow[] = [...map.entries()]
    .map(([username, v]) => {
      const gamesCount = v.w + v.d + v.l;
      return {
        username,
        rating: v.rating,
        games: gamesCount,
        wins: v.w,
        draws: v.d,
        losses: v.l,
        winRate: gamesCount ? v.w / gamesCount : 0,
      };
    })
    .filter((r) => r.games >= 2)
    .sort((a, b) => b.games - a.games)
    .slice(0, 12);

  const nemesisCount = rivals.filter((r) => r.winRate < 0.4).length;

  return {
    rivals,
    rivalCount: rivals.length,
    nemesisCount,
  };
}

export function computeHeadToHead(games: NormalizedGame[]): RivalRow[] {
  return computeFrequentRivals(games).rivals;
}
