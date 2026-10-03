"use client";

import { useCallback, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { buildBoardOptions } from "@/lib/chess/board-theme";
import Link from "next/link";
import { CoachPanel } from "@/components/analysis/CoachPanel";
import { useRepertoires } from "@/hooks/useRepertoires";
import {
  buildLineLesson,
  buildLinesNeedingLesson,
} from "@/lib/coach/opening-lesson";
import { boardOrientation } from "@/lib/repertoire/practice-session";
import { linesNeedingLesson } from "@/lib/repertoire/spaced-repetition";
import type { PracticeLine } from "@/lib/repertoire/types";

interface LearnTrainerProps {
  tournamentRepId?: string;
  initialLineId?: string;
}

type LessonStep = "intro" | "move" | "complete";

export function LearnTrainer({
  tournamentRepId,
  initialLineId,
}: LearnTrainerProps) {
  const { repertoires, loaded, markLessonComplete } = useRepertoires();
  const [sessionActive, setSessionActive] = useState(false);
  const [lineQueue, setLineQueue] = useState<PracticeLine[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [step, setStep] = useState<LessonStep>("intro");
  const [moveRevealed, setMoveRevealed] = useState(false);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const currentLine = lineQueue[lineIndex] ?? null;
  const lesson = useMemo(
    () => (currentLine ? buildLineLesson(currentLine) : null),
    [currentLine]
  );
  const currentMoveLesson = lesson?.moves[moveIndex] ?? null;

  const boardFen = useMemo(() => {
    if (!lesson) return undefined;
    if (step === "intro") return lesson.moves[0]?.fenBefore ?? undefined;
    if (!currentMoveLesson) return undefined;
    return moveRevealed ? currentMoveLesson.fenAfter : currentMoveLesson.fenBefore;
  }, [lesson, step, currentMoveLesson, moveRevealed]);

  const coachMessage = useMemo(() => {
    if (!lesson) return "";
    if (step === "intro") {
      return `${lesson.intro}\n\n${lesson.openingSummary}`;
    }
    if (step === "complete") {
      return lesson.practicePrompt;
    }
    if (!currentMoveLesson) return "";
    const role = currentMoveLesson.isUserMove
      ? "This is **your** move in this repertoire."
      : "This is your opponent's reply.";
    return `${role}\n\n**${currentMoveLesson.title}**\n\n${currentMoveLesson.explanation}\n\nKey ideas:\n${currentMoveLesson.ideas.map((i) => `• ${i}`).join("\n")}`;
  }, [lesson, step, currentMoveLesson]);

  const startSession = useCallback(() => {
    const allLines: PracticeLine[] = [];
    for (const rep of repertoires) {
      for (const line of rep.lines) {
        if (line.moves.length === 0) continue;
        allLines.push({
          repertoireId: rep.id,
          repertoireName: rep.name,
          repertoireColor: rep.color,
          lineId: line.id,
          lineName: line.name,
          eco: line.eco,
          moves: line.moves,
        });
      }
    }

    let lines = buildLinesNeedingLesson(repertoires);
    if (tournamentRepId) {
      lines = lines.filter((l) => l.repertoireId === tournamentRepId);
    }
    if (initialLineId) {
      const specific = allLines.find((l) => l.lineId === initialLineId);
      if (specific) lines = [specific];
    }
    if (lines.length === 0) {
      return;
    }
    setLineQueue(lines);
    setLineIndex(0);
    setMoveIndex(0);
    setStep("intro");
    setMoveRevealed(false);
    setOrientation(boardOrientation(lines[0].repertoireColor));
    setSessionActive(true);
  }, [repertoires, tournamentRepId, initialLineId]);

  const beginLine = useCallback((line: PracticeLine) => {
    setMoveIndex(0);
    setStep("intro");
    setMoveRevealed(false);
    setOrientation(boardOrientation(line.repertoireColor));
  }, []);

  const finishLine = useCallback(() => {
    if (!currentLine) return;
    void markLessonComplete(currentLine.repertoireId, currentLine.lineId);
    setStep("complete");
  }, [currentLine, markLessonComplete]);

  const goToNextLine = useCallback(() => {
    const next = lineIndex + 1;
    if (next < lineQueue.length) {
      setLineIndex(next);
      beginLine(lineQueue[next]);
    } else {
      setSessionActive(false);
    }
  }, [lineIndex, lineQueue, beginLine]);

  const handleContinue = useCallback(() => {
    if (!lesson) return;

    if (step === "intro") {
      setStep("move");
      setMoveRevealed(false);
      return;
    }

    if (step === "complete") {
      goToNextLine();
      return;
    }

    if (!moveRevealed) {
      setMoveRevealed(true);
      return;
    }

    if (moveIndex + 1 < lesson.moves.length) {
      setMoveIndex((i) => i + 1);
      setMoveRevealed(false);
    } else {
      finishLine();
    }
  }, [lesson, step, moveRevealed, moveIndex, finishLine, goToNextLine]);

  const unlearnedCount = repertoires.reduce(
    (s, r) => s + linesNeedingLesson(r.lines),
    0
  );

  if (!loaded) {
    return <p className="text-[var(--muted)]">Loading…</p>;
  }

  if (!sessionActive) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="cp-card mb-0 text-sm">
          <span className="font-mono-label">Learn with Shreya</span>
          <p className="text-[var(--mute)] mt-2 mb-0">
            Shreya walks you through every move — ideas, plans, and why each move
            matters. Learn first, then practice from memory.
          </p>
        </div>

        <div className="cp-card mb-0 text-sm border-[var(--brand)]/30 bg-[var(--glow)]">
          <strong className="text-[var(--brand)]">Recommended flow</strong>
          <ol className="mt-2 space-y-1 text-[var(--muted)] list-decimal list-inside">
            <li>Learn the line with Shreya (guided explanations)</li>
            <li>Practice from memory (repeat on mistakes until it sticks)</li>
          </ol>
        </div>

        {repertoires.length === 0 ? (
          <div className="cp-card p-8 text-center">
            <p className="mb-4">Add lines to your repertoire before learning.</p>
            <Link
              href="/explorer"
              className="cp-btn"
            >
              Explore Openings
            </Link>
          </div>
        ) : unlearnedCount === 0 ? (
          <div className="cp-card p-8 text-center space-y-4">
            <p>You&apos;ve learned all your lines with Shreya.</p>
            <Link
              href="/practice?step=practice"
              className="inline-block cp-btn"
            >
              Go to Practice
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)]">
              {unlearnedCount} line{unlearnedCount !== 1 ? "s" : ""} waiting to be
              learned
            </p>
            <button
              onClick={startSession}
              className="w-full cp-btn w-full"
            >
              {initialLineId ? "Learn this line" : "Start Learning Session"}
            </button>
          </>
        )}
      </div>
    );
  }

  const practiceHref = currentLine
    ? `/practice?step=practice&mode=tournament&rep=${currentLine.repertoireId}&line=${currentLine.lineId}`
    : "/practice?step=practice";

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">
          {currentLine?.repertoireName} · {currentLine?.lineName}
        </span>
        <button
          onClick={() => setSessionActive(false)}
          className="text-[var(--muted)] hover:text-foreground"
        >
          Exit
        </button>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[var(--track)] overflow-hidden">
        <div
          className="h-full bg-[var(--brand)] transition-all"
          style={{
            width: lesson
              ? `${Math.round(
                  ((step === "complete"
                    ? lesson.moves.length
                    : step === "intro"
                      ? 0
                      : moveIndex + (moveRevealed ? 1 : 0)) /
                    (lesson.moves.length + 1)) *
                    100
                )}%`
              : "0%",
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-start">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-center text-[var(--muted)]">
            {step === "intro"
              ? "Introduction"
              : step === "complete"
                ? "Line learned!"
                : `Move ${moveIndex + 1} of ${lesson?.moves.length ?? 0}${
                    currentMoveLesson?.isUserMove ? " · Your move" : " · Opponent"
                  }`}
          </p>

          <div className="w-full max-w-[360px] aspect-square">
            <Chessboard
              options={buildBoardOptions({
                position: boardFen,
                boardOrientation: orientation,
                allowDragging: false,
                animationDurationInMs: 300,
              })}
            />
          </div>

          {step === "move" && currentMoveLesson && !moveRevealed && (
            <p className="text-sm text-[var(--accent-text)]">
              {currentMoveLesson.isUserMove
                ? `Your move: find ${currentMoveLesson.san}`
                : `Watch: ${currentMoveLesson.san}`}
            </p>
          )}
          {step === "move" && moveRevealed && currentMoveLesson && (
            <p className="text-lg font-semibold chess-notation">
              {currentMoveLesson.san}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleContinue}
              className="cp-btn w-full"
            >
              {step === "intro"
                ? "Start the line"
                : step === "complete"
                  ? lineIndex + 1 < lineQueue.length
                    ? "Next line"
                    : "Finish"
                  : !moveRevealed
                    ? "Show move"
                    : moveIndex + 1 < (lesson?.moves.length ?? 0)
                      ? "Next move"
                      : "Complete lesson"}
            </button>
            <button
              onClick={() =>
                setOrientation((o) => (o === "white" ? "black" : "white"))
              }
              className="rounded-lg border border-[var(--panel-border)] px-4 py-2.5 text-sm"
            >
              Flip
            </button>
          </div>
        </div>

        <CoachPanel message={coachMessage.replace(/\*\*/g, "")} />
      </div>

      {step === "complete" && (
        <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-4 text-center space-y-3">
          <p className="text-sm">
            Nice work — you understand this line. Now drill it from memory.
          </p>
          <Link
            href={practiceHref}
            className="inline-block cp-btn w-full"
          >
            Practice this line
          </Link>
        </div>
      )}
    </div>
  );
}
