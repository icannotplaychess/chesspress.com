"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzePositionCached } from "@/lib/engine/game-analyzer";
import type { PositionAnalysis } from "@/lib/types";

export function useStockfish(fen: string, enabled = true) {
  const [analysis, setAnalysis] = useState<PositionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const analyze = useCallback(async (targetFen: string) => {
    const requestId = ++requestRef.current;
    setIsAnalyzing(true);
    setError(null);

    try {
      await analyzePositionCached(targetFen, 18, (partial) => {
        if (requestId === requestRef.current) {
          setAnalysis(partial);
        }
      });
    } catch (err) {
      if (requestId === requestRef.current) {
        setError(err instanceof Error ? err.message : "Engine error");
      }
    } finally {
      if (requestId === requestRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !fen) return;

    const requestId = ++requestRef.current;
    const timer = setTimeout(() => {
      analyze(fen);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (requestRef.current === requestId) {
        requestRef.current++;
      }
    };
  }, [fen, enabled, analyze]);

  return { analysis, isAnalyzing, error };
}
