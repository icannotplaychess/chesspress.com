import type { LineMemory, RepertoireLine } from "@/lib/repertoire/types";

/** Review intervals in days per docs (02_FEATURES.md). */
export const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30, 90];

export function createInitialMemory(): LineMemory {
  const today = todayIso();
  return {
    correctAttempts: 0,
    incorrectAttempts: 0,
    confidence: 0,
    lastReviewed: null,
    nextReview: today,
    intervalDays: 0,
    intervalIndex: 0,
    mastery: 0,
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isDue(memory: LineMemory, today = todayIso()): boolean {
  if (!memory.nextReview) return true;
  return memory.nextReview <= today;
}

export function isNewLine(memory: LineMemory): boolean {
  return memory.correctAttempts === 0 && memory.incorrectAttempts === 0;
}

export function recordCorrect(memory: LineMemory): LineMemory {
  const nextIndex = Math.min(
    memory.intervalIndex + 1,
    REVIEW_INTERVALS.length - 1
  );
  const intervalDays = REVIEW_INTERVALS[nextIndex];
  const today = todayIso();

  const correctAttempts = memory.correctAttempts + 1;
  const mastery = Math.min(
    100,
    Math.round((correctAttempts / (correctAttempts + memory.incorrectAttempts + 1)) * 100)
  );

  return {
    ...memory,
    correctAttempts,
    intervalIndex: nextIndex,
    intervalDays,
    lastReviewed: today,
    nextReview: addDays(today, intervalDays),
    confidence: Math.min(100, memory.confidence + 10),
    mastery,
  };
}

export function recordIncorrect(memory: LineMemory): LineMemory {
  const today = todayIso();
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
    intervalIndex: 0,
    intervalDays: 0,
    lastReviewed: today,
    nextReview: today,
    confidence: Math.max(0, memory.confidence - 15),
    mastery,
  };
}

export function linePriority(line: RepertoireLine, today = todayIso()): number {
  const m = line.memory;
  if (isDue(m, today) && !isNewLine(m)) return 1000 - m.mastery;
  if (isNewLine(m)) return 500;
  if (m.incorrectAttempts > 0 && isDue(m, today)) return 800 - m.mastery;
  return m.mastery;
}

export function repertoireMastery(lines: RepertoireLine[]): number {
  if (lines.length === 0) return 0;
  return Math.round(
    lines.reduce((sum, l) => sum + l.memory.mastery, 0) / lines.length
  );
}

export function linesDueToday(lines: RepertoireLine[], today = todayIso()): number {
  return lines.filter((l) => isDue(l.memory, today)).length;
}
