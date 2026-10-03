"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { consumeAnalysisPgn } from "@/lib/analysis/pgn-transfer";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { EnginePanel } from "@/components/analysis/EnginePanel";
import { MoveList } from "@/components/analysis/MoveList";
import { OpeningPanel } from "@/components/analysis/OpeningPanel";
import { DatabasePanel } from "@/components/analysis/DatabasePanel";
import { CoachPanel } from "@/components/analysis/CoachPanel";
import { Toolbar } from "@/components/analysis/Toolbar";
import { useChessGame } from "@/hooks/useChessGame";
import { useStockfish } from "@/hooks/useStockfish";
import { useLichessExplorer } from "@/hooks/useLichessExplorer";
import { analyzeFullGame } from "@/lib/engine/game-analyzer";
import { toWhitePerspective } from "@/lib/engine/evaluation";
import { generateCoachMessage, generatePhase } from "@/lib/coach/shreya";
import { BoardWrapper } from "@/components/chess/BoardWrapper";
import {
  buildBoardOptions,
  engineArrow,
  LAST_MOVE_HIGHLIGHT,
} from "@/lib/chess/board-theme";
import type { Arrow } from "react-chessboard";

export function AnalysisBoard() {
  const searchParams = useSearchParams();
  const loadedFromUrl = useRef(false);
  const game = useChessGame();
  const {
    analysis,
    isAnalyzing,
    hasEval,
    engineReady,
    error: engineError,
  } = useStockfish(game.currentFen);
  const { data: explorer, loading: explorerLoading, unavailable: explorerUnavailable, missingToken: explorerMissingToken } = useLichessExplorer(
    game.currentFen,
    game.history.slice(0, game.moveIndex + 1).map((m) => m.uci)
  );
  const [isAnalyzingGame, setIsAnalyzingGame] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string | null>(null);
  const engineArrows = useMemo((): Arrow[] => {
    const best = analysis?.lines[0]?.pv[0];
    const arrow = best ? engineArrow(best) : null;
    return arrow ? [arrow] : [];
  }, [analysis]);

  const phase = generatePhase(game.currentFen, game.moveNumber);

  const currentClassification = useMemo(() => {
    if (game.moveIndex < 0) return null;
    return (
      game.moveAnalyses.find((a) => a.moveIndex === game.moveIndex)
        ?.classification ?? null
    );
  }, [game.moveAnalyses, game.moveIndex]);

  const coachMessage = useMemo(
    () =>
      generateCoachMessage({
        personality: "balanced",
        fen: game.currentFen,
        lastMove: game.lastMove?.san,
        classification: currentClassification,
        analysis,
        explorer,
        moveNumber: game.moveNumber,
        phase,
      }),
    [
      game.currentFen,
      game.lastMove,
      currentClassification,
      analysis,
      explorer,
      game.moveNumber,
      phase,
    ]
  );

  const evalDisplay = useMemo(() => {
    if (!analysis?.lines[0]) return { cp: 0, mate: null as number | null };
    const line = analysis.lines[0];
    const sideToMove = game.currentFen.split(" ")[1] as "w" | "b";
    return toWhitePerspective(line.scoreCp, line.scoreMate, sideToMove);
  }, [analysis, game.currentFen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (game.lastMove) {
      styles[game.lastMove.from] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
      styles[game.lastMove.to] = { backgroundColor: LAST_MOVE_HIGHLIGHT };
    }
    return styles;
  }, [game.lastMove]);

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { pieceType: string };
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare) return false;

      const chess = new Chess(game.currentFen);
      const piece = chess.get(sourceSquare as Square);
      const isPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && targetSquare[1] === "8") ||
          (piece.color === "b" && targetSquare[1] === "1"));

      return game.makeMove(
        sourceSquare,
        targetSquare,
        isPromotion ? "q" : undefined
      );
    },
    [game]
  );

  const playDatabaseMove = useCallback(
    (uci: string) => {
      if (!game.isAtLatest) return;
      const from = uci.slice(0, 2);
      const to = uci.slice(2, 4);
      const promotion = uci.length > 4 ? uci[4] : undefined;
      game.makeMove(from, to, promotion);
    },
    [game]
  );

  const handleAnalyzeGame = useCallback(async () => {
    if (game.history.length === 0) return;
    setIsAnalyzingGame(true);
    setAnalysisProgress("0%");
    try {
      const moves = game.history.map((m) => m.san);
      const results = await analyzeFullGame(moves, {
        depth: 14,
        onProgress: (done, total) => {
          setAnalysisProgress(`${Math.round((done / total) * 100)}%`);
        },
      });
      game.setMoveAnalyses(results);
    } finally {
      setIsAnalyzingGame(false);
      setAnalysisProgress(null);
    }
  }, [game]);

  const handleCopyPgn = useCallback(() => {
    navigator.clipboard.writeText(game.getPgn());
  }, [game]);

  const handleCopyFen = useCallback(() => {
    navigator.clipboard.writeText(game.currentFen);
  }, [game]);

  useEffect(() => {
    if (loadedFromUrl.current) return;
    loadedFromUrl.current = true;

    const from = searchParams.get("from");
    if (from === "scout") {
      const pgn = consumeAnalysisPgn();
      if (pgn) game.loadPgn(pgn);
      return;
    }

    const pgnParam = searchParams.get("pgn");
    if (pgnParam) {
      game.loadPgn(decodeURIComponent(pgnParam));
    }
  }, [searchParams, game]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") game.undo();
      if (e.key === "ArrowRight") game.redo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <Toolbar
        onReset={game.reset}
        onFlip={game.flipBoard}
        onUndo={game.undo}
        onRedo={game.redo}
        onLoadPgn={game.loadPgn}
        onLoadFen={game.loadFen}
        onCopyPgn={handleCopyPgn}
        onCopyFen={handleCopyFen}
        onAnalyzeGame={handleAnalyzeGame}
        isAnalyzingGame={isAnalyzingGame}
        canUndo={game.moveIndex >= 0}
        canRedo={game.moveIndex < game.history.length - 1}
      />

      {analysisProgress && (
        <div className="text-sm text-[var(--accent-text)]">
          Analyzing game: {analysisProgress}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 flex-1 min-h-0">
        {/* Left panel */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <OpeningPanel
            explorer={explorer}
            loading={explorerLoading}
            moveNumber={game.moveNumber}
          />
          <DatabasePanel
            explorer={explorer}
            loading={explorerLoading}
            unavailable={explorerUnavailable}
            missingToken={explorerMissingToken}
            onPlayMove={playDatabaseMove}
          />
        </div>

        {/* Center — board */}
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
                onPieceDrop,
                allowDragging: game.isAtLatest,
                arrows: engineArrows,
                squareStyles,
              })}
            />
          </BoardWrapper>
          <CoachPanel message={coachMessage} />
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 order-3 min-h-[400px] lg:min-h-0">
          <div className="flex-1 min-h-[200px]">
            <MoveList
              moves={game.history}
              currentIndex={game.moveIndex}
              analyses={game.moveAnalyses}
              onSelect={game.goToMove}
            />
          </div>
          <EnginePanel
            analysis={analysis}
            fen={game.currentFen}
            isAnalyzing={isAnalyzing || !engineReady}
            error={engineError}
          />
        </div>
      </div>
    </div>
  );
}
