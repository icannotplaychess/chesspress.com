import type { PracticeMode, PracticeLine, Repertoire, RepertoireMove } from "@/lib/repertoire/types";

export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function isUserMove(
  color: Repertoire["color"],
  moveIndex: number
): boolean {
  const isWhiteMove = moveIndex % 2 === 0;
  if (color === "white") return isWhiteMove;
  if (color === "black") return !isWhiteMove;
  return true;
}

export function fenBeforeMove(moves: RepertoireMove[], moveIndex: number): string {
  if (moveIndex === 0) return START_FEN;
  return moves[moveIndex - 1].fen;
}

export function boardOrientation(
  color: Repertoire["color"]
): "white" | "black" {
  return color === "black" ? "black" : "white";
}

export function buildLineQueue(
  repertoires: Repertoire[],
  mode: PracticeMode,
  tournamentRepertoireId?: string,
  options?: { lineId?: string; requireLesson?: boolean }
): PracticeLine[] {
  let reps = repertoires;

  if (mode === "tournament" && tournamentRepertoireId) {
    reps = reps.filter((r) => r.id === tournamentRepertoireId);
  }

  const candidates: Array<{ line: PracticeLine; priority: number }> = [];

  for (const rep of reps) {
    for (const line of rep.lines) {
      if (line.moves.length === 0) continue;
      if (options?.lineId && line.id !== options.lineId) continue;
      if ((options?.requireLesson ?? true) && !line.memory.lessonCompleted) continue;

      let include = true;
      let priority = 1000 - line.memory.mastery;

      switch (mode) {
        case "learn_new":
          include = line.memory.correctAttempts === 0;
          priority = 900;
          break;
        case "weakest":
          priority = 1000 - line.memory.mastery;
          break;
        case "review_due":
          include =
            line.memory.mastery < 100 ||
            line.memory.incorrectAttempts > line.memory.correctAttempts;
          priority = 800 - line.memory.mastery;
          break;
        case "random":
          priority = Math.random() * 1000;
          break;
        case "mixed":
        case "tournament":
          priority = 1000 - line.memory.mastery;
          if (line.memory.incorrectAttempts > 0) priority += 200;
          break;
      }

      if (include) {
        candidates.push({
          line: {
            repertoireId: rep.id,
            repertoireName: rep.name,
            repertoireColor: rep.color,
            lineId: line.id,
            lineName: line.name,
            eco: line.eco,
            moves: line.moves,
          },
          priority,
        });
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, 20).map((c) => c.line);
}
