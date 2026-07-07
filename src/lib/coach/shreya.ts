import type {
  CoachPersonality,
  LichessExplorerData,
  MoveClassification,
  PositionAnalysis,
} from "@/lib/types";
import { CLASSIFICATION_LABELS } from "@/lib/engine/move-classification";
import { formatEvaluation } from "@/lib/engine/evaluation";

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
  if (explorer.isOpening) {
    const eco = explorer.opening.eco ? ` (${explorer.opening.eco})` : "";
    return `You're in the ${explorer.opening.name}${eco}. Stick to the main ideas of this line — development, central influence, and king safety.`;
  }
  return "We've left established opening theory. From here, understanding the position matters more than memorizing moves.";
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

  if (ctx.explorer && ctx.phase === "opening") {
    parts.push(openingCommentary(ctx.explorer));
  }

  if (ctx.analysis?.lines[0]) {
    const line = ctx.analysis.lines[0];
    const evalStr = formatEvaluation(line.scoreCp, line.scoreMate);
    const best = line.pv[0] ?? "—";
    parts.push(
      `Stockfish evaluates this at ${evalStr}. The engine's top choice is ${best}.`
    );
  }

  if (ctx.classification) {
    parts.push(classificationExplanation(ctx.classification, ctx.personality));
  }

  if (ctx.explorer && ctx.explorer.moves.length > 0 && ctx.phase === "opening") {
    const top = ctx.explorer.moves[0];
    parts.push(
      `In the database, ${top.san} is the most popular reply (${top.white}% white wins, ${top.draws}% draws, ${top.black}% black wins).`
    );
  }

  if (parts.length === 0) {
    return "Play a move or load a position to begin analysis. I'll explain what Stockfish and the database show.";
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
