import fs from "fs";
import path from "path";
import { Chess } from "chess.js";

interface OpeningEntry {
  eco: string;
  name: string;
  uciMoves: string[];
}

let openingCache: OpeningEntry[] | null = null;

function loadOpenings(): OpeningEntry[] {
  if (openingCache) return openingCache;

  const dir = path.join(process.cwd(), "src/data/openings");
  const files = ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"];
  const entries: OpeningEntry[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    const lines = content.split("\n").slice(1);

    for (const line of lines) {
      if (!line.trim()) continue;
      const [eco, name, pgn] = line.split("\t");
      if (!eco || !name || !pgn) continue;

      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch {
        continue;
      }

      const uciMoves = chess
        .history({ verbose: true })
        .map((m) => m.from + m.to + (m.promotion ?? ""));

      entries.push({ eco, name, uciMoves });
    }
  }

  openingCache = entries;
  return openingCache;
}

export function lookupOpening(uciMoves: string[]): {
  eco: string;
  name: string;
  isInTheory: boolean;
} | null {
  const openings = loadOpenings();

  let bestMatch: OpeningEntry | null = null;

  for (const opening of openings) {
    if (opening.uciMoves.length > uciMoves.length) continue;

    const matches = opening.uciMoves.every(
      (move, i) => move === uciMoves[i]
    );

    if (matches && (!bestMatch || opening.uciMoves.length > bestMatch.uciMoves.length)) {
      bestMatch = opening;
    }
  }

  if (!bestMatch) return null;

  const isInTheory = openings.some((opening) => {
    if (opening.uciMoves.length < uciMoves.length) return false;
    return uciMoves.every((move, i) => move === opening.uciMoves[i]);
  });

  return {
    eco: bestMatch.eco,
    name: bestMatch.name,
    isInTheory,
  };
}
