"use client";

import type { LichessExplorerData } from "@/lib/types";

interface DatabasePanelProps {
  explorer: LichessExplorerData | null;
  loading: boolean;
  unavailable?: boolean;
  missingToken?: boolean;
  onPlayMove: (uci: string) => void;
}

export function DatabasePanel({
  explorer,
  loading,
  unavailable,
  missingToken,
  onPlayMove,
}: DatabasePanelProps) {
  return (
    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-4">
      <h3 className="text-sm font-semibold text-[var(--accent-text)] mb-3">
        Lichess Database
      </h3>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading statistics…</p>
      ) : missingToken ? (
        <div className="text-sm text-[var(--muted)] mb-3 space-y-2">
          <p>
            Live Lichess database stats require a personal API token on the server.
          </p>
          <p>
            Create a free token at{" "}
            <a
              href="https://lichess.org/account/oauth/token"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-text)] hover:underline"
            >
              lichess.org/account/oauth/token
            </a>{" "}
            and set <code className="text-xs">LICHESS_API_TOKEN</code> in your
            deployment environment (Vercel → Settings → Environment Variables).
          </p>
          <p>Opening names still work via the local ECO book.</p>
        </div>
      ) : unavailable ? (
        <p className="text-sm text-[var(--muted)] mb-3">
          Lichess database is temporarily unavailable. Opening recognition uses the local ECO book.
        </p>
      ) : null}

      {explorer ? (
        <div className="space-y-3">
          <div className="flex gap-2 text-xs">
            <StatBadge label="White" value={`${explorer.white}%`} color="#e8e8e8" />
            <StatBadge label="Draw" value={`${explorer.draws}%`} color="#888" />
            <StatBadge label="Black" value={`${explorer.black}%`} color="#666" />
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {explorer.moves.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">No games in database</p>
            ) : (
              explorer.moves.slice(0, 12).map((move) => (
                <button
                  key={move.uci}
                  onClick={() => onPlayMove(move.uci)}
                  className="w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-[var(--bg)] transition-colors group"
                >
                  <span className="chess-notation font-medium">{move.san}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-[#e8e8e8]"
                        style={{ width: `${move.white}%` }}
                      />
                      <div
                        className="h-full bg-[#666]"
                        style={{ width: `${move.draws}%` }}
                      />
                      <div
                        className="h-full bg-[#333]"
                        style={{ width: `${move.black}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted)] w-8 text-right">
                      {move.popularity}%
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">No data available</p>
      )}
    </div>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex-1 rounded-md bg-[var(--bg)] px-2 py-1.5 text-center">
      <div className="text-[10px] text-[var(--muted)]">{label}</div>
      <div className="font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
