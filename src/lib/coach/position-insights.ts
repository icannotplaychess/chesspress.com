import { Chess, type Square } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

export interface PositionInsights {
  sideToMove: "white" | "black";
  materialDelta: number;
  materialText: string;
  inCheck: boolean;
  canCastle: { white: boolean; black: boolean };
  centerOccupancy: string;
  pawnStructure: string;
  pieceActivity: string;
}

function countMaterial(fen: string): { white: number; black: number } {
  const board = fen.split(" ")[0];
  let white = 0;
  let black = 0;
  for (const ch of board) {
    const lower = ch.toLowerCase();
    if (!PIECE_VALUES[lower]) continue;
    if (ch === lower) black += PIECE_VALUES[lower];
    else white += PIECE_VALUES[lower];
  }
  return { white, black };
}

function describeMaterial(delta: number): string {
  if (delta === 0) return "Material is even.";
  const side = delta > 0 ? "White" : "Black";
  const pawns = Math.abs(delta);
  if (pawns === 1) return `${side} is up a pawn.`;
  if (pawns < 4) return `${side} leads by about ${pawns} pawn${pawns > 1 ? "s" : ""} of material.`;
  return `${side} has a significant material advantage.`;
}

function centerSummary(chess: Chess): string {
  const squares: Square[] = ["d4", "d5", "e4", "e5"];
  const white = squares.filter((sq) => chess.get(sq)?.color === "w").length;
  const black = squares.filter((sq) => chess.get(sq)?.color === "b").length;
  if (white === 0 && black === 0) return "The central squares are open — whoever seizes them first gains space.";
  if (white > black) return "White controls more of the center right now.";
  if (black > white) return "Black controls more of the center right now.";
  return "Both sides contest the center.";
}

function pawnStructureNote(chess: Chess): string {
  const board = chess.board();
  const whitePawns = board.flat().filter((p) => p?.type === "p" && p.color === "w").length;
  const blackPawns = board.flat().filter((p) => p?.type === "p" && p.color === "b").length;
  if (whitePawns + blackPawns <= 6) return "With few pawns left, passed pawns and king activity decide the game.";
  if (whitePawns !== blackPawns) {
    const more = whitePawns > blackPawns ? "White" : "Black";
    return `${more} has more pawns on the board — watch for space and pawn breaks.`;
  }
  return "Pawn counts are balanced — look for weak squares and isolated pawns.";
}

function pieceActivityNote(chess: Chess, side: "w" | "b"): string {
  const moves = chess.moves({ verbose: true });
  const sideMoves = moves.filter((m) => m.color === side);
  if (sideMoves.length >= 30) return "Your pieces have plenty of options — keep improving the least active one.";
  if (sideMoves.length <= 10) return "Piece activity is limited — loosen the position with a pawn break or trade.";
  return "Piece activity looks normal — coordinate your pieces toward the opponent's king.";
}

export function analyzePosition(fen: string): PositionInsights {
  const chess = new Chess(fen);
  const side = chess.turn();
  const { white, black } = countMaterial(fen);
  const delta = white - black;

  const castling = fen.split(" ")[2] ?? "-";
  const canCastle = {
    white: castling.includes("K") || castling.includes("Q"),
    black: castling.includes("k") || castling.includes("q"),
  };

  return {
    sideToMove: side === "w" ? "white" : "black",
    materialDelta: delta,
    materialText: describeMaterial(delta),
    inCheck: chess.inCheck(),
    canCastle,
    centerOccupancy: centerSummary(chess),
    pawnStructure: pawnStructureNote(chess),
    pieceActivity: pieceActivityNote(chess, side),
  };
}

export function interpretEvaluation(cp: number, mate: number | null): string {
  if (mate !== null) {
    if (mate > 0) return mate === 1 ? "White is delivering mate soon." : `White has a forced mate in ${mate}.`;
    return mate === -1 ? "Black is delivering mate soon." : `Black has a forced mate in ${Math.abs(mate)}.`;
  }

  const pawns = cp / 100;
  if (Math.abs(pawns) < 0.25) return "The position is roughly equal.";
  if (Math.abs(pawns) < 0.75) return pawns > 0 ? "White has a slight edge." : "Black has a slight edge.";
  if (Math.abs(pawns) < 1.5) return pawns > 0 ? "White is clearly better." : "Black is clearly better.";
  if (Math.abs(pawns) < 3) return pawns > 0 ? "White is winning." : "Black is winning.";
  return pawns > 0 ? "White is crushing." : "Black is crushing.";
}

export function uciToSan(fen: string, uci: string): string {
  if (!uci || uci.length < 4) return uci;
  try {
    const chess = new Chess(fen);
    const move = chess.move({
      from: uci.slice(0, 2) as Square,
      to: uci.slice(2, 4) as Square,
      promotion: uci.length > 4 ? (uci[4] as "q" | "r" | "b" | "n") : undefined,
    });
    return move?.san ?? uci;
  } catch {
    return uci;
  }
}

export function describeBestMove(fen: string, uci: string): string {
  const san = uciToSan(fen, uci);
  try {
    const chess = new Chess(fen);
    const move = chess.move({
      from: uci.slice(0, 2) as Square,
      to: uci.slice(2, 4) as Square,
      promotion: uci.length > 4 ? (uci[4] as "q" | "r" | "b" | "n") : undefined,
    });
    if (!move) return `The engine likes ${san}.`;

    if (move.san.includes("+")) return `${san} keeps up the pressure with a check.`;
    if (move.san.includes("#")) return `${san} finishes the game.`;
    if (move.captured) return `${san} wins material while improving the position.`;
    if (move.flags.includes("k") || move.flags.includes("q")) return `${san} gets the king to safety.`;
    if (["d4", "d5", "e4", "e5", "c4", "c5", "f4", "f5"].includes(move.to)) {
      return `${san} fights for central space.`;
    }
    if (move.piece === "n" || move.piece === "b") return `${san} improves piece activity.`;
    return `${san} is the most accurate continuation here.`;
  } catch {
    return `The engine likes ${san}.`;
  }
}

export function commentOnLastMove(fen: string, san: string): string | null {
  try {
    const chess = new Chess(fen);
    const undone = chess.undo();
    if (!undone || undone.san !== san) return null;

    chess.move(san);
    const move = chess.undo();
    if (!move) return null;

    if (move.san.includes("#")) return `Your last move ${san} was decisive.`;
    if (move.san.includes("+")) return `${san} put the king under pressure — keep the initiative.`;
    if (move.captured) return `${san} grabbed material — make sure your pieces stay coordinated.`;
    if (move.piece === "p") return `${san} changed the pawn structure — watch the new weaknesses.`;
    return `${san} developed the position — look for the next most forcing follow-up.`;
  } catch {
    return null;
  }
}
