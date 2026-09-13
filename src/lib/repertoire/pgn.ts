import { Chess } from "chess.js";
import type { RepertoireLine, RepertoireMove } from "@/lib/repertoire/types";
import { createInitialMemory } from "@/lib/repertoire/spaced-repetition";

export function lineFromPgn(
  pgn: string,
  name: string,
  eco?: string
): RepertoireLine | null {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return null;
  }

  const temp = new Chess();
  const moves: RepertoireMove[] = [];

  for (const san of chess.history()) {
    const result = temp.move(san);
    if (!result) return null;
    moves.push({
      san: result.san,
      uci: result.from + result.to + (result.promotion ?? ""),
      fen: temp.fen(),
    });
  }

  if (moves.length === 0) return null;

  return {
    id: crypto.randomUUID(),
    name,
    eco,
    moves,
    memory: createInitialMemory(),
  };
}

export function lineToPgn(line: RepertoireLine): string {
  const chess = new Chess();
  for (const move of line.moves) {
    chess.move(move.san);
  }
  return chess.pgn();
}

export function repertoireToPgn(lines: RepertoireLine[]): string {
  return lines.map((l) => lineToPgn(l)).join("\n\n");
}
