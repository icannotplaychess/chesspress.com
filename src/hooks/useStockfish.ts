"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzePositionCached } from "@/lib/engine/game-analyzer";
import type { PositionAnalysis } from "@/lib/types";

export function useStockfish(fen: string, enabled = true) {
  const [analysis, setAnalysis] = useState<PositionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const analyze = useCallback(async (targetFen: string, requestId: number) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      await analyzePositionCached(targetFen, 18, (partial) => {
        if (requestId === requestIdRef.current) {
          setAnalysis(partial);
        }
      });
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : "Engine failed to start");
        setAnalysis(null);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !fen) return;

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      analyze(fen, requestId);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [fen, enabled, analyze]);

  return { analysis, isAnalyzing, error };
}
