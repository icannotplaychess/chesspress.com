import type { ScoutReport } from "@/lib/scout/types";

export function generateScoutSummary(report: ScoutReport): string {
  const { profile, strengths, weaknesses, phases, patterns } = report;
  const parts: string[] = [];

  parts.push(
    `Based on ${profile.gamesAnalyzed} analyzed games, here's what the data shows about ${profile.username}.`
  );

  if (profile.gamesAnalyzed < 15) {
    parts.push(
      "That's a small sample — treat these findings as early signals, not definitive conclusions."
    );
  }

  if (strengths.length > 0) {
    const top = strengths[0];
    parts.push(
      `Strength: ${top.title}. ${top.description} (${top.evidence} evidence — ${top.gameCount} games).`
    );
  }

  if (weaknesses.length > 0) {
    const top = weaknesses[0];
    parts.push(
      `Area to study: ${top.title}. ${top.description} (${top.evidence} evidence — ${top.gameCount} games).`
    );
  }

  const middlegame = phases.find((p) => p.phase === "middlegame");
  const opening = phases.find((p) => p.phase === "opening");
  if (opening && middlegame) {
    if (opening.label === "Strong" && middlegame.label === "Inconsistent") {
      parts.push(
        "Your opening play looks solid on paper. The biggest performance drop tends to happen after theory ends — that's where focused middlegame training would help most."
      );
    } else if (opening.label === "Needs work") {
      parts.push(
        "A noticeable number of losses happen early. Reviewing your most-played opening lines could give you the fastest improvement."
      );
    }
  }

  if (patterns.length > 0) {
    parts.push(`Pattern: ${patterns[0].description}`);
  }

  if (profile.whiteGames >= 10 && profile.blackGames >= 10) {
    const w = Math.round(profile.whiteScore * 100);
    const b = Math.round(profile.blackScore * 100);
    parts.push(`With White you score ${w}%; with Black ${b}%.`);
  }

  return parts.join("\n\n");
}
