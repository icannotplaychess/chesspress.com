import type { SubScores } from "@/lib/scout/compute/sub-scores";
import type { StalkerSignals } from "@/lib/scout/compute/stalker-score";

export interface ArchetypeResult {
  id: string;
  name: string;
  tip: string;
}

const ARCHETYPES: {
  id: string;
  name: string;
  tip: string;
  match: (signals: StalkerSignals, scores: SubScores) => number;
}[] = [
  {
    id: "tilter",
    name: "The Tilter",
    tip: "Emotions affect their game. Make them nervous and they may fall apart.",
    match: (s) => s.tiltsEasily,
  },
  {
    id: "clock",
    name: "The Time Trouble Addict",
    tip: "Complex positions and fast clocks are your allies — keep the tension.",
    match: (s) => s.timeTrouble,
  },
  {
    id: "bookworm",
    name: "The Bookworm",
    tip: "They rely on a narrow book — surprise them early with offbeat lines.",
    match: (s) => s.limitedRepertoire,
  },
  {
    id: "grinder",
    name: "The Grinder",
    tip: "Solid and stubborn. Avoid unnecessary risks and squeeze slowly.",
    match: (s, sc) => 100 - s.tiltsEasily + sc.def * 0.3,
  },
  {
    id: "tactician",
    name: "The Tactician",
    tip: "They fight for initiative. Keep your king safe and punish overextensions.",
    match: (_s, sc) => sc.atk,
  },
];

export function classifyArchetype(
  subScores: SubScores,
  signals: StalkerSignals
): ArchetypeResult {
  let best = ARCHETYPES[0];
  let bestScore = -1;
  for (const a of ARCHETYPES) {
    const score = a.match(signals, subScores);
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return { id: best.id, name: best.name, tip: best.tip };
}
