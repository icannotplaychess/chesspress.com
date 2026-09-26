import type { NormalizedGame } from "@/lib/scout/normalized-game";
import type { StalkerSignals } from "@/lib/scout/compute/stalker-score";
import { THRESHOLDS } from "@/lib/scout/scoring-config";
import { detectTraps } from "@/lib/scout/compute/traps";

export interface ChecklistItem {
  tip: string;
  justification: string;
}

export function generatePreGameChecklist(
  games: NormalizedGame[],
  signals: StalkerSignals
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const traps = detectTraps(games);

  if (traps.fallsInto.length >= THRESHOLDS.trapChecklistMin) {
    items.push({
      tip: "Prepare opening traps",
      justification: `fell for ${traps.fallsInto.length} trap${traps.fallsInto.length > 1 ? "s" : ""}`,
    });
  }

  if (signals.tiltsEasily >= 40) {
    items.push({
      tip: "Exploit tilt",
      justification: `Plays ${signals.tiltsEasily}% worse after losing (estimated)`,
    });
  }

  let maxLoss = 0;
  let streak = 0;
  for (const g of games) {
    if (g.result === "loss") {
      streak++;
      maxLoss = Math.max(maxLoss, streak);
    } else streak = 0;
  }
  if (maxLoss >= THRESHOLDS.losingStreakConcern) {
    items.push({
      tip: "Search multiple consecutive games",
      justification: `Max streak: ${maxLoss} losses. Prone to tilt`,
    });
  }

  const resignGames = games.filter((g) =>
    (g.termination ?? "").toLowerCase().includes("resign")
  );
  if (resignGames.length > 0) {
    const avgMove =
      resignGames.reduce((s, g) => s + g.moveSans.length, 0) / resignGames.length;
    if (avgMove <= THRESHOLDS.resignMoveAvg + 8) {
      items.push({
        tip: "Press late",
        justification: `Resigns around move ${Math.round(avgMove)} on average`,
      });
    }
  }

  if (signals.timeTrouble >= 30) {
    items.push({
      tip: "Push the clock",
      justification: `${signals.timeTrouble}% of games show severe time trouble`,
    });
  }

  if (signals.limitedRepertoire >= 45) {
    items.push({
      tip: "Prep their main lines",
      justification: "Narrow opening repertoire — repeat your best weapons",
    });
  }

  return items;
}
