"use client";

import {
  CLASSIFICATION_COLORS,
  CLASSIFICATION_LABELS,
} from "@/lib/engine/move-classification";
import type { MoveAnalysis } from "@/lib/types";

interface MoveListProps {
  moves: Array<{ san: string; uci: string }>;
  currentIndex: number;
  analyses: MoveAnalysis[];
  onSelect: (index: number) => void;
}

export function MoveList({
  moves,
  currentIndex,
  analyses,
  onSelect,
}: MoveListProps) {
  const pairs: Array<{ white?: string; black?: string; whiteIdx?: number; blackIdx?: number }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      white: moves[i]?.san,
      black: moves[i + 1]?.san,
      whiteIdx: i,
      blackIdx: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  function renderMove(san: string | undefined, idx: number | undefined) {
    if (!san || idx === undefined) return null;
    const analysis = analyses.find((a) => a.moveIndex === idx);
    const classification = analysis?.classification;
    const isActive = currentIndex === idx;

    return (
      <button
        key={idx}
        onClick={() => onSelect(idx)}
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm chess-notation transition-colors ${
          isActive
            ? "bg-[var(--accent)] text-white"
            : "hover:bg-[var(--bg)] text-foreground"
        }`}
      >
        {san}
        {classification && (
          <span
            className="text-[10px] font-bold"
            style={{ color: isActive ? "#fff" : CLASSIFICATION_COLORS[classification] }}
            title={CLASSIFICATION_LABELS[classification]}
          >
            {classification === "brilliant"
              ? "!!"
              : classification === "best"
                ? "✓"
                : classification === "blunder"
                  ? "?"
                  : ""}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="cp-card mb-0 flex flex-col h-full min-h-0 !p-0 overflow-hidden">
      <div className="px-[22px] py-3 border-b border-[var(--line)]">
        <span className="font-mono-label">Moves</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
        {pairs.length === 0 ? (
          <p className="text-[var(--muted)] text-xs">No moves yet</p>
        ) : (
          pairs.map((pair, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[var(--muted)] w-6 shrink-0 pt-0.5">{i + 1}.</span>
              <div className="flex flex-wrap gap-1">
                {renderMove(pair.white, pair.whiteIdx)}
                {renderMove(pair.black, pair.blackIdx)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
