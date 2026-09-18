"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzePositionCached,
  analyzePositionLive,
} from "@/lib/engine/game-analyzer";
import { getStockfishEngine } from "@/lib/engine/stockfish";
import type { PositionAnalysis } from "@/lib/types";

export function useStockfish(fen: string, enabled = true) {
  const [analysis, setAnalysis] = useState<PositionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const engineRef = useRef<ReturnType<typeof getStockfishEngine> | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStockfishEngine()
      .then(() => {
        if (!cancelled) setEngineReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Engine failed to start");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const analyze = useCallback(async (targetFen: string, requestId: number) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      engineRef.current = getStockfishEngine();
      await engineRef.current;

      await analyzePositionLive(targetFen, 350, (partial) => {
        if (requestId === requestIdRef.current && partial.lines.length > 0) {
          setAnalysis(partial);
        }
      });

      if (requestId !== requestIdRef.current) return;

      await analyzePositionCached(targetFen, 18, (partial) => {
        if (requestId === requestIdRef.current && partial.lines.length > 0) {
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
    if (!enabled || !fen || !engineReady) return;

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      analyze(fen, requestId);
    }, 120);

    return () => {
      clearTimeout(timer);
      getStockfishEngine()
        .then((engine) => engine.stop())
        .catch(() => undefined);
    };
  }, [fen, enabled, engineReady, analyze]);

  const hasEval = Boolean(analysis?.lines[0]);

  return { analysis, isAnalyzing, engineReady, hasEval, error };
}
