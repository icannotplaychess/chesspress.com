export interface RepertoireMove {
  san: string;
  uci: string;
  fen: string;
  note?: string;
}

export interface LineMemory {
  correctAttempts: number;
  incorrectAttempts: number;
  confidence: number;
  lastReviewed: string | null;
  nextReview: string | null;
  intervalDays: number;
  intervalIndex: number;
  mastery: number;
}

export interface RepertoireLine {
  id: string;
  name: string;
  eco?: string;
  moves: RepertoireMove[];
  memory: LineMemory;
}

export interface Repertoire {
  id: string;
  name: string;
  description?: string;
  color: "white" | "black" | "both";
  lines: RepertoireLine[];
  createdAt: string;
  updatedAt: string;
}

export type PracticeMode =
  | "review_due"
  | "learn_new"
  | "mixed"
  | "weakest"
  | "tournament"
  | "random";

export interface PracticePosition {
  repertoireId: string;
  repertoireName: string;
  lineId: string;
  lineName: string;
  moveIndex: number;
  fen: string;
  expectedMove: RepertoireMove;
  totalMoves: number;
}

export interface PracticeResult {
  correct: boolean;
  expectedSan: string;
  playedSan?: string;
}
