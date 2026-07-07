"use client";

import { useEffect, useState } from "react";
import { fetchLichessExplorer } from "@/lib/lichess/explorer";
import type { LichessExplorerData } from "@/lib/types";

export function useLichessExplorer(fen: string, uciMoves: string[] = []) {
  const [data, setData] = useState<LichessExplorerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const movesKey = uciMoves.join(",");

  useEffect(() => {
    if (!fen) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchLichessExplorer(fen, {
          uciMoves: movesKey ? movesKey.split(",") : [],
        });
        if (!cancelled) {
          setData(result);
          setUnavailable(!!(result as { unavailable?: boolean }).unavailable);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Database error");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fen, movesKey]);

  return { data, loading, error, unavailable };
}
