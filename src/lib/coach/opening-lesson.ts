import { Chess } from "chess.js";
import type { PracticeLine } from "@/lib/repertoire/types";
import { fenBeforeMove, isUserMove } from "@/lib/repertoire/practice-session";

export interface MoveLesson {
  moveIndex: number;
  san: string;
  isUserMove: boolean;
  title: string;
  explanation: string;
  ideas: string[];
  fenBefore: string;
  fenAfter: string;
}

export interface LineLesson {
  intro: string;
  openingSummary: string;
  moves: MoveLesson[];
  practicePrompt: string;
}

function moveColor(moveIndex: number): "white" | "black" {
  return moveIndex % 2 === 0 ? "white" : "black";
}

function openingThemes(name: string, eco?: string): string {
  const lower = name.toLowerCase();
  const ecoPrefix = eco?.slice(0, 1) ?? "";

  if (lower.includes("italian")) {
    return "Classical development, quick piece activity, and pressure on the f7 square are the main ideas.";
  }
  if (lower.includes("sicilian")) {
    return "Black fights for the center from the flank — dynamic piece play and counterattack are key.";
  }
  if (lower.includes("french")) {
    return "A solid pawn chain in the center — Black accepts a cramped position for a resilient structure.";
  }
  if (lower.includes("caro-kann") || lower.includes("caro kann")) {
    return "A sturdy setup that avoids early weaknesses while challenging White's center.";
  }
  if (lower.includes("london")) {
    return "A flexible system with a quick Bf4 and solid pawn structure — easy to learn and hard to crack.";
  }
  if (lower.includes("queen") && lower.includes("gambit")) {
    return "White fights for central dominance and open lines — Black must defend accurately.";
  }
  if (lower.includes("king") && lower.includes("indian")) {
    return "Hypermodern play — control the center with pieces and pawns from a distance.";
  }
  if (lower.includes("english")) {
    return "Flexible flank play — control the center without committing your central pawns early.";
  }
  if (ecoPrefix === "B") {
    return "A semi-open defense — Black creates an unbalanced fight with good winning chances.";
  }
  if (ecoPrefix === "C") {
    return "Open-game tactics and rapid development — both sides fight for the center.";
  }
  if (ecoPrefix === "D") {
    return "Closed or semi-closed structures — strategic planning matters more than quick tactics.";
  }
  if (ecoPrefix === "E") {
    return "Indian-style setups — flexible development and long-term positional pressure.";
  }
  return "Focus on development, king safety, and fighting for central squares.";
}

