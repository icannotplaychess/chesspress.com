"use client";

import { formatEvaluation } from "@/lib/engine/evaluation";
import type { PositionAnalysis } from "@/lib/types";

interface EnginePanelProps {
  analysis: PositionAnalysis | null;
  isAnalyzing: boolean;
  error?: string | null;
}

export function EnginePanel({ analysis, isAnalyzing, error }: EnginePanelProps) {
  const top = analysis?.lines[0];

  return (
    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--accent-text)]">Engine</h3>
        {isAnalyzing && (
          <span className="text-xs text-[var(--muted)] animate-pulse">Analyzing…</span>
        )}
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]">
          {error}. Try refreshing the page.
        </p>
      ) : top ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold chess-notation">
              {formatEvaluation(top.scoreCp, top.scoreMate)}
            </span>
            {top.pv[0] && (
              <span className="text-sm text-[var(--muted)]">
                Best: <span className="chess-notation text-foreground">{top.pv[0]}</span>
              </span>
            )}
          </div>

          <div className="text-xs text-[var(--muted)]">
            Depth {analysis?.depth ?? 0}
            {analysis?.nodes ? ` · ${(analysis.nodes / 1000).toFixed(0)}k nodes` : ""}
          </div>

          <div className="space-y-2">
            {analysis?.lines.map((line) => (
              <div
                key={line.multipv}
                className="rounded-md bg-[#0a0a0a] px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[var(--accent-text)] font-medium">
                    #{line.multipv}
                  </span>
                  <span className="chess-notation font-semibold">
                    {formatEvaluation(line.scoreCp, line.scoreMate)}
                  </span>
                </div>
                <div className="chess-notation text-[var(--muted)] truncate">
                  {line.pv.slice(0, 8).join(" ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          {isAnalyzing ? "Starting Stockfish…" : "Waiting for position"}
        </p>
      )}
    </div>
  );
}
