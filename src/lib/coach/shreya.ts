import type {
  CoachPersonality,
  LichessExplorerData,
  MoveClassification,
  PositionAnalysis,
} from "@/lib/types";
import { CLASSIFICATION_LABELS } from "@/lib/engine/move-classification";
import { toWhitePerspective } from "@/lib/engine/evaluation";
import {
  analyzePosition,
  bestMoveIdea,
  interpretEvaluation,
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
  "That move gave away too much — reset and look for checks and captures.",
  "Ouch — slow down and scan for threats before you move.",
  "Not your best — king safety and loose pieces first.",
];

const BRILLIANT_REACTIONS = [
  "Beautiful — that was the idea.",
  "Strong find; you turned the screw there.",
  "Lovely — that's the move the engine wanted.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function trimOneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function classificationOneLiner(
  classification: MoveClassification,
  personality: CoachPersonality
): string | null {
  const quiet: MoveClassification[] = ["good", "book", "best", "great"];
  if (quiet.includes(classification)) return null;

  if (classification === "blunder") {
    return personality === "serious"
      ? "Blunder — your king or material was left hanging."
      : pick(BLUNDER_JOKES);
  }
  if (classification === "brilliant") return pick(BRILLIANT_REACTIONS);
  if (classification === "mistake") {
    return "Mistake — you let the advantage slip; look for a more active reply.";
  }
  if (classification === "miss") {
    return "You missed a stronger continuation — there was more in the position.";
  }
  if (classification === "inaccuracy") {
    return "Small inaccuracy — fine for humans, but the engine had a sharper idea.";
  }

  const label = CLASSIFICATION_LABELS[classification];
  return `${label} — nothing dramatic, keep playing.`;
}

function positionOneLiner(fen: string, phase: CoachContext["phase"]): string {
  const insights = analyzePosition(fen);
  if (insights.inCheck) return "Your king is in check — deal with that before anything else.";

  if (Math.abs(insights.materialDelta) >= 1) {
    return insights.materialText.replace(/\.$/, "") + " — play accordingly.";
  }

  if (phase === "endgame") {
    return "Endgame: wake up the king and look for passed pawns.";
  }

  return insights.centerOccupancy.replace(/\.$/, "") + ".";
}

function engineOneLiner(
  fen: string,
  analysis: PositionAnalysis,
  explorer: LichessExplorerData | null | undefined,
  inBook: boolean
): string {
  const line = analysis.lines[0];
  if (!line?.pv[0]) {
    const sideToMove = fen.split(" ")[1] as "w" | "b";
    const whiteEval = toWhitePerspective(line.scoreCp, line.scoreMate, sideToMove);
    return interpretEvaluation(whiteEval.cp, whiteEval.mate);
  }

  const sideToMove = fen.split(" ")[1] as "w" | "b";
  const whiteEval = toWhitePerspective(line.scoreCp, line.scoreMate, sideToMove);
  const mood = interpretEvaluation(whiteEval.cp, whiteEval.mate).replace(/\.$/, "");
  const { san, idea } = bestMoveIdea(fen, line.pv[0]);

  const openingName = explorer?.opening?.name;
  if (inBook && openingName) {
    const popular = explorer?.moves[0]?.san;
    if (popular && popular === san) {
      return `${mood} — ${san} ${idea}, and it's the main move in the ${openingName}.`;
    }
    return `${mood} — in the ${openingName}, I'd look at ${san} to ${idea}.`;
  }

  return `${mood} — I'd look at ${san} to ${idea}.`;
}

export function generateCoachMessage(ctx: CoachContext): string {
  const phase = ctx.phase ?? "middlegame";
  const inBook = ctx.explorer?.isOpening ?? false;

  if (ctx.classification) {
    const moveNote = classificationOneLiner(ctx.classification, ctx.personality);
    if (moveNote) return trimOneLine(moveNote);
  }

  if (ctx.analysis?.lines[0]) {
    return trimOneLine(
      engineOneLiner(ctx.fen, ctx.analysis, ctx.explorer, inBook)
    );
  }

  if (ctx.explorer?.opening?.name) {
    if (inBook && ctx.explorer.moves[0]) {
      return trimOneLine(
        `${ctx.explorer.opening.name} — ${ctx.explorer.moves[0].san} is the usual plan here.`
      );
    }
    return trimOneLine(`You've left the ${ctx.explorer.opening.name} book — play the position on its merits.`);
  }

  return trimOneLine(positionOneLiner(ctx.fen, phase));
}

export function generatePhase(fen: string, moveNumber: number): "opening" | "middlegame" | "endgame" {
  const pieces = fen.split(" ")[0];
  const queens = (pieces.match(/q|Q/g) ?? []).length;
  if (moveNumber <= 14) return "opening";
  if (queens === 0 || moveNumber > 40) return "endgame";
  return "middlegame";
}
