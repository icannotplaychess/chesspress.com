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

const MAX_SENTENCES = 3;

const BLUNDER_JOKES = [
  "Ouch — that one hurt.",
  "Stockfish did not love that.",
  "Your pieces are asking for a time-out.",
];

const BRILLIANT_REACTIONS = [
  "Excellent find.",
  "Strong — well calculated.",
  "That's the move.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dedupeSentences(sentences: string[]): string[] {
  const out: string[] = [];
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    const key = s.toLowerCase().replace(/\s+/g, " ").slice(0, 48);
    if (out.some((existing) => existing.toLowerCase().startsWith(key.slice(0, 24)))) {
      continue;
    }
    out.push(s);
    if (out.length >= MAX_SENTENCES) break;
  }
  return out;
}

function openingLine(explorer: LichessExplorerData, inBook: boolean): string | null {
  const name = explorer.opening?.name;
  if (!name) {
    return inBook ? "Still in the opening — develop and castle." : null;
  }
  const eco = explorer.opening?.eco ? ` (${explorer.opening.eco})` : "";
  if (inBook) return `${name}${eco}.`;
  return `Left the ${name} book.`;
}

function onePositionNote(fen: string, phase: CoachContext["phase"]): string | null {
  const insights = analyzePosition(fen);
  if (insights.inCheck) return "King in check — safety first.";

  if (Math.abs(insights.materialDelta) >= 1) return insights.materialText;

  if (phase === "endgame") {
    return insights.pawnStructure.length < 80
      ? insights.pawnStructure
      : "Endgame — activate the king and push passed pawns.";
  }

  return insights.centerOccupancy;
}

function engineLine(fen: string, analysis: PositionAnalysis): string | null {
  const line = analysis.lines[0];
  if (!line) return null;

  const sideToMove = fen.split(" ")[1] as "w" | "b";
  const whiteEval = toWhitePerspective(line.scoreCp, line.scoreMate, sideToMove);
  const evalStr = formatEvaluation(whiteEval.cp, whiteEval.mate, "white");
  const mood = interpretEvaluation(whiteEval.cp, whiteEval.mate);
  const bestUci = line.pv[0];

  if (bestUci) {
    const idea = describeBestMove(fen, bestUci);
    return `${mood} (${evalStr}). ${idea}`;
  }

  const bestSan = uciToSan(fen, bestUci ?? "");
  return `${mood} (${evalStr}). Best: ${bestSan}.`;
}

function classificationLine(
  classification: MoveClassification,
  personality: CoachPersonality
): string | null {
  const quiet: MoveClassification[] = ["good", "book", "best", "great"];
  if (quiet.includes(classification)) return null;

  const label = CLASSIFICATION_LABELS[classification];
  const short: Record<MoveClassification, string> = {
    brilliant: "Top-tier — changes the game.",
    best: "Engine's top choice.",
    great: "Strong and accurate.",
    good: "Fine — keeps balance.",
    book: "Theory.",
    inaccuracy: "Small slip — edge fades a bit.",
    mistake: "Loses ground — look for tactics and threats.",
    miss: "Stronger line was available.",
    blunder: "Big swing — reassess threats and king safety.",
  };

  if (classification === "blunder" && personality !== "serious") {
    return `${pick(BLUNDER_JOKES)} ${short.blunder}`;
  }
  if (classification === "brilliant") {
    return `${pick(BRILLIANT_REACTIONS)} ${short.brilliant}`;
  }

  return `${label}. ${short[classification]}`;
}

function databaseLine(explorer: LichessExplorerData): string | null {
  const top = explorer.moves[0];
  if (!top) return null;
  return `Popular: ${top.san} (${top.white}% / ${top.draws}% / ${top.black}%).`;
}

export function generateCoachMessage(ctx: CoachContext): string {
  const inBook = ctx.explorer?.isOpening ?? false;
  const phase = ctx.phase ?? "middlegame";
  const candidates: string[] = [];

  if (ctx.classification) {
    const classLine = classificationLine(ctx.classification, ctx.personality);
    if (classLine) candidates.push(classLine);
  }

  if (ctx.analysis?.lines[0]) {
    const eng = engineLine(ctx.fen, ctx.analysis);
    if (eng) candidates.push(eng);
  } else if (candidates.length === 0) {
    candidates.push("Engine is still calculating…");
  }

  if (ctx.explorer) {
    const open = openingLine(ctx.explorer, inBook);
    if (open) candidates.push(open);
    if (inBook && ctx.explorer.moves.length > 0) {
      const db = databaseLine(ctx.explorer);
      if (db) candidates.push(db);
    }
  } else {
    const pos = onePositionNote(ctx.fen, phase);
    if (pos) candidates.push(pos);
  }

  return dedupeSentences(candidates).join(" ");
}

export function generatePhase(fen: string, moveNumber: number): "opening" | "middlegame" | "endgame" {
  const pieces = fen.split(" ")[0];
  const queens = (pieces.match(/q|Q/g) ?? []).length;
  if (moveNumber <= 14) return "opening";
  if (queens === 0 || moveNumber > 40) return "endgame";
  return "middlegame";
}
