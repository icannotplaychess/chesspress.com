import { Chess } from "chess.js";
import type { RawGame } from "@/lib/scout/fetch-games";
import { detectOpeningFromPgn } from "@/lib/scout/opening-detect";
import type {
  EvidenceLevel,
  ScoutGameSummary,
  ScoutPattern,
  ScoutPlatform,
  ScoutReport,
  ScoutStrength,
  ScoutWeakness,
  OpeningStat,
  PhasePerformance,
  TimeControlStat,
} from "@/lib/scout/types";
import { generateScoutSummary } from "@/lib/scout/shreya-scout";

function evidenceLevel(count: number): EvidenceLevel {
  if (count >= 30) return "strong";
  if (count >= 12) return "moderate";
  return "limited";
}

function scoreFromResult(result: string, color: "white" | "black"): number {
  if (result === "1/2-1/2") return 0.5;
  if (color === "white") return result === "1-0" ? 1 : 0;
  return result === "0-1" ? 1 : 0;
}

function playerResult(
  result: string,
  color: "white" | "black"
): "win" | "loss" | "draw" {
  const s = scoreFromResult(result, color);
  if (s === 1) return "win";
  if (s === 0.5) return "draw";
  return "loss";
}

function normalizeUsername(a: string, b: string) {
  return a.toLowerCase().trim() === b.toLowerCase().trim();
}

function addOpeningStat(
  map: Map<string, OpeningStat>,
  name: string,
  eco?: string,
  result?: "win" | "loss" | "draw"
) {
  const key = `${eco ?? ""}:${name}`;
  const existing = map.get(key) ?? {
    name,
    eco,
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    score: 0,
  };
  existing.games += 1;
  if (result === "win") existing.wins += 1;
  else if (result === "draw") existing.draws += 1;
  else existing.losses += 1;
  existing.score =
    (existing.wins + existing.draws * 0.5) / existing.games;
  map.set(key, existing);
}

