"use client";

import { useCallback, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { EvaluationBar } from "@/components/analysis/EvaluationBar";
import { EnginePanel } from "@/components/analysis/EnginePanel";
import { DatabasePanel } from "@/components/analysis/DatabasePanel";
import { OpeningPanel } from "@/components/analysis/OpeningPanel";
import { MoveList } from "@/components/analysis/MoveList";
import { AddToRepertoireModal } from "@/components/shared/AddToRepertoireModal";
import { useExplorerGame } from "@/hooks/useExplorerGame";
import { useStockfish } from "@/hooks/useStockfish";
import { useLichessExplorer } from "@/hooks/useLichessExplorer";
import { useRepertoires } from "@/hooks/useRepertoires";
import { toWhitePerspective } from "@/lib/engine/evaluation";
import { searchOpenings } from "@/lib/openings/search";
import type { Arrow } from "react-chessboard";

export function OpeningExplorer() {
  const game = useExplorerGame();
  const { analysis, isAnalyzing, error: engineError } = useStockfish(game.currentFen);
  const { data: explorer, loading, unavailable, missingToken } = useLichessExplorer(
    game.currentFen,
    game.uciHistory
  );
  const { repertoires, create, addLine } = useRepertoires();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const searchResults = useMemo(
    () => (searchQuery.length >= 2 ? searchOpenings(searchQuery, 12) : []),
    [searchQuery]
  );

  const evalDisplay = useMemo(() => {
    if (!analysis?.lines[0]) return { cp: 0, mate: null as number | null };
    const line = analysis.lines[0];
    const sideToMove = game.currentFen.split(" ")[1] as "w" | "b";
    return toWhitePerspective(line.scoreCp, line.scoreMate, sideToMove);
  }, [analysis, game.currentFen]);

  const engineArrows = useMemo((): Arrow[] => {
    const best = analysis?.lines[0]?.pv[0];
    if (!best || best.length < 4) return [];
    return [
      {
        startSquare: best.slice(0, 2),
        endSquare: best.slice(2, 4),
        color: "rgba(107, 163, 224, 0.8)",
      },
    ];
  }, [analysis]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (game.lastMove) {
      styles[game.lastMove.from] = { backgroundColor: "rgba(155, 199, 0, 0.41)" };
      styles[game.lastMove.to] = { backgroundColor: "rgba(155, 199, 0, 0.41)" };
    }
    return styles;
  }, [game.lastMove]);

  const handleAddLine = useCallback(
    (repertoireId: string, lineName: string, eco?: string) => {
      addLine(repertoireId, {
        name: lineName,
        eco: eco ?? explorer?.opening?.eco ?? undefined,
        moves: game.getLineMoves(),
      });
    },
    [game, addLine, explorer]
  );

  const openingName =
    explorer?.opening?.name ?? searchResults[0]?.name ?? "Starting Position";

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search openings by name or ECO code…"
          className="w-full max-w-md rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-2 text-sm"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-1 w-full max-w-md z-20 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] shadow-xl max-h-64 overflow-y-auto">
            {searchResults.map((r) => (
              <button
                key={`${r.eco}-${r.name}`}
                onClick={() => {
                  game.loadMoves(r.uciMoves);
                  setSearchQuery("");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#222] border-b border-[var(--panel-border)] last:border-0"
              >
                <span className="text-[var(--accent-text)] font-mono text-xs mr-2">
                  {r.eco}
                </span>
                {r.name}
                <span className="text-[var(--muted)] ml-2 text-xs">
                  {r.moveCount} moves
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={game.reset}
          className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-sm hover:bg-[#222]"
        >
          Reset
        </button>
        <button
          onClick={game.flipBoard}
          className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-sm hover:bg-[#222]"
        >
          Flip
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={game.history.length === 0}
          className="rounded-md bg-[var(--accent-bright)] px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          Add to Repertoire
        </button>
        <a
          href="/practice?step=learn"
          className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-sm hover:bg-[#222]"
        >
          Learn & Practice
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-4">
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <OpeningPanel
            explorer={explorer}
            loading={loading}
            moveNumber={game.moveNumber}
          />
          <DatabasePanel
            explorer={explorer}
            loading={loading}
            unavailable={unavailable}
            missingToken={missingToken}
            onPlayMove={game.playUci}
          />
        </div>

        <div className="flex flex-col items-center gap-4 order-1 lg:order-2">
          <div className="grid grid-cols-[28px_1fr] gap-2 w-full max-w-[min(100%,560px)] items-stretch">
            <EvaluationBar
              cp={evalDisplay.cp}
              mate={evalDisplay.mate}
              orientation={game.orientation}
              isAnalyzing={isAnalyzing}
            />
            <div className="w-full aspect-square min-w-0">
              <Chessboard
                options={{
                  position: game.currentFen,
                  boardOrientation: game.orientation,
                  onPieceDrop: game.onPieceDrop,
                  allowDragging: game.isAtLatest,
                  arrows: engineArrows,
                  squareStyles,
                  darkSquareStyle: { backgroundColor: "#2d4a6f" },
                  lightSquareStyle: { backgroundColor: "#4a6fa5" },
                  boardStyle: {
                    borderRadius: "4px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                  },
                  animationDurationInMs: 200,
                  showNotation: true,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 order-3 min-h-[400px]">
          <div className="flex-1 min-h-[180px]">
            <MoveList
              moves={game.history}
              currentIndex={game.moveIndex}
              analyses={[]}
              onSelect={game.goToMove}
            />
          </div>
          <EnginePanel
            analysis={analysis}
            fen={game.currentFen}
            isAnalyzing={isAnalyzing}
            error={engineError}
          />
        </div>
      </div>

      {showAddModal && (
        <AddToRepertoireModal
          repertoires={repertoires}
          lineName={openingName}
          eco={explorer?.opening?.eco ?? undefined}
          moves={game.getLineMoves()}
          onAdd={handleAddLine}
          onCreate={(name) => create(name)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
