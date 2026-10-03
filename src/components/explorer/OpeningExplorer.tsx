"use client";

import { useCallback, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { BoardWrapper } from "@/components/chess/BoardWrapper";
import {
  buildBoardOptions,
  engineArrow,
  LAST_MOVE_HIGHLIGHT,
} from "@/lib/chess/board-theme";
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
    const arrow = best ? engineArrow(best) : null;
    return arrow ? [arrow] : [];
  }, [analysis]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (game.lastMove) {
      styles[game.lastMove.from] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
      styles[game.lastMove.to] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
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
    <div className="flex flex-col gap-4 cp-card">
      <div className="relative">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search openings by name or ECO code…"
          className="cp-search-page mt-3"
          aria-label="Search openings"
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
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg)] border-b border-[var(--panel-border)] last:border-0"
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
      <div className="flex flex-wrap gap-2 tools mt-3">
        <button type="button" onClick={game.reset} className="cp-ghost">
          Reset
        </button>
        <button type="button" onClick={game.flipBoard} className="cp-ghost">
          Flip
        </button>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          disabled={game.history.length === 0}
          className="cp-ghost cp-ghost-primary disabled:opacity-40"
        >
          Add to Repertoire
        </button>
        <a href="/practice?step=learn" className="cp-ghost no-underline inline-flex items-center">
          Learn & Practice
        </a>
      </div>

      <div className="cp-explorer-grid mt-4">
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
          <BoardWrapper
            cp={evalDisplay.cp}
            mate={evalDisplay.mate}
            orientation={game.orientation}
          >
            <Chessboard
              options={buildBoardOptions({
                position: game.currentFen,
                boardOrientation: game.orientation,
                onPieceDrop: game.onPieceDrop,
                allowDragging: game.isAtLatest,
                arrows: engineArrows,
                squareStyles,
              })}
            />
          </BoardWrapper>
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
