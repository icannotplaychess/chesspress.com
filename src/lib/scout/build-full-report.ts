import { analyzeGames } from "@/lib/scout/analyze";
import type { RawGame } from "@/lib/scout/fetch-games";
import { classifyArchetype } from "@/lib/scout/compute/archetype";
import { computeEndgameStatistics } from "@/lib/scout/compute/endgame";
import { computeOpeningBreakdown } from "@/lib/scout/compute/openings";
import { computePsychology } from "@/lib/scout/compute/psychology";
import { generatePreGameChecklist } from "@/lib/scout/compute/pregame-checklist";
import {
  computeFrequentRivals,
  computeHeadToHead,
} from "@/lib/scout/compute/rivals";
import { computeStalkerScore } from "@/lib/scout/compute/stalker-score";
import { computeSubScores } from "@/lib/scout/compute/sub-scores";
import { computeTimeManagement } from "@/lib/scout/compute/time-management";
import { detectTraps } from "@/lib/scout/compute/traps";
import {
  filterGamesByMonths,
  normalizeRawGames,
  type NormalizedGame,
} from "@/lib/scout/normalized-game";
import { SCOUT_REPORT_VERSION } from "@/lib/scout/report-version";
import type { ScoutFullReport, ScoutPlatform } from "@/lib/scout/types";

function lastTenRecord(games: NormalizedGame[]): string {
  const last = games.slice(0, 10);
  const w = last.filter((g) => g.result === "win").length;
  const d = last.filter((g) => g.result === "draw").length;
  const l = last.filter((g) => g.result === "loss").length;
  return `${w}-${d}-${l}`;
}

function pickRatings(ratings: Record<string, number | undefined>) {
  return {
    bullet: ratings.bullet ?? ratings.ultraBullet,
    blitz: ratings.blitz,
    rapid: ratings.rapid ?? ratings.classical,
    daily: ratings.daily ?? ratings.correspondence,
  };
}

export function buildFullScoutReport(
  platform: ScoutPlatform,
  username: string,
  rawGames: RawGame[],
  profileMeta: { title?: string; ratings: Record<string, number> },
  options: { monthsBack: number }
): ScoutFullReport {
  const normalized = filterGamesByMonths(
    normalizeRawGames(rawGames, platform, username),
    options.monthsBack
  );

  const legacy = analyzeGames(platform, username, rawGames, profileMeta);

  const subScores = computeSubScores(normalized);
  const stalker = computeStalkerScore(normalized);
  const archetype = classifyArchetype(subScores, stalker.signals);
  const openingsWhite = computeOpeningBreakdown(normalized, "white");
  const openingsBlack = computeOpeningBreakdown(normalized, "black");
  const checklist = generatePreGameChecklist(normalized, stalker.signals);
  const psychology = computePsychology(normalized);
  const timeBlitz = computeTimeManagement(normalized, "blitz");
  const timeRapid = computeTimeManagement(normalized, "rapid");
  const traps = detectTraps(normalized);
  const rivals = computeFrequentRivals(normalized);
  const headToHead = computeHeadToHead(normalized);
  const endgames = computeEndgameStatistics(normalized);

  const sorted = [...normalized].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    ...legacy,
    reportVersion: SCOUT_REPORT_VERSION,
    monthsBack: options.monthsBack,
    subScores,
    archetype,
    stalker,
    openingsByColor: {
      white: openingsWhite,
      black: openingsBlack,
    },
    preGameChecklist: checklist,
    psychology,
    timeManagement: { blitz: timeBlitz, rapid: timeRapid },
    traps,
    frequentRivals: rivals,
    headToHead,
    endgameStats: endgames,
    lastTen: lastTenRecord(sorted),
    ratingsByFormat: pickRatings(profileMeta.ratings),
    recentGames: sorted.slice(0, 8).map((g) => ({
      id: g.id,
      opponent: g.opponent,
      opponentRating: g.opponentRating,
      openingName: g.openingName,
      timeControl: g.timeControl,
      result: g.result,
      color: g.color,
      date: g.date,
      gameUrl: g.gameUrl,
      pgn: g.pgn,
    })),
    normalizedGames: sorted,
  };
}
