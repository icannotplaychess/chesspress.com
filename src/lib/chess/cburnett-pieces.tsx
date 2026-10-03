import type { PieceRenderObject } from "react-chessboard";

const PIECE_TYPES = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"] as const;

function CburnettPiece({ pieceType }: { pieceType: string }) {
  return (
    <img
      src={`/pieces/cburnett/${pieceType}.svg`}
      alt=""
      draggable={false}
      className="w-[88%] h-[88%] object-contain pointer-events-none"
    />
  );
}

export const cburnettPieces: PieceRenderObject = Object.fromEntries(
  PIECE_TYPES.map((type) => [
    type,
    () => <CburnettPiece pieceType={type} />,
  ])
) as PieceRenderObject;
