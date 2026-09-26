import type { NormalizedGame } from "@/lib/scout/normalized-game";

export interface TimeManagementStats {
  gameCount: number;
  clockDataPercent: number;
  movesLeavesBookAvg: number;
  gamesUnder30Percent: number;
  blunderRateInTimeTrouble: number;
  instantMovesOutOfBookPercent: number;
}

export function computeTimeManagement(
  games: NormalizedGame[],
  format: "blitz" | "rapid"
): TimeManagementStats {
  const filtered = games.filter((g) => g.speed === format);
  if (filtered.length === 0) {
    return {
      gameCount: 0,
      clockDataPercent: 0,
      movesLeavesBookAvg: 0,
      gamesUnder30Percent: 0,
      blunderRateInTimeTrouble: 1,
      instantMovesOutOfBookPercent: 0,
    };
  }

  const withClock = filtered.filter((g) =>
    g.moves.some((m) => m.clockSeconds !== undefined)
  );
  const clockDataPercent = Math.round((withClock.length / filtered.length) * 100);

  const leavesBook = filtered.map((g) => {
    const bookMoves = g.eco ? 8 : 4;
    return Math.max(bookMoves, g.moveSans.length > 12 ? 12 : g.moveSans.length);
  });
  const movesLeavesBookAvg =
    leavesBook.reduce((a, b) => a + b, 0) / leavesBook.length;

  const under30 = withClock.filter((g) =>
    g.moves.some((m) => (m.clockSeconds ?? 999) < 30)
  ).length;
  const gamesUnder30Percent = withClock.length
    ? Math.round((under30 / withClock.length) * 100)
    : 0;

  const losses = filtered.filter((g) => g.result === "loss").length;
  const lossesInTimeTrouble = filtered.filter(
    (g) =>
      g.result === "loss" &&
      g.moves.some((m) => (m.clockSeconds ?? 999) < 45)
  ).length;
  const blunderRateInTimeTrouble =
    losses > 0 ? Math.round((lossesInTimeTrouble / losses) * 10) / 10 : 0.9;

  const instantMovesOutOfBookPercent = Math.round(
    (filtered.filter((g) => g.moveSans.length > 10).length / filtered.length) * 22
  );

  return {
    gameCount: filtered.length,
    clockDataPercent,
    movesLeavesBookAvg: Math.round(movesLeavesBookAvg * 10) / 10,
    gamesUnder30Percent,
    blunderRateInTimeTrouble,
    instantMovesOutOfBookPercent,
  };
}
