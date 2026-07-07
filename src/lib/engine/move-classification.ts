import type { MoveClassification } from "@/lib/types";

/**
 * Classify a move from Stockfish evaluations.
 * cpLoss is measured from the moving player's perspective (higher = worse).
 */
export function classifyMove(params: {
  isBestMove: boolean;
  cpLoss: number;
  bestCpSwing: number;
  playedAllowsMate: boolean;
  bestWasMate: boolean;
  playedMissedMate: boolean;
}): MoveClassification {
  const {
    isBestMove,
    cpLoss,
    bestCpSwing,
    playedAllowsMate,
    bestWasMate,
    playedMissedMate,
  } = params;

  if (playedMissedMate || (bestWasMate && !isBestMove && bestCpSwing >= 200)) {
    return "miss";
  }

  if (playedAllowsMate && cpLoss >= 300) {
    return "blunder";
  }

  if (isBestMove) {
    return "best";
  }

  if (cpLoss < 10) return "great";
  if (cpLoss < 50) return "good";
  if (cpLoss < 100) return "inaccuracy";
  if (cpLoss < 300) return "mistake";
  return "blunder";
}

export const CLASSIFICATION_COLORS: Record<MoveClassification, string> = {
  brilliant: "#1baca6",
  best: "#81b64c",
  great: "#5c8bb0",
  good: "#96bc4b",
  book: "#a88865",
  inaccuracy: "#f0c15d",
  mistake: "#e58f2a",
  miss: "#ff7769",
  blunder: "#ca3431",
};

export const CLASSIFICATION_LABELS: Record<MoveClassification, string> = {
  brilliant: "!!",
  best: "Best",
  great: "Great",
  good: "Good",
  book: "Book",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  miss: "Miss",
  blunder: "Blunder",
};
