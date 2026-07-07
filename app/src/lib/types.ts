export type MoveClassification =
  | "brilliant"
  | "best"
  | "great"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "miss"
  | "blunder"
  | "book";

export interface EngineLine {
  multipv: number;
  depth: number;
  scoreCp: number | null;
  scoreMate: number | null;
  pv: string[];
  nodes?: number;
}

export interface PositionAnalysis {
  fen: string;
  depth: number;
  nodes: number;
  lines: EngineLine[];
  bestMove: string | null;
}

export interface MoveAnalysis {
  moveIndex: number;
  san: string;
  uci: string;
  classification: MoveClassification | null;
  evalBefore: number;
  evalAfter: number;
  bestMove: string | null;
  cpLoss: number;
}

export interface LichessMoveStat {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number | null;
  gameCount: number;
  popularity: number;
}

export interface LichessExplorerData {
  white: number;
  draws: number;
  black: number;
  moves: LichessMoveStat[];
  opening: {
    eco: string | null;
    name: string | null;
  } | null;
  isOpening: boolean;
}

export interface OpeningInfo {
  eco: string | null;
  name: string | null;
  variation: string | null;
  isInTheory: boolean;
}

export type CoachPersonality = "serious" | "balanced" | "chaotic";
