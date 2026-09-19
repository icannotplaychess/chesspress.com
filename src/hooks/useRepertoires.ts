"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import type { Repertoire, RepertoireLine } from "@/lib/repertoire/types";
import * as storage from "@/lib/repertoire/storage";
import {
  createInitialMemory,
  linesNeedingLesson,
  linesNeedingPractice,
  recordLessonComplete,
  repertoireMastery,
} from "@/lib/repertoire/spaced-repetition";
import type { LineMemory } from "@/lib/repertoire/types";

async function fetchServerRepertoires(): Promise<Repertoire[]> {
  const res = await fetch("/api/repertoires");
  if (!res.ok) return [];
  return res.json();
}

async function migrateLocalToServer(): Promise<void> {
  const local = storage.getRepertoires();
  if (local.length === 0) return;
  await fetch("/api/repertoires/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repertoires: local }),
  });
}

/** Merge practice/lesson progress from localStorage when server rows are stale. */
function mergeLocalLineMemory(
  serverReps: Repertoire[],
  localReps: Repertoire[]
): { merged: Repertoire[]; changed: boolean } {
  let changed = false;
  const merged = serverReps.map((rep) => {
    const localRep = localReps.find((l) => l.id === rep.id);
    if (!localRep) return rep;

    const lines = rep.lines.map((line) => {
      const localLine = localRep.lines.find((l) => l.id === line.id);
      if (!localLine) return line;

      const localMem = localLine.memory;
      const serverMem = line.memory;
      const localAhead =
        (localMem.lessonCompleted && !serverMem.lessonCompleted) ||
        localMem.mastery > serverMem.mastery ||
        localMem.correctAttempts > serverMem.correctAttempts ||
        localMem.incorrectAttempts > serverMem.incorrectAttempts;

      if (!localAhead) return line;

      changed = true;
      return {
        ...line,
        memory: {
          ...serverMem,
          ...localMem,
          lessonCompleted: localMem.lessonCompleted || serverMem.lessonCompleted,
        },
      };
    });

    return { ...rep, lines };
  });

  return { merged, changed };
}

async function persistRepertoireToServer(rep: Repertoire): Promise<void> {
  await fetch("/api/repertoires", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rep),
  });
}

