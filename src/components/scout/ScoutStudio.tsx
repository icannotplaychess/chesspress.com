"use client";

import { useCallback, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { buildBoardOptions } from "@/lib/chess/board-theme";
import { Chess, type Square } from "chess.js";
import type { NormalizedGame } from "@/lib/scout/normalized-game";
import type { ScoutPlatform } from "@/lib/scout/types";

interface ScoutStudioProps {
  username: string;
  platform: ScoutPlatform;
  games: NormalizedGame[];
  initialColor: "white" | "black";
  onClose: () => void;
}

function gamesMatchingPrefix(
  games: NormalizedGame[],
  color: "white" | "black",
  sans: string[]
): NormalizedGame[] {
  return games.filter((g) => {
    if (g.color !== color) return false;
    if (g.moveSans.length < sans.length) return false;
    for (let i = 0; i < sans.length; i++) {
      if (g.moveSans[i] !== sans[i]) return false;
    }
    return true;
  });
}

export function ScoutStudio({
  username,
  platform,
  games,
  initialColor,
  onClose,
}: ScoutStudioProps) {
  const [color, setColor] = useState<"white" | "black">(initialColor);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [lineSans, setLineSans] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<"white" | "black">(initialColor);

  const fen = useMemo(() => {
    const c = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      if (lineSans[i]) {
        try {
          c.move(lineSans[i]);
        } catch {
          break;
        }
      }
    }
    return c.fen();
  }, [lineSans, moveIndex]);

  const matching = useMemo(
    () => gamesMatchingPrefix(games, color, lineSans.slice(0, moveIndex + 1)),
    [games, color, lineSans, moveIndex]
  );

  const stats = useMemo(() => {
    if (matching.length === 0) return null;
    const w = matching.filter((g) => g.result === "win").length;
    const d = matching.filter((g) => g.result === "draw").length;
    const l = matching.filter((g) => g.result === "loss").length;
    return {
      count: matching.length,
      winPct: Math.round((w / matching.length) * 100),
      drawPct: Math.round((d / matching.length) * 100),
      lossPct: Math.round((l / matching.length) * 100),
    };
  }, [matching]);

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare) return false;
      const c = new Chess();
      for (let i = 0; i <= moveIndex; i++) {
        if (lineSans[i]) c.move(lineSans[i]);
      }
      const move = c.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });
      if (!move) return false;
      const next = [...lineSans.slice(0, moveIndex + 1), move.san];
      setLineSans(next);
      setMoveIndex(next.length - 1);
      return true;
    },
    [lineSans, moveIndex]
  );

  const resetLine = () => {
    setLineSans([]);
    setMoveIndex(-1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[var(--panel)] border border-[var(--panel-border)] rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Studio — {username} ({platform})
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-[var(--muted)] hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setColor("white");
              setOrientation("white");
              resetLine();
            }}
            className={`cp-pill ${color === "white" ? "on" : ""}`}
          >
            White
          </button>
          <button
            onClick={() => {
              setColor("black");
              setOrientation("black");
              resetLine();
            }}
            className={`px-3 py-1.5 rounded text-sm ${color === "black" ? "bg-[var(--accent-bright)] text-white" : "border border-[var(--panel-border)]"}`}
          >
            Black
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px] gap-4">
          <div className="space-y-3">
            <div className="w-full max-w-[420px] aspect-square mx-auto">
              <Chessboard
                options={buildBoardOptions({
                  position: fen,
                  boardOrientation: orientation,
                  onPieceDrop,
                  allowDragging: true,
                })}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-sm">
              <button onClick={resetLine} className="px-2 py-1 border rounded">
                |◀
              </button>
              <button
                onClick={() => setMoveIndex((i) => Math.max(-1, i - 1))}
                className="px-2 py-1 border rounded"
              >
                ◀
              </button>
              <button
                onClick={() =>
                  setMoveIndex((i) => Math.min(lineSans.length - 1, i + 1))
                }
                className="px-2 py-1 border rounded"
              >
                ▶
              </button>
              <button
                onClick={() => setMoveIndex(lineSans.length - 1)}
                className="px-2 py-1 border rounded"
              >
                ▶|
              </button>
              <button
                onClick={() =>
                  setOrientation((o) => (o === "white" ? "black" : "white"))
                }
                className="px-2 py-1 border rounded"
              >
                Flip
              </button>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="chess-notation text-xs leading-relaxed">
              {lineSans.length === 0
                ? "Starting position"
                : lineSans.join(" ")}
            </div>
            {stats ? (
              <p>
                {stats.count} games in this line · wins {stats.winPct}%, draws{" "}
                {stats.drawPct}%, losses {stats.lossPct}%
              </p>
            ) : (
              <p className="text-[var(--muted)]">
                Free exploration — no games from here. Keep playing through their
                typical moves.
              </p>
            )}
            {matching.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Top games in this line</h4>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {matching.slice(0, 5).map((g) => (
                    <li key={g.id} className="text-xs border-b border-[var(--panel-border)] pb-1">
                      <span
                        className={
                          g.result === "win"
                            ? "text-[var(--success)]"
                            : g.result === "loss"
                              ? "text-[var(--danger)]"
                              : "text-[var(--muted)]"
                        }
                      >
                        {g.result === "win" ? "1-0" : g.result === "loss" ? "0-1" : "½-½"}
                      </span>
                      {" "}
                      {g.opponent}
                      {g.opponentRating ? ` (${g.opponentRating})` : ""}
                      {g.gameUrl && (
                        <a
                          href={g.gameUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-[var(--accent-text)]"
                        >
                          View ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
