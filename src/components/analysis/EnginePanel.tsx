"use client";

import { formatEvaluation, toWhitePerspective } from "@/lib/engine/evaluation";
import type { PositionAnalysis } from "@/lib/types";

interface EnginePanelProps {
  analysis: PositionAnalysis | null;
  fen: string;
  isAnalyzing: boolean;
  error?: string | null;
}

export function EnginePanel({ analysis, fen, isAnalyzing, error }: EnginePanelProps) {
  const top = analysis?.lines[0];
  const sideToMove = fen.split(" ")[1] as "w" | "b";
  const whiteEval = top
    ? toWhitePerspective(top.scoreCp, top.scoreMate, sideToMove)
    : { cp: 0, mate: null as number | null };

  const evalLabel = formatEvaluation(whiteEval.cp, whiteEval.mate, "white");

  return (
    <div className="cp-card mb-0">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono-label">Engine</span>
        {isAnalyzing && (
          <span className="text-xs text-[var(--mute)] animate-pulse">Analyzing…</span>
        )}
      </div>

      {error ? (
        <p className="text-sm text-[var(--bad)]">
          {error}. Try refreshing the page.
        </p>
      ) : top ? (
        <div className="space-y-3">
          <div className="cp-eng-score">{evalLabel}</div>
          <p className="text-sm text-[var(--mute)] m-0">
            Best: <b className="chess-notation text-[var(--ink)]">{top.pv[0]}</b>
            {" · "}
            Depth {analysis?.depth ?? 0}
            {analysis?.nodes ? ` · ${(analysis.nodes / 1000).toFixed(0)}k nodes` : ""}
          </p>

          <div className="space-y-1">
            {analysis?.lines.map((line) => {
              const lineEval = toWhitePerspective(
                line.scoreCp,
                line.scoreMate,
                sideToMove
              );
              return (
                <div key={line.multipv} className="cp-engine-line">
                  <b>
                    #{line.multipv}{" "}
                    {formatEvaluation(lineEval.cp, lineEval.mate, "white")}
                  </b>
                  <br />
                  <span className="chess-notation">
                    {line.pv.slice(0, 8).join(" ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--mute)]">
          {isAnalyzing ? "Starting Stockfish…" : "Waiting for position"}
        </p>
      )}
    </div>
  );
}
