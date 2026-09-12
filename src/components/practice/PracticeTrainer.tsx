"use client";

import { useCallback, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import Link from "next/link";
import { useRepertoires } from "@/hooks/useRepertoires";
import { buildPracticeQueue } from "@/lib/repertoire/scheduler";
import {
  recordCorrect,
  recordIncorrect,
} from "@/lib/repertoire/spaced-repetition";
import * as storage from "@/lib/repertoire/storage";
import type { PracticeMode, PracticePosition } from "@/lib/repertoire/types";

const MODES: { id: PracticeMode; label: string; description: string }[] = [
  { id: "mixed", label: "Mixed Practice", description: "Adaptive mix across all repertoires" },
  { id: "review_due", label: "Review Due", description: "Lines scheduled for today" },
  { id: "learn_new", label: "Learn New", description: "Lines never studied before" },
  { id: "weakest", label: "Weakest Lines", description: "Lowest mastery first" },
  { id: "random", label: "Random", description: "Random variations" },
];

interface PracticeTrainerProps {
  initialMode?: PracticeMode;
  tournamentRepId?: string;
}

export function PracticeTrainer({
  initialMode = "mixed",
  tournamentRepId,
}: PracticeTrainerProps) {
  const { repertoires, loaded, stats } = useRepertoires();
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [sessionActive, setSessionActive] = useState(false);
  const [queue, setQueue] = useState<PracticePosition[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | "hint" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const current = queue[queueIndex] ?? null;

  const startSession = useCallback(() => {
    const positions = buildPracticeQueue(repertoires, mode, tournamentRepId);
    if (positions.length === 0) {
      setFeedback({
        type: null,
        message: "No lines available for this mode. Add lines to your repertoire first.",
      });
      return;
    }
    setQueue(positions);
    setQueueIndex(0);
    setSessionActive(true);
    setSessionStats({ correct: 0, incorrect: 0 });
    setFeedback({ type: null, message: "" });
    setShowHint(false);
  }, [repertoires, mode, tournamentRepId]);

  const handleMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!current) return false;

      const chess = new Chess(current.fen);
      const result = chess.move({
        from,
        to,
        promotion: promotion as "q" | undefined,
      });
      if (!result) return false;

      const playedUci = result.from + result.to + (result.promotion ?? "");
      const expectedUci = current.expectedMove.uci;
      const isCorrect = playedUci === expectedUci;

      const rep = storage.getRepertoire(current.repertoireId);
      const line = rep?.lines.find((l) => l.id === current.lineId);
      if (line) {
        line.memory = isCorrect
          ? recordCorrect(line.memory)
          : recordIncorrect(line.memory);
        storage.updateLineMemory(
          current.repertoireId,
          current.lineId,
          line.memory
        );
      }

      if (isCorrect) {
        setSessionStats((s) => ({ ...s, correct: s.correct + 1 }));
        setFeedback({
          type: "correct",
          message: `Correct! ${current.expectedMove.san} — ${current.lineName}`,
        });

        setTimeout(() => {
          if (queueIndex + 1 < queue.length) {
            setQueueIndex((i) => i + 1);
            setFeedback({ type: null, message: "" });
            setShowHint(false);
          } else {
            setSessionActive(false);
            setFeedback({
              type: "correct",
              message: `Session complete! ${sessionStats.correct + 1} correct.`,
            });
          }
        }, 800);
      } else {
        setSessionStats((s) => ({ ...s, incorrect: s.incorrect + 1 }));
        setFeedback({
          type: "incorrect",
          message: `Not quite. The correct move was ${current.expectedMove.san}. Try to remember it for next time.`,
        });
      }

      return isCorrect;
    },
    [current, queueIndex, queue.length, sessionStats.correct]
  );

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare || !current) return false;
      const chess = new Chess(current.fen);
      const piece = chess.get(sourceSquare as Square);
      const isPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && targetSquare[1] === "8") ||
          (piece.color === "b" && targetSquare[1] === "1"));
      return handleMove(sourceSquare, targetSquare, isPromotion ? "q" : undefined);
    },
    [current, handleMove]
  );

  const progress = useMemo(() => {
    if (queue.length === 0) return 0;
    return Math.round((queueIndex / queue.length) * 100);
  }, [queueIndex, queue.length]);

  if (!loaded) {
    return <p className="text-[var(--muted)]">Loading…</p>;
  }

  if (!sessionActive) {
    const { dueToday, totalLines } = stats();
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Practice</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Active recall with adaptive spaced repetition. What is the correct move?
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Due today" value={dueToday} />
          <StatCard label="Total lines" value={totalLines} />
          <StatCard label="Repertoires" value={repertoires.length} />
        </div>

        {repertoires.length === 0 ? (
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-8 text-center">
            <p className="mb-4">Create a repertoire and add lines before practicing.</p>
            <Link
              href="/repertoires"
              className="rounded-md bg-[var(--accent-bright)] px-4 py-2 text-sm text-white"
            >
              Go to Repertoires
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`text-left rounded-lg border p-4 transition-colors ${
                    mode === m.id
                      ? "border-[var(--accent-bright)] bg-[var(--accent)]/20"
                      : "border-[var(--panel-border)] bg-[var(--panel)] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="font-medium">{m.label}</div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">
                    {m.description}
                  </div>
                </button>
              ))}
            </div>

            {feedback.message && (
              <p className="text-sm text-[var(--muted)]">{feedback.message}</p>
            )}

            <button
              onClick={startSession}
              className="w-full rounded-lg bg-[var(--accent-bright)] py-3 text-sm font-medium text-white"
            >
              Start Practice Session
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
      {/* Minimal practice UI per docs */}
      <div className="w-full flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">{current?.repertoireName}</span>
        <button
          onClick={() => setSessionActive(false)}
          className="text-[var(--muted)] hover:text-foreground"
        >
          Exit
        </button>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#222] overflow-hidden">
        <div
          className="h-full bg-[var(--accent-bright)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-center">
        <span className="text-[var(--accent-text)]">{current?.lineName}</span>
        <span className="text-[var(--muted)]">
          {" "}· Move {current ? current.moveIndex + 1 : 0} of {current?.totalMoves}
        </span>
      </p>

      <p className="text-lg font-medium text-center">
        What is the correct move here?
      </p>

      <div className="w-full max-w-[400px] aspect-square">
        <Chessboard
          options={{
            position: current?.fen ?? "start",
            boardOrientation: orientation,
            onPieceDrop,
            allowDragging: true,
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

      {feedback.type && (
        <div
          className={`w-full rounded-lg px-4 py-3 text-sm text-center ${
            feedback.type === "correct"
              ? "bg-[var(--success)]/20 text-[var(--success)]"
              : feedback.type === "incorrect"
                ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                : "bg-[var(--panel)] text-[var(--muted)]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowHint(true);
            setFeedback({
              type: "hint",
              message: `Hint: the move starts on ${current?.expectedMove.uci.slice(0, 2)}`,
            });
          }}
          disabled={showHint}
          className="rounded-md border border-[var(--panel-border)] px-4 py-2 text-sm disabled:opacity-40"
        >
          Hint
        </button>
        <button
          onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
          className="rounded-md border border-[var(--panel-border)] px-4 py-2 text-sm"
        >
          Flip
        </button>
      </div>

      <p className="text-xs text-[var(--muted)]">
        {sessionStats.correct} correct · {sessionStats.incorrect} incorrect
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}
