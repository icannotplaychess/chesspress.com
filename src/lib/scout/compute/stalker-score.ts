import type { NormalizedGame } from "@/lib/scout/normalized-game";
import { STALKER_SIGNAL_WEIGHTS, THRESHOLDS } from "@/lib/scout/scoring-config";

export interface StalkerSignals {
  timeTrouble: number;
  tiltsEasily: number;
  limitedRepertoire: number;
  repetitivePatterns: number;
}

export interface StalkerScoreResult {
  score: number;
  label: "Low" | "Medium" | "High";
  signals: StalkerSignals;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function ecoDiversity(games: NormalizedGame[]): number {
  const ecos = new Set(games.map((g) => g.eco).filter(Boolean));
  const maxExpected = Math.min(20, games.length);
  return ecos.size / maxExpected;
}

function lineRepetitionRate(games: NormalizedGame[]): number {
  const keys = games.map((g) => g.moveSans.slice(0, 8).join(" "));
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  let repeated = 0;
  for (const c of counts.values()) if (c > 1) repeated += c;
  return games.length ? repeated / games.length : 0;
}

export function computeStalkerScore(games: NormalizedGame[]): StalkerScoreResult {
  if (games.length === 0) {
    return {
      score: 50,
      label: "Medium",
      signals: {
        timeTrouble: 0,
        tiltsEasily: 0,
        limitedRepertoire: 0,
        repetitivePatterns: 0,
      },
    };
  }

  const withClock = games.filter((g) =>
    g.moves.some((m) => m.clockSeconds !== undefined)
  );
  const under30 = withClock.filter((g) =>
    g.moves.some((m) => (m.clockSeconds ?? 999) < 30)
  ).length;
  const timeTrouble = clamp(
    withClock.length ? (under30 / withClock.length) * 100 : 20
  );

  let afterLoss = 0;
  let afterLossScore = 0;
  for (let i = 1; i < games.length; i++) {
    if (games[i - 1].result === "loss") {
      afterLoss++;
      const pts = games[i].result === "win" ? 1 : games[i].result === "draw" ? 0.5 : 0;
      afterLossScore += pts;
    }
  }
  const recoveryRate = afterLoss ? afterLossScore / afterLoss : 0.5;
  const tiltsEasily = clamp((1 - recoveryRate) * 100 + THRESHOLDS.tiltDropPercent * 0.5);

  const diversity = ecoDiversity(games);
  const limitedRepertoire = clamp((1 - diversity) * 100);

  const repetition = lineRepetitionRate(games);
  const repetitivePatterns = clamp(repetition * 100);

  const w = STALKER_SIGNAL_WEIGHTS;
  const score = clamp(
    timeTrouble * w.timeTrouble +
      tiltsEasily * w.tiltsEasily +
      limitedRepertoire * w.limitedRepertoire +
      repetitivePatterns * w.repetitivePatterns
  );

  const label: StalkerScoreResult["label"] =
    score < 35 ? "Low" : score < 65 ? "Medium" : "High";

  return {
    score,
    label,
    signals: {
      timeTrouble,
      tiltsEasily,
      limitedRepertoire,
      repetitivePatterns,
    },
  };
}