export function useRepertoires() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      await migrateLocalToServer();
      let data = await fetchServerRepertoires();
      const local = storage.getRepertoires();
      if (local.length > 0 && data.length > 0) {
        const { merged, changed } = mergeLocalLineMemory(data, local);
        if (changed) {
          for (const rep of merged) {
            await persistRepertoireToServer(rep);
          }
          data = await fetchServerRepertoires();
        } else {
          data = merged;
        }
      }
      setRepertoires(data);
    } else if (typeof window !== "undefined") {
      setRepertoires(storage.getRepertoires());
    }
    setLoaded(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (status === "loading") return;
    queueMicrotask(() => {
      void refresh();
    });
  }, [status, refresh]);

  const persistRepertoire = useCallback(
    async (rep: Repertoire) => {
      if (isAuthenticated) {
        await fetch("/api/repertoires", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rep),
        });
      } else {
        storage.updateRepertoire(rep);
      }
    },
    [isAuthenticated]
  );

  const create = useCallback(
    async (name: string, color: Repertoire["color"] = "white") => {
      if (isAuthenticated) {
        const res = await fetch("/api/repertoires", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        const rep = await res.json();
        await refresh();
        return rep as Repertoire;
      }
      const rep = storage.createRepertoire(name, color);
      await refresh();
      return rep;
    },
    [isAuthenticated, refresh]
  );

  const update = useCallback(
    async (repertoire: Repertoire) => {
      if (isAuthenticated) {
        await fetch("/api/repertoires", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(repertoire),
        });
      } else {
        storage.updateRepertoire(repertoire);
      }
      await refresh();
    },
    [isAuthenticated, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await fetch(`/api/repertoires/${id}`, { method: "DELETE" });
      } else {
        storage.deleteRepertoire(id);
      }
      await refresh();
    },
    [isAuthenticated, refresh]
  );

  const duplicate = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        const copy = storage.duplicateRepertoire(id);
        await refresh();
        return copy;
      }
      const rep = repertoires.find((r) => r.id === id);
      if (!rep) return null;
      const res = await fetch("/api/repertoires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${rep.name} (copy)`, color: rep.color }),
      });
      const newRep = await res.json();
      await fetch("/api/repertoires", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRep, lines: rep.lines.map((l) => ({ ...l, id: crypto.randomUUID() })) }),
      });
      await refresh();
      return newRep;
    },
    [isAuthenticated, repertoires, refresh]
  );

  const addLine = useCallback(
    async (repertoireId: string, line: Omit<RepertoireLine, "id" | "memory">) => {
      if (isAuthenticated) {
        const rep = repertoires.find((r) => r.id === repertoireId);
        if (!rep) return null;
        const { createInitialMemory } = await import("@/lib/repertoire/spaced-repetition");
        const lineWithMemory: RepertoireLine = {
          ...line,
          id: crypto.randomUUID(),
          memory: createInitialMemory(),
        };
        const updated = {
          ...rep,
          lines: [...rep.lines, lineWithMemory],
        };
        await persistRepertoire(updated);
        await refresh();
        return lineWithMemory;
      }
      const result = storage.addLineToRepertoire(repertoireId, line);
      await refresh();
      return result;
    },
    [isAuthenticated, repertoires, persistRepertoire, refresh]
  );

  const addLineFromPgn = useCallback(
    async (repertoireId: string, pgn: string, name: string, eco?: string) => {
      if (isAuthenticated) {
        const result = storage.addLineFromPgn(repertoireId, pgn, name, eco);
        if (!result) return null;
        const rep = repertoires.find((r) => r.id === repertoireId);
        if (rep) {
          await persistRepertoire({
            ...rep,
            lines: [...rep.lines, result],
          });
        }
        await refresh();
        return result;
      }
      const result = storage.addLineFromPgn(repertoireId, pgn, name, eco);
      await refresh();
      return result;
    },
    [isAuthenticated, repertoires, persistRepertoire, refresh]
  );

  const updateLineMemory = useCallback(
    async (repertoireId: string, lineId: string, memory: LineMemory) => {
      const rep = repertoires.find((r) => r.id === repertoireId);
      if (!rep) {
        storage.updateLineMemory(repertoireId, lineId, memory);
        await refresh();
        return;
      }

      const lines = rep.lines.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          memory: {
            ...createInitialMemory(),
            ...line.memory,
            ...memory,
            lessonCompleted:
              memory.lessonCompleted ?? line.memory.lessonCompleted ?? false,
          },
        };
      });

      const updated: Repertoire = { ...rep, lines };

      if (isAuthenticated) {
        await persistRepertoire(updated);
      } else {
        storage.updateLineMemory(repertoireId, lineId, memory);
      }
      await refresh();
    },
    [repertoires, isAuthenticated, persistRepertoire, refresh]
  );

  const markLessonComplete = useCallback(
    async (repertoireId: string, lineId: string) => {
      const rep = repertoires.find((r) => r.id === repertoireId);
      if (!rep) {
        storage.markLessonComplete(repertoireId, lineId);
        await refresh();
        return;
      }

      const lines = rep.lines.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          memory: recordLessonComplete({
            ...createInitialMemory(),
            ...line.memory,
          }),
        };
      });

      const updated: Repertoire = { ...rep, lines };

      if (isAuthenticated) {
        await persistRepertoire(updated);
      } else {
        storage.markLessonComplete(repertoireId, lineId);
      }
      await refresh();
    },
    [repertoires, isAuthenticated, persistRepertoire, refresh]
  );

  const removeLine = useCallback(
    async (repertoireId: string, lineId: string) => {
      if (isAuthenticated) {
        const rep = repertoires.find((r) => r.id === repertoireId);
        if (rep) {
          await persistRepertoire({
            ...rep,
            lines: rep.lines.filter((l) => l.id !== lineId),
          });
        }
      } else {
        storage.removeLine(repertoireId, lineId);
      }
      await refresh();
    },
    [isAuthenticated, repertoires, persistRepertoire, refresh]
  );

  const stats = useCallback(() => {
    const totalLines = repertoires.reduce((s, r) => s + r.lines.length, 0);
    const linesToPractice = repertoires.reduce(
      (s, r) => s + linesNeedingPractice(r.lines),
      0
    );
    const needsLesson = repertoires.reduce(
      (s, r) => s + linesNeedingLesson(r.lines),
      0
    );
    const avgMastery =
      repertoires.length > 0
        ? Math.round(
            repertoires.reduce((s, r) => s + repertoireMastery(r.lines), 0) /
              repertoires.length
          )
        : 0;
    return { totalLines, linesToPractice, needsLesson, avgMastery };
  }, [repertoires]);

  return {
    repertoires,
    loaded,
    refresh,
    create,
    update,
    remove,
    duplicate,
    addLine,
    addLineFromPgn,
    removeLine,
    updateLineMemory,
    markLessonComplete,
    stats,
  };
}
