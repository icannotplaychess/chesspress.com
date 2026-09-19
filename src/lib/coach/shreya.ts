import { Chess, type Square } from "chess.js";
import type {
  CoachPersonality,
  LichessExplorerData,
  MoveClassification,
  PositionAnalysis,
} from "@/lib/types";
import { CLASSIFICATION_LABELS } from "@/lib/engine/move-classification";
import { formatEvaluation, toWhitePerspective } from "@/lib/engine/evaluation";
import {
  analyzePosition,
  commentOnLastMove,
  describeBestMove,
  interpretEvaluation,
  uciToSan,
} from "@/lib/coach/position-insights";

interface CoachContext {
  personality: CoachPersonality;
  fen: string;
  lastMove?: string;
  classification?: MoveClassification | null;
  analysis?: PositionAnalysis | null;
  explorer?: LichessExplorerData | null;
  moveNumber?: number;
  phase?: "opening" | "middlegame" | "endgame";
}

const BLUNDER_JOKES = [
  "That move surprised everyone — including your own pieces.",
  "Stockfish needed a moment to process that one.",
  "Congratulations on discovering a brand-new way to lose material.",
  "Your king would appreciate a little less excitement.",
];

const BRILLIANT_REACTIONS = [
  "Now THAT is a move! Beautiful calculation.",
  "Genuinely impressive — many strong players would miss this.",
  "Excellent practical decision with real bite.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function openingCommentary(explorer: LichessExplorerData): string {
  if (!explorer.opening?.name) {
    return "We're still in the early moves. Focus on development, king safety, and central control.";
  }
  const eco = explorer.opening.eco ? ` (${explorer.opening.eco})` : "";
  return `You're in the ${explorer.opening.name}${eco}. Stick to the main ideas of this line — development, central influence, and king safety.`;
}

function positionCommentary(fen: string, phase: CoachContext["phase"]): string[] {
  const insights = analyzePosition(fen);
  const parts: string[] = [];

  parts.push(insights.materialText);
  parts.push(insights.centerOccupancy);

  if (insights.inCheck) {
    parts.push("The king is in check — safety comes first.");
  }

  if (phase === "endgame") {
    parts.push(insights.pawnStructure);
    if (insights.canCastle.white || insights.canCastle.black) {
      parts.push("Castling rights still matter — keep the king active but safe.");
    }
  } else if (phase === "opening") {
    parts.push("Develop pieces toward the center and finish development before launching an attack.");
  } else {
    parts.push(insights.pieceActivity);
  }

  return parts;
}

function engineCommentary(
  fen: string,
  analysis: PositionAnalysis,
  phase: CoachContext["phase"]
): string[] {
  const line = analysis.lines[0];
  const sideToMove = fen.split(" ")[1] as "w" | "b";
  const whiteEval = toWhitePerspective(line.scoreCp, line.scoreMate, sideToMove);
  const evalStr = formatEvaluation(whiteEval.cp, whiteEval.mate, "white");
  const interpretation = interpretEvaluation(whiteEval.cp, whiteEval.mate);
  const bestUci = line.pv[0];
  const bestSan = bestUci ? uciToSan(fen, bestUci) : "—";
  const moveIdea = bestUci ? describeBestMove(fen, bestUci) : null;

  const parts: string[] = [
    `${interpretation} Stockfish scores it ${evalStr} from White's perspective.`,
  ];

  if (moveIdea) {
    parts.push(moveIdea);
  } else {
    parts.push(`The engine's top choice is ${bestSan}.`);
  }

  if (line.pv.length > 1) {
    try {
      const chess = new Chess(fen);
      const sans: string[] = [];
      for (const uci of line.pv.slice(0, 4)) {
        const move = chess.move({
          from: uci.slice(0, 2) as Square,
          to: uci.slice(2, 4) as Square,
          promotion: uci.length > 4 ? (uci[4] as "q" | "r" | "b" | "n") : undefined,
        });
        if (move) sans.push(move.san);
      }
      if (sans.length > 1) {
        parts.push(`The main line continues ${sans.slice(1).join(", ")}.`);
      }
    } catch {
      // ignore invalid PV lines
    }
  }

  if (phase === "endgame") {
    parts.push("In the endgame, king activity and pawn races often matter more than raw material.");
  } else if (phase === "middlegame") {
    parts.push("Look for tactics, improve your worst piece, and keep an eye on your opponent's threats.");
  }

  return parts;
}

function classificationExplanation(
  classification: MoveClassification,
  personality: CoachPersonality
): string {
  const label = CLASSIFICATION_LABELS[classification];

  const base: Record<MoveClassification, string> = {
    brilliant: "A hidden idea that changes the evaluation — exceptional calculation.",
    best: "The strongest continuation according to Stockfish.",
    great: "A strong move that keeps the position on track.",
    good: "Solid play — not the absolute best, but perfectly reasonable.",
    book: "A well-known theoretical move in this opening.",
    inaccuracy: "Slightly inefficient — a small amount of advantage slipped away.",
    mistake: "This loses some advantage. Look for moves that improve piece activity or address threats.",
    miss: "You overlooked a stronger continuation — there was a better opportunity here.",
    blunder: "A serious error that significantly worsens your position.",
  };

  let text = `${label}: ${base[classification]}`;

  if (classification === "blunder" && personality !== "serious") {
    text = `${pick(BLUNDER_JOKES)} ${base.blunder}`;
  }
  if (classification === "brilliant") {
    text = `${pick(BRILLIANT_REACTIONS)} ${base.brilliant}`;
  }

  return text;
}

export function generateCoachMessage(ctx: CoachContext): string {
  const parts: string[] = [];
  const inBook = ctx.explorer?.isOpening ?? false;
  const phase = ctx.phase ?? "middlegame";

  if (ctx.explorer && inBook) {
    parts.push(openingCommentary(ctx.explorer));
  } else if (ctx.explorer?.opening?.name && !inBook) {
    parts.push(
      `We've left the ${ctx.explorer.opening.name} book line. Let's focus on the concrete position.`
    );
  }

  if (ctx.lastMove) {
    const lastMoveNote = commentOnLastMove(ctx.fen, ctx.lastMove);
    if (lastMoveNote) parts.push(lastMoveNote);
  }

  parts.push(...positionCommentary(ctx.fen, phase));

  if (ctx.analysis?.lines[0]) {
    parts.push(...engineCommentary(ctx.fen, ctx.analysis, phase));
  } else {
    parts.push("Stockfish is still calculating — hang on for the exact evaluation.");
  }

  if (ctx.classification) {
    parts.push(classificationExplanation(ctx.classification, ctx.personality));
  }

  if (ctx.explorer && inBook && ctx.explorer.moves.length > 0) {
    const top = ctx.explorer.moves[0];
    parts.push(
      `In master games, ${top.san} is the most popular reply (${top.white}% white wins, ${top.draws}% draws, ${top.black}% black wins).`
    );
  }

  return parts.join(" ");
}

export function generatePhase(fen: string, moveNumber: number): "opening" | "middlegame" | "endgame" {
  const pieces = fen.split(" ")[0];
  const queens = (pieces.match(/q|Q/g) ?? []).length;
  if (moveNumber <= 14) return "opening";
  if (queens === 0 || moveNumber > 40) return "endgame";
  return "middlegame";
}
