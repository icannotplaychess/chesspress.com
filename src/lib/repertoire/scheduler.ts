import type { PracticeMode, PracticePosition, Repertoire } from "@/lib/repertoire/types";
import {
  isDue,
  isNewLine,
  linePriority,
  todayIso,
} from "@/lib/repertoire/spaced-repetition";

export function buildPracticeQueue(
  repertoires: Repertoire[],
  mode: PracticeMode,
  tournamentRepertoireId?: string
): PracticePosition[] {
  const today = todayIso();
  let reps = repertoires;

  if (mode === "tournament" && tournamentRepertoireId) {
    reps = reps.filter((r) => r.id === tournamentRepertoireId);
  }

  const candidates: Array<{ line: Repertoire["lines"][0]; rep: Repertoire; priority: number }> = [];

  for (const rep of reps) {
    for (const line of rep.lines) {
      let include = false;
      let priority = linePriority(line, today);

      switch (mode) {
        case "review_due":
          include = isDue(line.memory, today) && !isNewLine(line.memory);
          break;
        case "learn_new":
          include = isNewLine(line.memory);
          priority = 600;
          break;
        case "weakest":
          include = true;
          priority = 1000 - line.memory.mastery;
          break;
        case "random":
          include = true;
          priority = Math.random() * 1000;
          break;
        case "mixed":
        case "tournament":
          include =
            isDue(line.memory, today) ||
            isNewLine(line.memory) ||
            line.memory.mastery < 70;
          break;
      }

      if (include && line.moves.length > 0) {
        candidates.push({ line, rep, priority });
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);

  const positions: PracticePosition[] = [];

  for (const { line, rep } of candidates.slice(0, 30)) {
    for (let i = 0; i < line.moves.length; i++) {
      const chessFen = i === 0
        ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        : line.moves[i - 1].fen;

      positions.push({
        repertoireId: rep.id,
        repertoireName: rep.name,
        lineId: line.id,
        lineName: line.name,
        moveIndex: i,
        fen: chessFen,
        expectedMove: line.moves[i],
        totalMoves: line.moves.length,
      });
    }
  }

  return positions;
}