export function analyzeGames(
  platform: ScoutPlatform,
  username: string,
  games: RawGame[],
  profileMeta: { title?: string; ratings: Record<string, number> }
): ScoutReport {
  const summaries: ScoutGameSummary[] = [];
  const whiteOpenings = new Map<string, OpeningStat>();
  const blackOpenings = new Map<string, OpeningStat>();
  const timeControlMap = new Map<string, TimeControlStat>();

  let wins = 0,
    draws = 0,
    losses = 0;
  let whiteGames = 0,
    blackGames = 0;
  let whiteScore = 0,
    blackScore = 0;
  const dates: string[] = [];

  let openingPhaseGames = 0,
    openingMistakes = 0;
  let middlegameGames = 0,
    middlegameMistakes = 0;
  let endgameGames = 0,
    endgameMistakes = 0;

  const lossAfterLoss = { afterLoss: 0, afterLossWins: 0 };
  let prevResult: "win" | "loss" | "draw" | null = null;

  for (const g of games) {
    const isWhite = normalizeUsername(g.white, username);
    const isBlack = normalizeUsername(g.black, username);
    if (!isWhite && !isBlack) continue;

    const color: "white" | "black" = isWhite ? "white" : "black";
    const result = playerResult(g.result, color);
    const score = scoreFromResult(g.result, color);

    if (result === "win") wins++;
    else if (result === "draw") draws++;
    else losses++;

    if (color === "white") {
      whiteGames++;
      whiteScore += score;
    } else {
      blackGames++;
      blackScore += score;
    }

    if (g.playedAt) dates.push(g.playedAt);

    const opening =
      g.openingName && g.openingEco
        ? { name: g.openingName, eco: g.openingEco }
        : detectOpeningFromPgn(g.pgn);

    if (opening.name) {
      if (color === "white") {
        addOpeningStat(whiteOpenings, opening.name, opening.eco, result);
      } else {
        addOpeningStat(blackOpenings, opening.name, opening.eco, result);
      }
    }

    const chess = new Chess();
    try {
      chess.loadPgn(g.pgn);
    } catch {
      continue;
    }
    const moveCount = chess.history().length;
    if (moveCount >= 8) openingPhaseGames++;
    if (moveCount >= 20) middlegameGames++;
    if (moveCount >= 50) endgameGames++;

    // Heuristic phase mistakes from game length + result
    if (result === "loss" && moveCount <= 20) openingMistakes++;
    if (result === "loss" && moveCount > 20 && moveCount <= 50) middlegameMistakes++;
    if (result === "loss" && moveCount > 50) endgameMistakes++;

    const tcKey = g.timeControl.toLowerCase();
    const tc =
      timeControlMap.get(tcKey) ?? {
        speed: g.timeControl,
        games: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        score: 0,
        mistakes: 0,
        blunders: 0,
      };
    tc.games++;
    if (result === "win") tc.wins++;
    else if (result === "draw") tc.draws++;
    else {
      tc.losses++;
      tc.mistakes++;
    }
    tc.score = (tc.wins + tc.draws * 0.5) / tc.games;
    timeControlMap.set(tcKey, tc);

    if (prevResult === "loss") {
      lossAfterLoss.afterLoss++;
      if (result === "win") lossAfterLoss.afterLossWins++;
    }
    prevResult = result;

    summaries.push({
      id: g.id,
      white: g.white,
      black: g.black,
      result: g.result,
      playerColor: color,
      playerResult: result,
      timeControl: g.timeControl,
      openingName: opening.name,
      openingEco: opening.eco,
      playedAt: g.playedAt,
      mistakes: result === "loss" ? 1 : 0,
      blunders: 0,
      pgn: g.pgn,
    });
  }

  const total = summaries.length;
  const sortedWhite = [...whiteOpenings.values()].sort((a, b) => b.games - a.games);
  const sortedBlack = [...blackOpenings.values()].sort((a, b) => b.games - a.games);

  const strengths: ScoutStrength[] = [];
  const weaknesses: ScoutWeakness[] = [];
  const patterns: ScoutPattern[] = [];

  const bestOpening = [...sortedWhite, ...sortedBlack]
    .filter((o) => o.games >= 5)
    .sort((a, b) => b.score - a.score)[0];
  if (bestOpening) {
    strengths.push({
      category: "opening",
      title: `Strong in ${bestOpening.name}`,
      description: `Scores ${Math.round(bestOpening.score * 100)}% across ${bestOpening.games} games with this opening.`,
      evidence: evidenceLevel(bestOpening.games),
      gameCount: bestOpening.games,
    });
  }

  const worstOpening = [...sortedWhite, ...sortedBlack]
    .filter((o) => o.games >= 5)
    .sort((a, b) => a.score - b.score)[0];
  if (worstOpening && worstOpening.score < 0.45) {
    weaknesses.push({
      category: "opening",
      title: `Struggles in ${worstOpening.name}`,
      description: `Scores only ${Math.round(worstOpening.score * 100)}% across ${worstOpening.games} games.`,
      evidence: evidenceLevel(worstOpening.games),
      gameCount: worstOpening.games,
    });
  }

  if (whiteGames >= 10 && blackGames >= 10) {
    const wRate = whiteScore / whiteGames;
    const bRate = blackScore / blackGames;
    if (wRate - bRate > 0.1) {
      strengths.push({
        category: "color",
        title: "Stronger with White",
        description: `${Math.round(wRate * 100)}% score as White vs ${Math.round(bRate * 100)}% as Black.`,
        evidence: evidenceLevel(Math.min(whiteGames, blackGames)),
        gameCount: whiteGames + blackGames,
      });
    } else if (bRate - wRate > 0.1) {
      strengths.push({
        category: "color",
        title: "Stronger with Black",
        description: `${Math.round(bRate * 100)}% score as Black vs ${Math.round(wRate * 100)}% as White.`,
        evidence: evidenceLevel(Math.min(whiteGames, blackGames)),
        gameCount: whiteGames + blackGames,
      });
    }
  }

  if (lossAfterLoss.afterLoss >= 8) {
    const bounceRate = lossAfterLoss.afterLossWins / lossAfterLoss.afterLoss;
    patterns.push({
      id: "after-loss",
      category: "performance",
      title: "Performance after losses",
      description:
        bounceRate < 0.35
          ? `Wins only ${Math.round(bounceRate * 100)}% of games immediately following a loss.`
          : `Recovers well — wins ${Math.round(bounceRate * 100)}% of games after a loss.`,
      evidence: evidenceLevel(lossAfterLoss.afterLoss),
      gameCount: lossAfterLoss.afterLoss,
    });
  }

  const phases: PhasePerformance[] = [
    {
      phase: "opening",
      gamesReached: openingPhaseGames,
      mistakes: openingMistakes,
      blunders: 0,
      label:
        openingMistakes / Math.max(openingPhaseGames, 1) < 0.3
          ? "Strong"
          : openingMistakes / Math.max(openingPhaseGames, 1) < 0.5
            ? "Inconsistent"
            : "Needs work",
    },
    {
      phase: "middlegame",
      gamesReached: middlegameGames,
      mistakes: middlegameMistakes,
      blunders: 0,
      label:
        middlegameMistakes / Math.max(middlegameGames, 1) < 0.35
          ? "Above average"
          : "Inconsistent",
    },
    {
      phase: "endgame",
      gamesReached: endgameGames,
      mistakes: endgameMistakes,
      blunders: 0,
      label:
        endgameGames < 10
          ? "Limited data"
          : endgameMistakes / Math.max(endgameGames, 1) < 0.4
            ? "Above average"
            : "Needs work",
    },
  ];

  const report: ScoutReport = {
    profile: {
      username,
      platform,
      title: profileMeta.title,
      ratings: profileMeta.ratings,
      gamesAnalyzed: total,
      wins,
      draws,
      losses,
      winRate: total > 0 ? (wins + draws * 0.5) / total : 0,
      whiteGames,
      blackGames,
      whiteScore: whiteGames > 0 ? whiteScore / whiteGames : 0,
      blackScore: blackGames > 0 ? blackScore / blackGames : 0,
      dateRange: {
        from: dates.length ? dates.sort()[0] : null,
        to: dates.length ? dates.sort().at(-1) ?? null : null,
      },
      timeControls: [...timeControlMap.keys()],
    },
    openingsWhite: sortedWhite.slice(0, 12),
    openingsBlack: sortedBlack.slice(0, 12),
    strengths,
    weaknesses,
    phases,
    timeControls: [...timeControlMap.values()].sort((a, b) => b.games - a.games),
    patterns,
    games: summaries,
    shreyaSummary: "",
    generatedAt: new Date().toISOString(),
  };

  report.shreyaSummary = generateScoutSummary(report);
  return report;
}
