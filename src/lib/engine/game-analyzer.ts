import { Chess } from "chess.js";
import { classifyMove } from "@/lib/engine/move-classification";
import { toWhitePerspective } from "@/lib/engine/evaluation";
import { getStockfishEngine } from "@/lib/engine/stockfish";
import type { MoveAnalysis, PositionAnalysis } from "@/lib/types";

const analysisCache = new Map<string, PositionAnalysis>();

function cacheKey(fen: string, mode: string): string {
  return `${fen}|${mode}`;
}

export async function analyzePositionCached(
  fen: string,
  depth = 16,
  onUpdate?: (analysis: PositionAnalysis) => void
): Promise<PositionAnalysis> {
  const key = cacheKey(fen, `depth:${depth}`);
  const cached = analysisCache.get(key);
  if (cached) {
    onUpdate?.(cached);
    return cached;
  }

  const engine = await getStockfishEngine();
  const result = await engine.analyzePosition(fen, { depth }, onUpdate);
  analysisCache.set(key, result);
  return result;
}

/** Fast live eval for the analysis board — streams partial results within movetime. */
export async function analyzePositionLive(
  fen: string,
  movetime = 400,
  onUpdate?: (analysis: PositionAnalysis) => void
): Promise<PositionAnalysis> {
  const engine = await getStockfishEngine();
  const result = await engine.analyzePosition(fen, { movetime }, onUpdate);

  const deepKey = cacheKey(fen, "depth:18");
  if (!analysisCache.has(deepKey) && result.lines.length > 0) {
    analysisCache.set(deepKey, result);
  }

  return result;
}

export async function analyzeFullGame(
  moves: string[],
  options: {
    depth?: number;
    onProgress?: (completed: number, total: number) => void;
    onMoveAnalyzed?: (analysis: MoveAnalysis) => void;
  } = {}
): Promise<MoveAnalysis[]> {
  const depth = options.depth ?? 14;
  const chess = new Chess();
  const results: MoveAnalysis[] = [];

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const fenBefore = chess.fen();
    const sideToMove = chess.turn();

    const beforeAnalysis = await analyzePositionCached(fenBefore, depth);
    const topLine = beforeAnalysis.lines[0];
    const bestUci = beforeAnalysis.bestMove;

    const move = chess.move(san);
    if (!move) continue;

    const fenAfter = chess.fen();
    const afterEval = await analyzePositionCached(fenAfter, depth);
    const afterTop = afterEval.lines[0];

    const beforeWhite = toWhitePerspective(
      topLine?.scoreCp ?? 0,
      topLine?.scoreMate ?? null,
      sideToMove
    );
    const afterWhite = toWhitePerspective(
      afterTop?.scoreCp ?? 0,
      afterTop?.scoreMate ?? null,
      chess.turn()
    );

    const playedUci = move.from + move.to + (move.promotion ?? "");

    let bestAfterWhite = afterWhite;
    if (bestUci && bestUci !== playedUci) {
      const bestChess = new Chess(fenBefore);
      const from = bestUci.slice(0, 2);
      const to = bestUci.slice(2, 4);
      const promotion = bestUci.length > 4 ? bestUci[4] : undefined;
      try {
        bestChess.move({ from, to, promotion });
        const bestAfterAnalysis = await analyzePositionCached(bestChess.fen(), depth);
        const bestAfterTop = bestAfterAnalysis.lines[0];
        bestAfterWhite = toWhitePerspective(
          bestAfterTop?.scoreCp ?? 0,
          bestAfterTop?.scoreMate ?? null,
          bestChess.turn()
        );
      } catch {
        // best move parse failed — use played eval
      }
    }

    const moverSign = sideToMove === "w" ? 1 : -1;
    const evalBeforeMover = beforeWhite.cp * moverSign;
    const evalAfterPlayedMover = -afterWhite.cp * moverSign;
    const evalAfterBestMover = -bestAfterWhite.cp * moverSign;

    const cpLoss = Math.max(0, Math.round(evalAfterBestMover - evalAfterPlayedMover));
    const bestCpSwing = Math.round(evalAfterBestMover - evalBeforeMover);

    const isBestMove = bestUci === playedUci;
    const playedMissedMate =
      beforeWhite.mate !== null &&
      beforeWhite.mate > 0 &&
      !(afterWhite.mate !== null && afterWhite.mate > 0);
    const bestWasMate = beforeWhite.mate !== null && beforeWhite.mate > 0;
    const playedAllowsMate =
      afterWhite.mate !== null && afterWhite.mate < 0;

    const classification = classifyMove({
      isBestMove,
      cpLoss,
      bestCpSwing,
      playedAllowsMate,
      bestWasMate,
      playedMissedMate,
    });

    const moveAnalysis: MoveAnalysis = {
      moveIndex: i,
      san: move.san,
      uci: playedUci,
      classification,
      evalBefore: beforeWhite.cp,
      evalAfter: afterWhite.cp,
      bestMove: bestUci,
      cpLoss,
    };

    results.push(moveAnalysis);
    options.onMoveAnalyzed?.(moveAnalysis);
    options.onProgress?.(i + 1, moves.length);
  }

  return results;
}

export function clearAnalysisCache(): void {
  analysisCache.clear();
}
