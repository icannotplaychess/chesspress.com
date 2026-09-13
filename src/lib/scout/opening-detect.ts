import { Chess } from "chess.js";
import openings from "@/data/openings.json";

interface OpeningEntry {
  eco: string;
  name: string;
  uciMoves: string[];
}

const BOOK = openings as OpeningEntry[];

export function detectOpeningFromPgn(pgn: string): { eco?: string; name?: string } {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return {};
  }

  const history = chess.history({ verbose: true });
  const uciMoves: string[] = history.map(
    (m) => m.from + m.to + (m.promotion ?? "")
  );

  let best: OpeningEntry | null = null;
  for (const entry of BOOK) {
    if (entry.uciMoves.length > (best?.uciMoves.length ?? 0)) {
      let matches = true;
      for (let i = 0; i < entry.uciMoves.length; i++) {
        if (uciMoves[i] !== entry.uciMoves[i]) {
          matches = false;
          break;
        }
      }
      if (matches && entry.uciMoves.length >= 2) {
        best = entry;
      }
    }
  }

  if (best) return { eco: best.eco, name: best.name };

  // Shorter prefix match
  for (const entry of BOOK) {
    if (entry.uciMoves.length < 2) continue;
    let matches = true;
    for (let i = 0; i < entry.uciMoves.length; i++) {
      if (uciMoves[i] !== entry.uciMoves[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return { eco: entry.eco, name: entry.name };
  }

  return {};
}
