import type { LineMemory, RepertoireLine } from "@/lib/repertoire/types";

/** Session-based progress — ChessReps style, not calendar scheduling. */
export function createInitialMemory(): LineMemory {
  return {
    correctAttempts: 0,
    incorrectAttempts: 0,
    confidence: 0,
    lastReviewed: null,
    nextReview: null,
    intervalDays: 0,
    intervalIndex: 0,
    mastery: 0,
    lessonCompleted: false,
  };
}

export function recordLessonComplete(memory: LineMemory): LineMemory {
  return {
    ...memory,
    lessonCompleted: true,
    lastReviewed: todayIso(),
  };
}

export function linesNeedingLesson(lines: RepertoireLine[]): number {
  return lines.filter((l) => !l.memory.lessonCompleted && l.moves.length > 0).length;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Called when the user makes a wrong move and must restart the line. */
export function recordMistake(memory: LineMemory): LineMemory {
  const incorrectAttempts = memory.incorrectAttempts + 1;
  const mastery = Math.max(
    0,
    Math.round(
      (memory.correctAttempts /
        (memory.correctAttempts + incorrectAttempts + 1)) *
        100
    )
  );

  return {
    ...memory,
    incorrectAttempts,
    confidence: Math.max(0, memory.confidence - 10),
    mastery,
    lastReviewed: todayIso(),
  };
}

/** Called when the user completes a full line without mistakes in that run. */
export function recordLineComplete(memory: LineMemory): LineMemory {
  const correctAttempts = memory.correctAttempts + 1;
  const mastery = Math.min(
    100,
    Math.round(
      (correctAttempts / (correctAttempts + memory.incorrectAttempts + 1)) * 100
    ) + (correctAttempts >= 3 ? 20 : 0)
  );

  return {
    ...memory,
    correctAttempts,
    confidence: Math.min(100, memory.confidence + 15),
    mastery: Math.min(100, mastery),
    lastReviewed: todayIso(),
  };
}

export function repertoireMastery(lines: RepertoireLine[]): number {
  if (lines.length === 0) return 0;
  return Math.round(
    lines.reduce((sum, l) => sum + l.memory.mastery, 0) / lines.length
  );
}

export function linesNeedingPractice(lines: RepertoireLine[]): number {
  return lines.filter((l) => l.memory.mastery < 100).length;
}

/** @deprecated Use linesNeedingPractice — kept for compatibility */
export function linesDueToday(lines: RepertoireLine[]): number {
  return linesNeedingPractice(lines);
}

export function isNewLine(memory: LineMemory): boolean {
  return memory.correctAttempts === 0 && memory.incorrectAttempts === 0;
}
