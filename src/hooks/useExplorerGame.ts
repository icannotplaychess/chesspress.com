"use client";

import { useCallback, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";

export interface ExplorerMove {
  san: string;
  uci: string;
  from: string;
  to: string;
}

export function useExplorerGame() {
  const [chess] = useState(() => new Chess());
  const [version, setVersion] = useState(0);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [history, setHistory] = useState<ExplorerMove[]>([]);
  const [fenStack, setFenStack] = useState<string[]>([chess.fen()]);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const currentFen = useMemo(() => {
    void version;
    if (moveIndex < 0) return fenStack[0];
    return fenStack[moveIndex + 1] ?? fenStack[fenStack.length - 1];
  }, [fenStack, moveIndex, version]);

  const isAtLatest =
    moveIndex === history.length - 1 ||
    (moveIndex === -1 && history.length === 0);

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!isAtLatest) return false;
      const result = chess.move({
        from,
        to,
        promotion: promotion as "q" | undefined,
      });
      if (!result) return false;

      const move: ExplorerMove = {
        san: result.san,
        uci: result.from + result.to + (result.promotion ?? ""),
        from: result.from,
        to: result.to,
      };

      setHistory((h) => [...h, move]);
      setFenStack((s) => [...s, chess.fen()]);
      setMoveIndex((i) => i + 1);
      bump();
      return true;
    },
    [chess, isAtLatest, bump]
  );

  const playUci = useCallback(
    (uci: string): boolean => {
      if (!isAtLatest) return false;
      return makeMove(
        uci.slice(0, 2),
        uci.slice(2, 4),
        uci.length > 4 ? uci[4] : undefined
      );
    },
    [isAtLatest, makeMove]
  );

  const goToMove = useCallback(
    (index: number) => {
      setMoveIndex(index);
      bump();
    },
    [bump]
  );

  const reset = useCallback(() => {
    chess.reset();
    setHistory([]);
    setFenStack([chess.fen()]);
    setMoveIndex(-1);
    bump();
  }, [chess, bump]);

  const loadMoves = useCallback(
    (uciMoves: string[]) => {
      chess.reset();
      const newHistory: ExplorerMove[] = [];
      const newFens = [chess.fen()];

      for (const uci of uciMoves) {
        const result = chess.move({
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          promotion: uci.length > 4 ? uci[4] : undefined,
        });
        if (!result) return false;
        newHistory.push({
          san: result.san,
          uci,
          from: result.from,
          to: result.to,
        });
        newFens.push(chess.fen());
      }

      setHistory(newHistory);
      setFenStack(newFens);
      setMoveIndex(newHistory.length - 1);
      bump();
      return true;
    },
    [chess, bump]
  );

  const getLineMoves = useCallback(() => {
    return history.map((m, i) => ({
      san: m.san,
      uci: m.uci,
      fen: fenStack[i + 1] ?? currentFen,
    }));
  }, [history, fenStack, currentFen]);

  const lastMove = moveIndex >= 0 ? history[moveIndex] ?? null : null;

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare) return false;
      const c = new Chess(currentFen);
      const piece = c.get(sourceSquare as Square);
      const isPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && targetSquare[1] === "8") ||
          (piece.color === "b" && targetSquare[1] === "1"));
      return makeMove(sourceSquare, targetSquare, isPromotion ? "q" : undefined);
    },
    [currentFen, makeMove]
  );

  return {
    currentFen,
    history,
    moveIndex,
    orientation,
    isAtLatest,
    lastMove,
    makeMove,
    playUci,
    goToMove,
    reset,
    loadMoves,
    getLineMoves,
    onPieceDrop,
    flipBoard: () =>
      setOrientation((o) => (o === "white" ? "black" : "white")),
    moveNumber: Math.max(1, Math.ceil((moveIndex + 1) / 2)),
    uciHistory: history.map((m) => m.uci),
  };
}
