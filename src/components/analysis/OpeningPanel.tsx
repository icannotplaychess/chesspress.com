"use client";

import type { LichessExplorerData } from "@/lib/types";

interface OpeningPanelProps {
  explorer: LichessExplorerData | null;
  loading: boolean;
  moveNumber: number;
}

export function OpeningPanel({ explorer, loading, moveNumber }: OpeningPanelProps) {
  const showOpening =
    explorer?.isOpening && explorer.opening?.name;

  return (
    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-4">
      <h3 className="text-sm font-semibold text-[var(--accent-text)] mb-3">
        Opening
      </h3>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : showOpening ? (
        <div className="space-y-2">
          <div>
            <p className="font-medium">{explorer.opening!.name}</p>
            {explorer.opening!.eco && (
              <p className="text-xs text-[var(--muted)]">ECO {explorer.opening!.eco}</p>
            )}
          </div>
          <p className="text-xs text-[var(--muted)]">Move {moveNumber}</p>
        </div>
      ) : explorer && moveNumber > 1 ? (
        <p className="text-sm text-[var(--muted)]">
          Out of opening theory
        </p>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Starting position
        </p>
      )}
    </div>
  );
}
