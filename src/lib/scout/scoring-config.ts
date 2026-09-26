/** Tunable weights for scout metrics — adjust without touching logic. */

export const SUB_SCORE_WEIGHTS = {
  overall: { atk: 0.25, def: 0.25, time: 0.25, mind: 0.25 },
};

export const STALKER_SIGNAL_WEIGHTS = {
  timeTrouble: 0.28,
  tiltsEasily: 0.32,
  limitedRepertoire: 0.2,
  repetitivePatterns: 0.2,
};

export const THRESHOLDS = {
  openingMinGames: 5,
  weaknessWinRate: 0.45,
  strengthWinRate: 0.55,
  tiltDropPercent: 15,
  timeUnder30Percent: 12,
  repertoireLowDiversity: 0.35,
  repetitionHigh: 0.45,
  trapChecklistMin: 1,
  resignMoveAvg: 22,
  losingStreakConcern: 5,
};
