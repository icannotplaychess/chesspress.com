"use client";

import { cpToBarValue, formatEvaluation } from "@/lib/engine/evaluation";

interface EvaluationBarProps {
  cp: number | null;
  mate: number | null;
  orientation?: "white" | "black";
  isAnalyzing?: boolean;
  hasEval?: boolean;
  title?: string;
}

export function EvaluationBar({
  cp,
  mate,
  orientation = "white",
  isAnalyzing = false,
  hasEval = true,
  title,
}: EvaluationBarProps) {
  let whiteCp = cp ?? 0;
  let whiteMate = mate;

  if (orientation === "black") {
    whiteCp = -whiteCp;
    whiteMate = whiteMate !== null ? -whiteMate : null;
  }

  const pending = isAnalyzing && !hasEval;
  const value = cpToBarValue(whiteCp, whiteMate);
  const fillPercent = pending
    ? 50
    : Math.max(3, Math.min(97, ((value + 1) / 2) * 100));
  const evalLabel = pending ? "…" : formatEvaluation(whiteCp, whiteMate, "white");

  return (
    <div
      className="cp-eval-bar"
      title={title ?? evalLabel}
      aria-label={`Evaluation: ${evalLabel}`}
    >
      <i
        style={{ height: `${fillPercent}%` }}
        className={pending ? "animate-pulse" : ""}
      />
    </div>
  );
}
