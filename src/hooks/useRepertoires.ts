"use client";

import { useCallback, useState } from "react";
import type { Repertoire, RepertoireLine } from "@/lib/repertoire/types";
import * as storage from "@/lib/repertoire/storage";
import {
  linesNeedingLesson,
  linesNeedingPractice,
  repertoireMastery,
} from "@/lib/repertoire/spaced-repetition";

export function useRepertoires() {
  const [repertoires, setRepertoires] = useState<Repertoire[]>(() =>
    typeof window === "undefined" ? [] : storage.getRepertoires()
  );
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined");

  const refresh = useCallback(() => {
    setRepertoires(storage.getRepertoires());
    setLoaded(true);
  }, []);

  const create = useCallback(
    (name: string, color: Repertoire["color"] = "white") => {
      const rep = storage.createRepertoire(name, color);
      refresh();
      return rep;
    },
    [refresh]
  );

  const update = useCallback(
    (repertoire: Repertoire) => {
      storage.updateRepertoire(repertoire);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      storage.deleteRepertoire(id);
      refresh();
    },
    [refresh]
  );

  const duplicate = useCallback(
    (id: string) => {
      const copy = storage.duplicateRepertoire(id);
      refresh();
      return copy;
    },
    [refresh]
  );

  const addLine = useCallback(
    (repertoireId: string, line: Omit<RepertoireLine, "id" | "memory">) => {
      const result = storage.addLineToRepertoire(repertoireId, line);
      refresh();
      return result;
    },
    [refresh]
  );

  const addLineFromPgn = useCallback(
    (repertoireId: string, pgn: string, name: string, eco?: string) => {
      const result = storage.addLineFromPgn(repertoireId, pgn, name, eco);
      refresh();
      return result;
    },
    [refresh]
  );

  const removeLine = useCallback(
    (repertoireId: string, lineId: string) => {
      storage.removeLine(repertoireId, lineId);
      refresh();
    },
    [refresh]
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
    stats,
  };
}
