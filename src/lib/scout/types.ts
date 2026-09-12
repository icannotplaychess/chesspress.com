export type ScoutPlatform = "chesscom" | "lichess";

export type EvidenceLevel = "limited" | "moderate" | "strong";

export interface ScoutProfile {
  username: string;
  platform: ScoutPlatform;
  title?: string;
  ratings: Record<string, number | undefined>;
  gamesAnalyzed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  whiteGames: number;
  blackGames: number;
  whiteScore: number;
  blackScore: number;
  dateRange: { from: string | null; to: string | null };
  timeControls: string[];
}

export interface OpeningStat {
  name: string;
  eco?: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  score: number;
}

export interface PhasePerformance {
  phase: "opening" | "middlegame" | "endgame";
  gamesReached: number;
  avgAccuracy?: number;
  mistakes: number;
  blunders: number;
  label: string;
}

export interface TimeControlStat {
  speed: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  score: number;
  avgAccuracy?: number;
  mistakes: number;
  blunders: number;
}

export interface ScoutPattern {
  id: string;
  category: string;
  title: string;
  description: string;
  evidence: EvidenceLevel;
  gameCount: number;
}

export interface ScoutStrength {
  category: string;
  title: string;
  description: string;
  evidence: EvidenceLevel;
  gameCount: number;
}

export interface ScoutWeakness {
  category: string;
  title: string;
  description: string;
  evidence: EvidenceLevel;
  gameCount: number;
}

export interface ScoutGameSummary {
  id: string;
  white: string;
  black: string;
  result: string;
  playerColor: "white" | "black";
  playerResult: "win" | "loss" | "draw";
  timeControl: string;
  openingName?: string;
  openingEco?: string;
  playedAt?: string;
  accuracy?: number;
  mistakes: number;
  blunders: number;
  pgn: string;
}

export interface ScoutReport {
  profile: ScoutProfile;
  openingsWhite: OpeningStat[];
  openingsBlack: OpeningStat[];
  strengths: ScoutStrength[];
  weaknesses: ScoutWeakness[];
  phases: PhasePerformance[];
  timeControls: TimeControlStat[];
  patterns: ScoutPattern[];
  games: ScoutGameSummary[];
  shreyaSummary: string;
  generatedAt: string;
}
