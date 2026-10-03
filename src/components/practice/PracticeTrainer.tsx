"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { buildBoardOptions } from "@/lib/chess/board-theme";
import { Chess, type Square } from "chess.js";
import Link from "next/link";
import { useRepertoires } from "@/hooks/useRepertoires";
import {
  boardOrientation,
  buildLineQueue,
  isUserMove,
  START_FEN,
} from "@/lib/repertoire/practice-session";
import {
  linesNeedingLesson,
  recordLineComplete,
  recordMistake,
} from "@/lib/repertoire/spaced-repetition";
import type { LineMemory, PracticeLine, PracticeMode, RepertoireLine } from "@/lib/repertoire/types";

function findStoredLine(
  repertoires: { id: string; lines: RepertoireLine[] }[],
  repertoireId: string,
  lineId: string
): RepertoireLine | undefined {
  const rep = repertoires.find((r) => r.id === repertoireId);
  return rep?.lines.find((l) => l.id === lineId);
}

const MODES: { id: PracticeMode; label: string; description: string }[] = [
  {
    id: "mixed",
    label: "Mixed Practice",
    description: "All lines — weaker ones come up more often",
  },
  {
    id: "weakest",
    label: "Weakest Lines",
    description: "Focus on lines you struggle with most",
  },
  {
    id: "random",
    label: "Random",
    description: "Random variations from your repertoire",
  },
];

interface PracticeTrainerProps {
  initialMode?: PracticeMode;
  tournamentRepId?: string;
  initialLineId?: string;
}

