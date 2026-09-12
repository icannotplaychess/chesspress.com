import { Chess } from "chess.js";
import openings from "@/data/openings.json";

interface OpeningEntry {
  eco: string;
  name: string;
  uciMoves: string[];
}

const OPENINGS = openings as OpeningEntry[];

export interface OpeningSearchResult {
  eco: string;
  name: string;
  uciMoves: string[];
  moveCount: number;
}

export function searchOpenings(query: string, limit = 20): OpeningSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return OPENINGS
    .filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.eco.toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map((o) => ({
      eco: o.eco,
      name: o.name,
      uciMoves: o.uciMoves,
      moveCount: o.uciMoves.length,
    }));
}

export function playOpeningMoves(uciMoves: string[]): {
  moves: Array<{ san: string; uci: string; fen: string }>;
  finalFen: string;
} {
  const chess = new Chess();
  const moves: Array<{ san: string; uci: string; fen: string }> = [];

  for (const uci of uciMoves) {
    const result = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    });
    if (!result) break;
    moves.push({
      san: result.san,
      uci,
      fen: chess.fen(),
    });
  }

  return { moves, finalFen: chess.fen() };
}
