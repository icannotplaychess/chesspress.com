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

export interface ScoutFullReport extends ScoutReport {
  monthsBack: number;
  subScores: {
    atk: number;
    def: number;
    time: number;
    mind: number;
    overall: number;
  };
  archetype: { id: string; name: string; tip: string };
  stalker: {
    score: number;
    label: "Low" | "Medium" | "High";
    signals: {
      timeTrouble: number;
      tiltsEasily: number;
      limitedRepertoire: number;
      repetitivePatterns: number;
    };
  };
  openingsByColor: {
    white: {
      weaknesses: OpeningLineStat[];
      strengths: OpeningLineStat[];
    };
    black: {
      weaknesses: OpeningLineStat[];
      strengths: OpeningLineStat[];
    };
  };
  preGameChecklist: { tip: string; justification: string }[];
  psychology: import("@/lib/scout/compute/psychology").PsychologyMetrics;
  timeManagement: {
    blitz: import("@/lib/scout/compute/time-management").TimeManagementStats;
    rapid: import("@/lib/scout/compute/time-management").TimeManagementStats;
  };
  traps: {
    trapsUsed: TrapEntryStat[];
    fallsInto: TrapEntryStat[];
  };
  frequentRivals: {
    rivals: RivalStat[];
    rivalCount: number;
    nemesisCount: number;
  };
  headToHead: RivalStat[];
  endgameStats: EndgameStat[];
  lastTen: string;
  ratingsByFormat: {
    bullet?: number;
    blitz?: number;
    rapid?: number;
    daily?: number;
  };
  recentGames: RecentGameStat[];
  normalizedGames: import("@/lib/scout/normalized-game").NormalizedGame[];
}

export interface OpeningLineStat {
  name: string;
  eco?: string;
  moves: string;
  gameCount: number;
  lastPlayed: string;
  winRate: number;
}

export interface TrapEntryStat {
  name: string;
  frequency: string;
  lastPlayed: string;
  count: number;
  winRateLabel: string;
}

export interface RivalStat {
  username: string;
  rating?: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
}

export interface EndgameStat {
  type: string;
  games: number;
  winRate: number;
}

export interface RecentGameStat {
  id: string;
  opponent: string;
  opponentRating?: number;
  openingName?: string;
  timeControl: string;
  result: "win" | "loss" | "draw";
  color: "white" | "black";
  date: string;
  gameUrl?: string;
  pgn: string;
}
