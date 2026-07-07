"use client";

import { cpToBarValue } from "@/lib/engine/evaluation";

interface EvaluationBarProps {
  cp: number | null;
  mate: number | null;
  orientation?: "white" | "black";
}

export function EvaluationBar({ cp, mate, orientation = "white" }: EvaluationBarProps) {
  let displayCp = cp;
  let displayMate = mate;

  if (orientation === "black") {
    displayCp = displayCp !== null ? -displayCp : null;
    displayMate = displayMate !== null ? -displayMate : null;
  }

  const value = cpToBarValue(displayCp ?? 0, displayMate);
  const whitePercent = ((value + 1) / 2) * 100;
  const clampedWhite = Math.max(2, Math.min(98, whitePercent));

  return (
    <div className="flex h-full w-6 flex-col rounded-md overflow-hidden border border-[var(--panel-border)] bg-[#1a1a1a]">
      <div
        className="w-full bg-[#e8e8e8] transition-all duration-500 ease-out"
        style={{ height: `${clampedWhite}%` }}
      />
      <div className="flex-1 w-full bg-[#1a1a1a]" />
    </div>
  );
}
