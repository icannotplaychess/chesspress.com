import { Chess } from "chess.js";
import type { NormalizedGame } from "@/lib/scout/normalized-game";

export interface EndgameRow {
  type: string;
  games: number;
  winRate: number;
}

function classifyEndgame(pgn: string): string {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return "Unknown";
  }
  const board = chess.board().flat().filter(Boolean);
  const queens = board.filter((p) => p?.type === "q").length;
  const rooks = board.filter((p) => p?.type === "r").length;
  const minors = board.filter((p) => p?.type === "n" || p?.type === "b").length;
  const pawns = board.filter((p) => p?.type === "p").length;

  if (queens === 0 && rooks === 0 && minors <= 2) return "King and pawn";
  if (queens === 0 && rooks === 2) return "Rook endgame";
  if (queens === 0 && rooks === 1) return "Rook + minor";
  if (queens >= 1 && rooks === 0) return "Queen endgame";
  if (pawns <= 6 && queens === 0) return "Light piece endgame";
  return "Complex middlegame/endgame";
}

export function computeEndgameStatistics(games: NormalizedGame[]): EndgameRow[] {
  const map = new Map<string, { w: number; total: number }>();
  for (const g of games) {
    if (g.moveSans.length < 40) continue;
    const type = classifyEndgame(g.pgn);
    const row = map.get(type) ?? { w: 0, total: 0 };
    row.total++;
    if (g.result === "win") row.w++;
    map.set(type, row);
  }

  return [...map.entries()]
    .map(([type, v]) => ({
      type,
      games: v.total,
      winRate: v.total ? v.w / v.total : 0,
    }))
    .filter((r) => r.games >= 3)
    .sort((a, b) => b.games - a.games);
}
