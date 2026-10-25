import type { ScoutReport } from "@/lib/scout/types";

const MAX_LINES = 3;

export function generateScoutSummary(report: ScoutReport): string {
  const { profile, strengths, weaknesses, phases } = report;
  const lines: string[] = [];

  lines.push(
    `${profile.username}: ${profile.gamesAnalyzed} games analyzed${
      profile.gamesAnalyzed < 15 ? " (small sample)" : ""
    }.`
  );

  if (strengths[0]) {
    lines.push(`Strength — ${strengths[0].title}.`);
  }

  if (weaknesses[0]) {
    lines.push(`Work on — ${weaknesses[0].title}.`);
  }

  const opening = phases.find((p) => p.phase === "opening");
  const middlegame = phases.find((p) => p.phase === "middlegame");
  if (lines.length < MAX_LINES && opening?.label === "Needs work") {
    lines.push("Review your main opening lines first.");
  } else if (
    lines.length < MAX_LINES &&
    opening?.label === "Strong" &&
    middlegame?.label === "Inconsistent"
  ) {
    lines.push("Middlegame after theory is the leak.");
  }

  return lines.slice(0, MAX_LINES).join(" ");
}
