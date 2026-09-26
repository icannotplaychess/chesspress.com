import type { NormalizedGame } from "@/lib/scout/normalized-game";
import { SUB_SCORE_WEIGHTS } from "@/lib/scout/scoring-config";

export interface SubScores {
  atk: number;
  def: number;
  time: number;
  mind: number;
  overall: number;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * First-pass sub-scores (0–100). Documented formulas for later tuning.
 * ATK: win rate + share of wins as the side that moved first in the sample.
 * DEF: score when losing streaks stay short + draw rate when behind (proxy: draw rate).
 * TIME: inverse of low-clock games + resignation under time pressure proxy.
 * MIND: tilt resistance + resignation discipline + streak recovery.
 */
export function computeSubScores(games: NormalizedGame[]): SubScores {
  if (games.length === 0) {
    return { atk: 50, def: 50, time: 50, mind: 50, overall: 50 };
  }

  const wins = games.filter((g) => g.result === "win").length;
  const draws = games.filter((g) => g.result === "draw").length;
  const winRate = wins / games.length;
  const drawRate = draws / games.length;

  const whiteFirstWins = games.filter(
    (g) => g.color === "white" && g.result === "win"
  ).length;
  const whiteGames = games.filter((g) => g.color === "white").length;
  const whiteWinRate = whiteGames ? whiteFirstWins / whiteGames : winRate;

  const atk = clamp(winRate * 70 + whiteWinRate * 30);

  let maxLossStreak = 0;
  let streak = 0;
  for (const g of games) {
    if (g.result === "loss") {
      streak++;
      maxLossStreak = Math.max(maxLossStreak, streak);
    } else streak = 0;
  }
  const def = clamp(drawRate * 40 + (100 - maxLossStreak * 8) + winRate * 20);

  const withClock = games.filter((g) =>
    g.moves.some((m) => m.clockSeconds !== undefined)
  );
  const under30 = withClock.filter((g) =>
    g.moves.some((m) => (m.clockSeconds ?? 999) < 30)
  ).length;
  const timeTroubleRate = withClock.length ? under30 / withClock.length : 0;
  const timeoutLosses = games.filter((g) =>
    (g.termination ?? "").toLowerCase().includes("time")
  ).length;
  const time = clamp(100 - timeTroubleRate * 80 - (timeoutLosses / games.length) * 40);

  let afterLoss = 0;
  let afterLossWins = 0;
  for (let i = 1; i < games.length; i++) {
    if (games[i - 1].result === "loss") {
      afterLoss++;
      if (games[i].result === "win") afterLossWins++;
    }
  }
  const recovery = afterLoss ? afterLossWins / afterLoss : 0.5;
  const resigns = games.filter((g) =>
    (g.termination ?? "").toLowerCase().includes("resign")
  ).length;
  const resignRate = resigns / games.length;
  const mind = clamp(recovery * 50 + (1 - resignRate) * 30 + (100 - maxLossStreak * 6));

  const w = SUB_SCORE_WEIGHTS.overall;
  const overall = clamp(
    atk * w.atk + def * w.def + time * w.time + mind * w.mind
  );

  return { atk, def, time, mind, overall };
}
