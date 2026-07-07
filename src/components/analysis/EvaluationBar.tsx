"use client";

import { cpToBarValue, formatEvaluation } from "@/lib/engine/evaluation";

interface EvaluationBarProps {
  cp: number | null;
  mate: number | null;
  orientation?: "white" | "black";
  isAnalyzing?: boolean;
}

export function EvaluationBar({
  cp,
  mate,
  orientation = "white",
  isAnalyzing = false,
}: EvaluationBarProps) {
  let whiteCp = cp ?? 0;
  let whiteMate = mate;

  if (orientation === "black") {
    whiteCp = -whiteCp;
    whiteMate = whiteMate !== null ? -whiteMate : null;
  }

  const value = cpToBarValue(whiteCp, whiteMate);
  // Fill from bottom: 50% = equal, higher = white better, lower = black better
  const fillPercent = Math.max(3, Math.min(97, ((value + 1) / 2) * 100));
  const evalLabel = formatEvaluation(whiteCp, whiteMate, "white");

  // Place label in the half that has contrast
  const labelOnWhiteHalf = fillPercent > 50;

  return (
    <div
      className="relative w-7 h-full min-h-[200px] rounded-sm overflow-hidden border border-[var(--panel-border)] bg-[#0d0d0d]"
      aria-label={`Evaluation: ${evalLabel}`}
    >
      {/* White advantage — grows from bottom (Chess.com style) */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-[#e8e8e8] transition-[height] duration-300 ease-out"
        style={{ height: `${fillPercent}%` }}
      />

      {/* Center line at equal position */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-[#444] -translate-y-1/2 pointer-events-none" />

      {/* Eval score */}
      <div
        className={`absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10 px-0.5 ${
          labelOnWhiteHalf ? "bottom-2" : "top-2"
        }`}
      >
        <span
          className={`text-[10px] font-bold leading-tight text-center tabular-nums ${
            labelOnWhiteHalf ? "text-[#1a1a1a]" : "text-[#e8e8e8]"
          } ${isAnalyzing ? "opacity-70" : ""}`}
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {evalLabel}
        </span>
      </div>
    </div>
  );
}
