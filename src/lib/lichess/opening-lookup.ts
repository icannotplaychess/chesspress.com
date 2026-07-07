import openings from "@/data/openings.json";

interface OpeningEntry {
  eco: string;
  name: string;
  uciMoves: string[];
}

const OPENINGS = openings as OpeningEntry[];

export function lookupOpening(uciMoves: string[]): {
  eco: string;
  name: string;
  isInTheory: boolean;
} | null {
  if (uciMoves.length === 0) return null;

  let bestMatch: OpeningEntry | null = null;

  for (const opening of OPENINGS) {
    if (opening.uciMoves.length > uciMoves.length) continue;

    const matches = opening.uciMoves.every(
      (move, i) => move === uciMoves[i]
    );

    if (matches && (!bestMatch || opening.uciMoves.length > bestMatch.uciMoves.length)) {
      bestMatch = opening;
    }
  }

  if (!bestMatch) return null;

  const isInTheory = OPENINGS.some((opening) => {
    if (opening.uciMoves.length < uciMoves.length) return false;
    return uciMoves.every((move, i) => move === opening.uciMoves[i]);
  });

  return {
    eco: bestMatch.eco,
    name: bestMatch.name,
    isInTheory,
  };
}
