/** Session key for passing a full PGN from Scout → Analysis (URLs truncate long games). */
export const ANALYSIS_PGN_KEY = "chesspress:analysis-pgn";

export function storeAnalysisPgn(pgn: string): void {
  sessionStorage.setItem(ANALYSIS_PGN_KEY, pgn);
}

export function consumeAnalysisPgn(): string | null {
  const pgn = sessionStorage.getItem(ANALYSIS_PGN_KEY);
  if (pgn) sessionStorage.removeItem(ANALYSIS_PGN_KEY);
  return pgn;
}