export function PracticeTrainer({
  initialMode = "mixed",
  tournamentRepId,
  initialLineId,
}: PracticeTrainerProps) {
  const { repertoires, loaded, stats, updateLineMemory } = useRepertoires();
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [sessionActive, setSessionActive] = useState(false);
  const [lineQueue, setLineQueue] = useState<PracticeLine[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [fen, setFen] = useState(START_FEN);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [waitingForUser, setWaitingForUser] = useState(false);
  const [mistakesThisLine, setMistakesThisLine] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    linesCompleted: 0,
    mistakes: 0,
  });
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | "complete" | "line-complete" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showHint, setShowHint] = useState(false);
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goToNextLineRef = useRef<
    (lines: PracticeLine[], currentIdx: number, completedCount: number) => void
  >(() => {});

  const currentLine = lineQueue[lineIndex] ?? null;
  const userMoveCount = currentLine
    ? currentLine.moves.filter((_, i) =>
        isUserMove(currentLine.repertoireColor, i)
      ).length
    : 0;
  const userMoveNumber = currentLine
    ? currentLine.moves
        .slice(0, moveIndex + 1)
        .filter((_, i) => isUserMove(currentLine.repertoireColor, i)).length
    : 0;

  const clearAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  const persistMemory = useCallback(
    (line: PracticeLine, memory: LineMemory) => {
      void updateLineMemory(line.repertoireId, line.lineId, memory);
    },
    [updateLineMemory]
  );

  const autoPlayToUserTurn = useCallback(
    (line: PracticeLine, fromIndex: number, currentFen: string) => {
      clearAutoPlay();
      let idx = fromIndex;
      let boardFen = currentFen;

      const step = () => {
        if (idx >= line.moves.length) {
          const storedLine = findStoredLine(
            repertoires,
            line.repertoireId,
            line.lineId
          );
          if (storedLine) {
            const updated = recordLineComplete(storedLine.memory);
            persistMemory(line, updated);
          }
          setSessionStats((s) => ({ ...s, linesCompleted: s.linesCompleted + 1 }));
          setFeedback({
            type: "line-complete",
            message: `Line complete! ${line.lineName}`,
          });
          setWaitingForUser(false);

          autoPlayTimer.current = setTimeout(() => {
            goToNextLineRef.current(
              lineQueue,
              lineIndex,
              sessionStats.linesCompleted + 1
            );
          }, 1200);
          return;
        }

        if (isUserMove(line.repertoireColor, idx)) {
          setMoveIndex(idx);
          setFen(boardFen);
          setWaitingForUser(true);
          setFeedback({ type: null, message: "" });
          setShowHint(false);
          return;
        }

        const move = line.moves[idx];
        setFen(move.fen);
        setMoveIndex(idx);
        boardFen = move.fen;
        idx += 1;
        autoPlayTimer.current = setTimeout(step, 450);
      };

      step();
    },
    [
      clearAutoPlay,
      lineIndex,
      lineQueue,
      persistMemory,
      repertoires,
      sessionStats.linesCompleted,
    ]
  );

  const beginLine = useCallback(
    (line: PracticeLine) => {
      clearAutoPlay();
      setMistakesThisLine(0);
      setMoveIndex(0);
      setFen(START_FEN);
      setOrientation(boardOrientation(line.repertoireColor));
      setFeedback({ type: null, message: "" });
      setShowHint(false);

      if (isUserMove(line.repertoireColor, 0)) {
        setWaitingForUser(true);
      } else {
        setWaitingForUser(false);
        autoPlayToUserTurn(line, 0, START_FEN);
      }
    },
    [autoPlayToUserTurn, clearAutoPlay]
  );

  const goToNextLine = useCallback(
    (lines: PracticeLine[], currentIdx: number, completedCount: number) => {
      const next = currentIdx + 1;
      if (next < lines.length) {
        setLineIndex(next);
        beginLine(lines[next]);
      } else {
        setSessionActive(false);
        setFeedback({
          type: "complete",
          message: `Session complete! ${completedCount} lines memorized.`,
        });
      }
    },
    [beginLine]
  );

  useEffect(() => {
    goToNextLineRef.current = goToNextLine;
  }, [goToNextLine]);

  const restartLine = useCallback(
    (line: PracticeLine, message: string) => {
      setMistakesThisLine((m) => m + 1);
      setSessionStats((s) => ({ ...s, mistakes: s.mistakes + 1 }));
      setFeedback({ type: "incorrect", message });
      setWaitingForUser(false);

      const storedLine = findStoredLine(
        repertoires,
        line.repertoireId,
        line.lineId
      );
      if (storedLine) {
        persistMemory(line, recordMistake(storedLine.memory));
      }

      autoPlayTimer.current = setTimeout(() => {
        beginLine(line);
      }, 1500);
    },
    [beginLine, persistMemory, repertoires]
  );

  const handleMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!currentLine || !waitingForUser) return false;

      const chess = new Chess(fen);
      const result = chess.move({
        from,
        to,
        promotion: promotion as "q" | undefined,
      });
      if (!result) return false;

      const playedUci = result.from + result.to + (result.promotion ?? "");
      const expected = currentLine.moves[moveIndex];
      const isCorrect = playedUci === expected.uci;

      if (!isCorrect) {
        restartLine(
          currentLine,
          `Wrong — the move was ${expected.san}. Restarting the line…`
        );
        return false;
      }

      setFeedback({
        type: "correct",
        message: `Correct! ${expected.san}`,
      });
      setWaitingForUser(false);

      const nextIndex = moveIndex + 1;
      if (nextIndex >= currentLine.moves.length) {
        const storedLine = findStoredLine(
          repertoires,
          currentLine.repertoireId,
          currentLine.lineId
        );
        if (storedLine) {
          persistMemory(currentLine, recordLineComplete(storedLine.memory));
        }
        setSessionStats((s) => ({ ...s, linesCompleted: s.linesCompleted + 1 }));
        setFeedback({
          type: "line-complete",
          message: `Line complete! ${currentLine.lineName}`,
        });

        autoPlayTimer.current = setTimeout(() => {
          goToNextLineRef.current(
            lineQueue,
            lineIndex,
            sessionStats.linesCompleted + 1
          );
        }, 1200);
        return true;
      }

      autoPlayTimer.current = setTimeout(() => {
        autoPlayToUserTurn(currentLine, nextIndex, expected.fen);
      }, 400);

      return true;
    },
    [
      currentLine,
      waitingForUser,
      fen,
      moveIndex,
      restartLine,
      autoPlayToUserTurn,
      persistMemory,
      repertoires,
      lineIndex,
      lineQueue,
      sessionStats.linesCompleted,
    ]
  );

  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string;
      targetSquare: string | null;
    }) => {
      if (!targetSquare || !waitingForUser) return false;
      const chess = new Chess(fen);
      const piece = chess.get(sourceSquare as Square);
      const isPromotion =
        piece?.type === "p" &&
        ((piece.color === "w" && targetSquare[1] === "8") ||
          (piece.color === "b" && targetSquare[1] === "1"));
      return handleMove(sourceSquare, targetSquare, isPromotion ? "q" : undefined);
    },
    [fen, waitingForUser, handleMove]
  );

  const startSession = useCallback(() => {
    const lines = buildLineQueue(repertoires, mode, tournamentRepId, {
      lineId: initialLineId,
      requireLesson: true,
    });
    if (lines.length === 0) {
      const needsLesson = repertoires.reduce(
        (s, r) => s + linesNeedingLesson(r.lines),
        0
      );
      setFeedback({
        type: null,
        message: needsLesson > 0
          ? "Learn your lines with Shreya first — switch to the Learn tab above."
          : "No lines available. Add lines to your repertoire first.",
      });
      return;
    }
    clearAutoPlay();
    setLineQueue(lines);
    setLineIndex(0);
    setSessionActive(true);
    setSessionStats({ linesCompleted: 0, mistakes: 0 });
    setFeedback({ type: null, message: "" });
    beginLine(lines[0]);
  }, [repertoires, mode, tournamentRepId, initialLineId, clearAutoPlay, beginLine]);

  const exitSession = useCallback(() => {
    clearAutoPlay();
    setSessionActive(false);
    setWaitingForUser(false);
  }, [clearAutoPlay]);

  if (!loaded) {
    return <p className="text-[var(--muted)]">Loading…</p>;
  }

  if (!sessionActive) {
    const { totalLines, linesToPractice, needsLesson } = stats();
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="cp-card mb-0 text-sm">
          <span className="font-mono-label">Practice session</span>
          <p className="text-[var(--mute)] mt-2 mb-0">
            Play your moves from memory. Miss a move and you repeat the line until
            it sticks.
          </p>
        </div>

        {needsLesson > 0 && (
          <div className="cp-card mb-0 text-sm flex items-center justify-between gap-4 border-[var(--brand)]/30 bg-[var(--glow)]">
            <span>
              {needsLesson} line{needsLesson !== 1 ? "s" : ""} not learned yet —
              study them before practicing.
            </span>
            <Link
              href="/practice?step=learn"
              className="shrink-0 cp-btn"
            >
              Learn first
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Lines to practice" value={linesToPractice} />
          <StatCard label="Total lines" value={totalLines} />
          <StatCard label="Repertoires" value={repertoires.length} />
        </div>

        {repertoires.length === 0 ? (
          <div className="cp-card p-8 text-center">
            <p className="mb-4">Create a repertoire and add lines before practicing.</p>
            <Link
              href="/repertoires"
              className="cp-btn"
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
                      : "border-[var(--panel-border)] bg-[var(--panel)] hover:bg-[var(--card)]"
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
              className="w-full cp-btn w-full"
            >
              Start Practice Session
            </button>
          </>
        )}
      </div>
    );
  }

  const lineProgress =
    lineQueue.length > 0
      ? Math.round((lineIndex / lineQueue.length) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
      <div className="w-full flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">{currentLine?.repertoireName}</span>
        <button
          onClick={exitSession}
          className="text-[var(--muted)] hover:text-foreground"
        >
          Exit
        </button>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[var(--track)] overflow-hidden">
        <div
          className="h-full bg-[var(--accent-bright)] transition-all"
          style={{ width: `${lineProgress}%` }}
        />
      </div>

      <p className="text-sm text-center">
        <span className="text-[var(--accent-text)]">{currentLine?.lineName}</span>
        <span className="text-[var(--muted)]">
          {" "}
          · Line {lineIndex + 1} of {lineQueue.length}
          {userMoveCount > 0 && ` · Your move ${userMoveNumber} of ${userMoveCount}`}
        </span>
      </p>

      <p className="text-lg font-medium text-center">
        {waitingForUser ? "Play the correct move" : "Watch opponent moves…"}
      </p>

      <div className="w-full max-w-[400px] aspect-square">
        <Chessboard
          options={buildBoardOptions({
            position: fen,
            boardOrientation: orientation,
            onPieceDrop,
            allowDragging: waitingForUser,
          })}
        />
      </div>

      {feedback.type && (
        <div
          className={`w-full rounded-lg px-4 py-3 text-sm text-center ${
            feedback.type === "correct" || feedback.type === "line-complete"
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
            if (!currentLine || !waitingForUser) return;
            setShowHint(true);
            const expected = currentLine.moves[moveIndex];
            setFeedback({
              type: null,
              message: `Hint: the move starts on ${expected.uci.slice(0, 2)}`,
            });
          }}
          disabled={showHint || !waitingForUser}
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
        {sessionStats.linesCompleted} lines completed · {sessionStats.mistakes} mistakes
        {mistakesThisLine > 0 && ` · ${mistakesThisLine} restarts this line`}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="cp-card mb-0 p-3 text-center">
      <div className="cp-stat-value text-[32px]">{value}</div>
      <div className="font-mono-label mt-1">{label}</div>
    </div>
  );
}