function analyzeMove(
  san: string,
  fenBefore: string,
  moveIndex: number,
  openingName: string,
  isUser: boolean
): { title: string; explanation: string; ideas: string[] } {
  const chess = new Chess(fenBefore);
  const result = chess.move(san);
  const ideas: string[] = [];
  const color = moveColor(moveIndex);
  const side = color === "white" ? "White" : "Black";
  const pronoun = isUser ? "You" : "Your opponent";

  if (!result) {
    return {
      title: `${side} plays ${san}`,
      explanation: `${pronoun} continue with ${san}, staying within the ideas of the ${openingName}.`,
      ideas: ["Stick to the main plans of this opening."],
    };
  }

  if (result.flags.includes("k")) {
    ideas.push("King safety first — never delay castling in sharp openings.");
    return {
      title: `${side} castles (${san})`,
      explanation: `${pronoun} castle with ${san}. Getting the king to safety is essential before opening the position.`,
      ideas,
    };
  }

  if (result.piece === "p") {
    const file = result.to[0];
    if (["d", "e"].includes(file)) {
      ideas.push("Central pawns control key squares and open lines for pieces.");
      return {
        title: `${side} claims the center (${san})`,
        explanation: `${pronoun} play ${san} to stake a claim in the center. Controlling d4/e4/d5/e5 gives your pieces more freedom.`,
        ideas,
      };
    }
    if (["c", "f"].includes(file)) {
      ideas.push("Flank pawn moves can support the center or prepare piece development.");
      return {
        title: `${side} advances on the flank (${san})`,
        explanation: `${pronoun} push ${san}, gaining space and preparing to develop pieces behind the pawn chain.`,
        ideas,
      };
    }
  }

  if (result.piece === "n") {
    ideas.push("Knights belong toward the center — 'knights on the rim are grim.'");
    return {
      title: `${side} develops a knight (${san})`,
      explanation: `${pronoun} develop with ${san}, bringing a piece into the game and attacking central squares.`,
      ideas,
    };
  }

  if (result.piece === "b") {
    ideas.push("Active bishops eye key diagonals and support your pawn structure.");
    return {
      title: `${side} develops the bishop (${san})`,
      explanation: `${pronoun} place the bishop on ${san}, aiming at important squares and completing development.`,
      ideas,
    };
  }

  if (result.piece === "q") {
    ideas.push("The queen is powerful but should not be overexposed early.");
    return {
      title: `${side} moves the queen (${san})`,
      explanation: `${pronoun} play ${san}. Make sure the queen stays safe while supporting your opening plans.`,
      ideas,
    };
  }

  if (result.captured) {
    ideas.push("Recaptures should improve your position — consider piece activity and pawn structure.");
    return {
      title: `${side} captures (${san})`,
      explanation: `${pronoun} capture with ${san}. Exchanges should serve your opening strategy, not just win material.`,
      ideas,
    };
  }

  if (chess.inCheck()) {
    ideas.push("Checks force the opponent to respond — use them to gain time for development.");
    return {
      title: `${side} gives check (${san})`,
      explanation: `${pronoun} play ${san} with check, forcing a response while advancing your opening plan.`,
      ideas,
    };
  }

  ideas.push("Every move should improve piece activity or support your central control.");
  return {
    title: `${side} plays ${san}`,
    explanation: `${pronoun} continue with ${san}, following the typical plans of the ${openingName}.`,
    ideas,
  };
}

export function buildLineLesson(line: PracticeLine): LineLesson {
  const openingName = line.lineName;
  const eco = line.eco;
  const userColor =
    line.repertoireColor === "black"
      ? "black"
      : line.repertoireColor === "white"
        ? "white"
        : "both";

  const moves: MoveLesson[] = line.moves.map((move, index) => {
    const fenBefore = fenBeforeMove(line.moves, index);
    const isUser = isUserMove(line.repertoireColor, index);
    const customNote = move.note?.trim();
    const analyzed = analyzeMove(move.san, fenBefore, index, openingName, isUser);

    return {
      moveIndex: index,
      san: move.san,
      isUserMove: isUser,
      title: analyzed.title,
      explanation: customNote ?? analyzed.explanation,
      ideas: analyzed.ideas,
      fenBefore,
      fenAfter: move.fen,
    };
  });

  const userSide =
    userColor === "black"
      ? "Black"
      : userColor === "white"
        ? "White"
        : "both sides";

  const intro =
    userColor === "both"
      ? `Let's walk through "${openingName}" move by move. I'll explain what each side is doing and why, so you understand the ideas before memorizing.`
      : `Let's learn "${openingName}" — you're playing as ${userSide}. I'll explain every move in this line so you understand the ideas before you practice from memory.`;

  return {
    intro,
    openingSummary: openingThemes(openingName, eco),
    moves,
    practicePrompt:
      "You now know the ideas behind each move. Practice the line from memory — if you slip up, you'll repeat it until it sticks.",
  };
}

export function buildLinesNeedingLesson(
  repertoires: import("@/lib/repertoire/types").Repertoire[]
): PracticeLine[] {
  const lines: PracticeLine[] = [];
  for (const rep of repertoires) {
    for (const line of rep.lines) {
      if (!line.memory.lessonCompleted && line.moves.length > 0) {
        lines.push({
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
  }
  return lines;
}
