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
    <div className="cp-card mb-0">
      <span className="font-mono-label">Lichess database</span>

      {loading ? (
        <p className="text-sm text-[var(--mute)] mt-3">Loading statistics…</p>
      ) : missingToken ? (
        <div className="text-sm text-[var(--mute)] mt-3 mb-3 space-y-2">
          <p>
            Live Lichess database stats require a personal API token on the server.
          </p>
          <p>
            Create a free token at{" "}
            <a
              href="https://lichess.org/account/oauth/token"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand)] hover:underline"
            >
              lichess.org/account/oauth/token
            </a>{" "}
            and set <code className="text-xs">LICHESS_API_TOKEN</code> in your
            deployment environment (Vercel → Settings → Environment Variables).
          </p>
          <p>Opening names still work via the local ECO book.</p>
        </div>
      ) : unavailable ? (
        <p className="text-sm text-[var(--mute)] mt-3 mb-3">
          Lichess database is temporarily unavailable. Opening recognition uses the local ECO book.
        </p>
      ) : null}

      {explorer ? (
        <div className="space-y-3 mt-3">
          <div className="cp-wdl">
            <div>
              <b>{explorer.white}%</b>
              <span className="font-mono-label block mt-1">White</span>
            </div>
            <div>
              <b>{explorer.draws}%</b>
              <span className="font-mono-label block mt-1">Draw</span>
            </div>
            <div>
              <b>{explorer.black}%</b>
              <span className="font-mono-label block mt-1">Black</span>
            </div>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {explorer.moves.length === 0 ? (
              <p className="text-xs text-[var(--mute)]">No games in database</p>
            ) : (
              explorer.moves.slice(0, 12).map((move) => (
                <button
                  key={move.uci}
                  type="button"
                  onClick={() => onPlayMove(move.uci)}
                  className="w-full cp-mv-row hover:opacity-90 transition-opacity text-left bg-transparent border-0 cursor-pointer p-0"
                >
                  <b className="chess-notation">{move.san}</b>
                  <div className="cp-bar good">
                    <span style={{ width: `${move.popularity}%` }} />
                  </div>
                  <span>{move.popularity}%</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--mute)] mt-3">No data available</p>
      )}
    </div>
  );
}
