/** Convert centipawn score to a normalized eval for the bar (-1 to 1, mates clamped). */
export function cpToBarValue(cp: number, mate: number | null): number {
  if (mate !== null) {
    const sign = mate > 0 ? 1 : -1;
    const distance = Math.min(Math.abs(mate), 10);
    return sign * (1 - (distance - 1) * 0.08);
  }
  const clamped = Math.max(-1000, Math.min(1000, cp));
  return Math.tanh(clamped / 400);
}

/** Format evaluation for display (White-positive). */
export function formatEvaluation(
  cp: number | null,
  mate: number | null,
  perspective: "white" | "black" = "white"
): string {
  let displayCp = cp;
  let displayMate = mate;

  if (perspective === "black") {
    displayCp = displayCp !== null ? -displayCp : null;
    displayMate = displayMate !== null ? -displayMate : null;
  }

  if (displayMate !== null) {
    const m = Math.abs(displayMate);
    return displayMate > 0 ? `M${m}` : `-M${m}`;
  }

  if (displayCp === null) return "—";
  const pawns = displayCp / 100;
  const sign = pawns > 0 ? "+" : "";
  return `${sign}${pawns.toFixed(2)}`;
}

/** Win probability from centipawns (Lichess-style). */
export function cpToWinPercent(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

/** Get eval from white's perspective given side to move. */
export function toWhitePerspective(
  cp: number | null,
  mate: number | null,
  sideToMove: "w" | "b"
): { cp: number; mate: number | null } {
  const sign = sideToMove === "w" ? 1 : -1;
  return {
    cp: (cp ?? 0) * sign,
    mate: mate !== null ? mate * sign : null,
  };
}
