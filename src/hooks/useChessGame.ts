"use client";

import { useCallback, useMemo, useState } from "react";
import { Chess } from "chess.js";
import type { MoveAnalysis } from "@/lib/types";

export interface GameMove {
  san: string;
  uci: string;
  from: string;
  to: string;
}

export function useChessGame() {
  const [chess] = useState(() => new Chess());
  const [version, setVersion] = useState(0);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [history, setHistory] = useState<GameMove[]>([]);
  const [fenStack, setFenStack] = useState<string[]>([chess.fen()]);
  const [moveAnalyses, setMoveAnalyses] = useState<MoveAnalysis[]>([]);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const currentFen = useMemo(() => {
    void version;
    if (moveIndex < 0) return fenStack[0];
    return fenStack[moveIndex + 1] ?? fenStack[fenStack.length - 1];
  }, [fenStack, moveIndex, version]);

  const displayChess = useMemo(() => {
    const c = new Chess(currentFen);
    return c;
  }, [currentFen]);

  const isAtLatest = moveIndex === history.length - 1 || (moveIndex === -1 && history.length === 0);

  const makeMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!isAtLatest) return false;

      const result = chess.move({ from, to, promotion: promotion as "q" | undefined });
      if (!result) return false;

      const gameMove: GameMove = {
        san: result.san,
        uci: result.from + result.to + (result.promotion ?? ""),
        from: result.from,
        to: result.to,
      };

      setHistory((h) => [...h, gameMove]);
      setFenStack((s) => [...s, chess.fen()]);
      setMoveIndex((i) => i + 1);
      bump();
      return true;
    },
    [chess, isAtLatest, bump]
  );

  const goToMove = useCallback(
    (index: number) => {
      setMoveIndex(index);
      bump();
    },
    [bump]
  );

  const undo = useCallback(() => {
    if (moveIndex < 0) return;
    goToMove(moveIndex - 1);
  }, [moveIndex, goToMove]);

  const redo = useCallback(() => {
    if (moveIndex >= history.length - 1) return;
    goToMove(moveIndex + 1);
  }, [moveIndex, history.length, goToMove]);

  const reset = useCallback(() => {
    chess.reset();
    setHistory([]);
    setFenStack([chess.fen()]);
    setMoveIndex(-1);
    setMoveAnalyses([]);
    bump();
  }, [chess, bump]);

  const loadPgn = useCallback(
    (pgn: string): boolean => {
      const temp = new Chess();
      try {
        temp.loadPgn(pgn);
      } catch {
        return false;
      }

      chess.reset();
      const moves = temp.history();
      const newHistory: GameMove[] = [];
      const newFens = [chess.fen()];

      for (const san of moves) {
        const m = chess.move(san);
        if (!m) return false;
        newHistory.push({
          san: m.san,
          uci: m.from + m.to + (m.promotion ?? ""),
          from: m.from,
          to: m.to,
        });
        newFens.push(chess.fen());
      }

      setHistory(newHistory);
      setFenStack(newFens);
      setMoveIndex(newHistory.length - 1);
      setMoveAnalyses([]);
      bump();
      return true;
    },
    [chess, bump]
  );

  const loadFen = useCallback(
    (fen: string): boolean => {
      try {
        chess.load(fen);
      } catch {
        return false;
      }
      setHistory([]);
      setFenStack([chess.fen()]);
      setMoveIndex(-1);
      setMoveAnalyses([]);
      bump();
      return true;
    },
    [chess, bump]
  );

  const flipBoard = useCallback(() => {
    setOrientation((o) => (o === "white" ? "black" : "white"));
  }, []);

  const getPgn = useCallback((): string => {
    const temp = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      const m = history[i];
      if (!m) break;
      temp.move(m.san);
    }
    return temp.pgn();
  }, [history, moveIndex]);

  const lastMove = useMemo(() => {
    if (moveIndex < 0) return null;
    return history[moveIndex] ?? null;
  }, [history, moveIndex]);

  return {
    chess: displayChess,
    currentFen,
    history,
    moveIndex,
    moveAnalyses,
    setMoveAnalyses,
    orientation,
    isAtLatest,
    makeMove,
    goToMove,
    undo,
    redo,
    reset,
    loadPgn,
    loadFen,
    flipBoard,
    getPgn,
    lastMove,
    moveNumber: Math.max(1, Math.ceil((moveIndex + 1) / 2)),
  };
}
