import type { NormalizedGame } from "@/lib/scout/normalized-game";
import trapsCatalog from "@/lib/scout/data/traps-catalog.json";

export interface TrapEntry {
  name: string;
  frequency: "Occasional" | "Frequent";
  lastPlayed: string;
  count: number;
  winRateLabel: string;
}

function matchesTrapPrefix(moves: string[], pattern: string[]): boolean {
  if (moves.length < pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (moves[i] !== pattern[i]) return false;
  }
  return true;
}

function freqLabel(count: number): "Occasional" | "Frequent" {
  return count >= 8 ? "Frequent" : "Occasional";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function detectTraps(games: NormalizedGame[]): {
  trapsUsed: TrapEntry[];
  fallsInto: TrapEntry[];
} {
  const used = new Map<string, { count: number; wins: number; last: string }>();
  const fallen = new Map<
    string,
    { count: number; losses: number; last: string }
  >();

  for (const g of games) {
    for (const trap of trapsCatalog) {
      if (!matchesTrapPrefix(g.moveSans, trap.movesSAN)) continue;

      if (g.result === "win") {
        const u = used.get(trap.name) ?? { count: 0, wins: 0, last: g.date };
        u.count++;
        u.wins++;
        if (new Date(g.date) > new Date(u.last)) u.last = g.date;
        used.set(trap.name, u);
      } else if (g.result === "loss") {
        const f = fallen.get(trap.name) ?? { count: 0, losses: 0, last: g.date };
        f.count++;
        f.losses++;
        if (new Date(g.date) > new Date(f.last)) f.last = g.date;
        fallen.set(trap.name, f);
      }
    }
  }

  const trapsUsed: TrapEntry[] = [...used.entries()].map(([name, v]) => ({
    name,
    frequency: freqLabel(v.count),
    lastPlayed: formatDate(v.last),
    count: v.count,
    winRateLabel: `${Math.round((v.wins / v.count) * 100)}% wins`,
  }));

  const fallsInto: TrapEntry[] = [...fallen.entries()].map(([name, v]) => {
    const lossPct = Math.round((v.losses / v.count) * 100);
    return {
      name,
      frequency: freqLabel(v.count),
      lastPlayed: formatDate(v.last),
      count: v.count,
      winRateLabel: `${100 - lossPct}% / ${lossPct}%`,
    };
  });

  return { trapsUsed, fallsInto };
}
