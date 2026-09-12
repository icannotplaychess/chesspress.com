import type { Repertoire, RepertoireLine } from "@/lib/repertoire/types";
import { createInitialMemory } from "@/lib/repertoire/spaced-repetition";
import { lineFromPgn } from "@/lib/repertoire/pgn";

const STORAGE_KEY = "chesspress_repertoires";

function loadAll(): Repertoire[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Repertoire[];
  } catch {
    return [];
  }
}

function saveAll(repertoires: Repertoire[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repertoires));
}

export function getRepertoires(): Repertoire[] {
  return loadAll();
}

export function getRepertoire(id: string): Repertoire | undefined {
  return loadAll().find((r) => r.id === id);
}

export function createRepertoire(
  name: string,
  color: Repertoire["color"] = "white"
): Repertoire {
  const now = new Date().toISOString();
  const repertoire: Repertoire = {
    id: crypto.randomUUID(),
    name,
    color,
    lines: [],
    createdAt: now,
    updatedAt: now,
  };
  const all = loadAll();
  all.push(repertoire);
  saveAll(all);
  return repertoire;
}

export function updateRepertoire(repertoire: Repertoire): void {
  const all = loadAll();
  const idx = all.findIndex((r) => r.id === repertoire.id);
  if (idx === -1) return;
  all[idx] = { ...repertoire, updatedAt: new Date().toISOString() };
  saveAll(all);
}

export function deleteRepertoire(id: string): void {
  saveAll(loadAll().filter((r) => r.id !== id));
}

export function duplicateRepertoire(id: string): Repertoire | null {
  const original = getRepertoire(id);
  if (!original) return null;
  const copy: Repertoire = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (copy)`,
    lines: original.lines.map((l) => ({
      ...l,
      id: crypto.randomUUID(),
      memory: createInitialMemory(),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const all = loadAll();
  all.push(copy);
  saveAll(all);
  return copy;
}

export function addLineToRepertoire(
  repertoireId: string,
  line: Omit<RepertoireLine, "id" | "memory"> & { memory?: RepertoireLine["memory"] }
): RepertoireLine | null {
  const repertoire = getRepertoire(repertoireId);
  if (!repertoire) return null;

  const newLine: RepertoireLine = {
    ...line,
    id: crypto.randomUUID(),
    memory: line.memory ?? createInitialMemory(),
  };

  const duplicate = repertoire.lines.find(
    (l) =>
      l.moves.length === newLine.moves.length &&
      l.moves.every((m, i) => m.uci === newLine.moves[i]?.uci)
  );
  if (duplicate) return duplicate;

  repertoire.lines.push(newLine);
  updateRepertoire(repertoire);
  return newLine;
}

export function addLineFromPgn(
  repertoireId: string,
  pgn: string,
  name: string,
  eco?: string
): RepertoireLine | null {
  const line = lineFromPgn(pgn, name, eco);
  if (!line) return null;
  return addLineToRepertoire(repertoireId, line);
}

export function removeLine(repertoireId: string, lineId: string): void {
  const repertoire = getRepertoire(repertoireId);
  if (!repertoire) return;
  repertoire.lines = repertoire.lines.filter((l) => l.id !== lineId);
  updateRepertoire(repertoire);
}

export function updateLineMemory(
  repertoireId: string,
  lineId: string,
  memory: RepertoireLine["memory"]
): void {
  const repertoire = getRepertoire(repertoireId);
  if (!repertoire) return;
  const line = repertoire.lines.find((l) => l.id === lineId);
  if (!line) return;
  line.memory = memory;
  updateRepertoire(repertoire);
}
