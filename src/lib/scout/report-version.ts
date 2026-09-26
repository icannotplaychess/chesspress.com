/** Bump when cached report JSON shape changes (invalidates old DB rows). */
export const SCOUT_REPORT_VERSION = 2;

export function isCompleteScoutReport(report: unknown): boolean {
  if (!report || typeof report !== "object") return false;
  const r = report as Record<string, unknown>;
  return (
    r.reportVersion === SCOUT_REPORT_VERSION &&
    r.subScores !== undefined &&
    r.openingsByColor !== undefined
  );
}
