import type { CSSProperties } from "react";
import type { Arrow, ChessboardOptions } from "react-chessboard";
import { cburnettPieces } from "@/lib/chess/cburnett-pieces";

export const LAST_MOVE_HIGHLIGHT = "rgba(155, 199, 0, 0.41)";

export const ENGINE_ARROW_COLOR = "rgba(25, 195, 160, 0.75)";

export function buildBoardOptions(
  partial: ChessboardOptions & {
    squareStyles?: Record<string, CSSProperties>;
  }
): ChessboardOptions {
  return {
    pieces: cburnettPieces,
    darkSquareStyle: { backgroundColor: "var(--sqd)" },
    lightSquareStyle: { backgroundColor: "var(--sql)" },
    boardStyle: {
      borderRadius: "10px",
      border: "1px solid var(--line)",
      boxShadow: "none",
    },
    darkSquareNotationStyle: { color: "var(--sql)" },
    lightSquareNotationStyle: { color: "var(--sqd)" },
    alphaNotationStyle: {
      fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
      fontSize: "10px",
      fontWeight: 500,
    },
    numericNotationStyle: {
      fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
      fontSize: "10px",
      fontWeight: 500,
    },
    animationDurationInMs: 200,
    showNotation: true,
    ...partial,
  };
}

export function engineArrow(fromUci: string): Arrow | null {
  if (fromUci.length < 4) return null;
  return {
    startSquare: fromUci.slice(0, 2),
    endSquare: fromUci.slice(2, 4),
    color: ENGINE_ARROW_COLOR,
  };
}
