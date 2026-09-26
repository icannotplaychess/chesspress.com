import type { NormalizedGame } from "@/lib/scout/normalized-game";

export interface PsychologyMetrics {
  radar: {
    stability: number;
    tilt: number;
    resigns: number;
    streak: number;
    clock: number;
    recovery: number;
  };
  table: {
    stability: { value: number; label: string };
    tilt: { value: number; label: string };
    postLossRecovery: { value: number; label: string };
    timeouts: { value: number; label: string };
    maxLosingStreak: { value: number; label: string };
    resigns: { value: number; label: string };
  };
}

function labelStability(v: number): string {
  return v < 40 ? "Unstable" : v < 70 ? "Average" : "Stable";
}

export function computePsychology(games: NormalizedGame[]): PsychologyMetrics {
  if (games.length === 0) {
    const z = 50;
    return {
      radar: { stability: z, tilt: z, resigns: z, streak: z, clock: z, recovery: z },
      table: {
        stability: { value: z, label: "Average" },
        tilt: { value: 0, label: "Resilient" },
        postLossRecovery: { value: 50, label: "Average" },
        timeouts: { value: 0, label: "Good" },
        maxLosingStreak: { value: 0, label: "Normal" },
        resigns: { value: 0, label: "Normal" },
      },
    };
  }

  let maxLoss = 0;
  let streak = 0;
  for (const g of games) {
    if (g.result === "loss") {
      streak++;
      maxLoss = Math.max(maxLoss, streak);
    } else streak = 0;
  }

  let afterLoss = 0;
  let afterLossWins = 0;
  for (let i = 1; i < games.length; i++) {
    if (games[i - 1].result === "loss") {
      afterLoss++;
      if (games[i].result === "win") afterLossWins++;
    }
  }
  const recoveryPct = afterLoss ? Math.round((afterLossWins / afterLoss) * 100) : 50;
  const tiltPct = Math.max(0, 100 - recoveryPct);

  const resignCount = games.filter((g) =>
    (g.termination ?? "").toLowerCase().includes("resign")
  ).length;
  const resignPct = Math.round((resignCount / games.length) * 100);

  const timeoutCount = games.filter((g) =>
    (g.termination ?? "").toLowerCase().includes("time")
  ).length;
  const timeoutPct = Math.round((timeoutCount / games.length) * 100);

  const withClock = games.filter((g) =>
    g.moves.some((m) => m.clockSeconds !== undefined)
  );
  const under30 = withClock.filter((g) =>
    g.moves.some((m) => (m.clockSeconds ?? 999) < 30)
  ).length;
  const clockStress = withClock.length
    ? Math.round((under30 / withClock.length) * 100)
    : 20;

  const stability = Math.max(0, 100 - maxLoss * 10 - tiltPct * 0.3);

  return {
    radar: {
      stability: Math.round(stability),
      tilt: tiltPct,
      resigns: resignPct,
      streak: Math.min(100, maxLoss * 12),
      clock: clockStress,
      recovery: recoveryPct,
    },
    table: {
      stability: { value: Math.round(stability), label: labelStability(stability) },
      tilt: {
        value: tiltPct,
        label: tiltPct >= 50 ? "Tilt prone" : "Resilient",
      },
      postLossRecovery: {
        value: recoveryPct,
        label: recoveryPct >= 55 ? "Good" : recoveryPct >= 40 ? "Average" : "Poor",
      },
      timeouts: {
        value: timeoutPct,
        label: timeoutPct <= 5 ? "Good" : "Bad",
      },
      maxLosingStreak: {
        value: maxLoss,
        label: maxLoss >= 6 ? "Concerning" : "Normal",
      },
      resigns: {
        value: resignPct,
        label: resignPct >= 40 ? "High" : "Normal",
      },
    },
  };
}
