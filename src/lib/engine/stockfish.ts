import type { EngineLine, PositionAnalysis } from "@/lib/types";

type AnalysisCallback = (analysis: PositionAnalysis) => void;

const INIT_TIMEOUT_MS = 30_000;

function parseInfoLine(line: string): Partial<EngineLine> & { depth?: number; nodes?: number } | null {
  if (!line.startsWith("info ")) return null;

  const depthMatch = line.match(/\bdepth (\d+)/);
  const nodesMatch = line.match(/\bnodes (\d+)/);
  const multipvMatch = line.match(/\bmultipv (\d+)/);
  const pvMatch = line.match(/\bpv (.+)$/);

  let scoreCp: number | null = null;
  let scoreMate: number | null = null;

  const cpMatch = line.match(/\bscore cp (-?\d+)/);
  const mateMatch = line.match(/\bscore mate (-?\d+)/);

  if (mateMatch) {
    scoreMate = parseInt(mateMatch[1], 10);
  } else if (cpMatch) {
    scoreCp = parseInt(cpMatch[1], 10);
  }

  if (!pvMatch) return null;

  return {
    multipv: multipvMatch ? parseInt(multipvMatch[1], 10) : 1,
    depth: depthMatch ? parseInt(depthMatch[1], 10) : 0,
    nodes: nodesMatch ? parseInt(nodesMatch[1], 10) : undefined,
    scoreCp,
    scoreMate,
    pv: pvMatch[1].split(" "),
  };
}

function snapshotAnalysis(
  fen: string,
  lineBuffer: Map<number, EngineLine>,
  latestDepth: number,
  latestNodes: number
): PositionAnalysis {
  const linesArr = Array.from(lineBuffer.values()).sort((a, b) => a.multipv - b.multipv);
  return {
    fen,
    depth: latestDepth,
    nodes: latestNodes,
    lines: linesArr,
    bestMove: linesArr[0]?.pv[0] ?? null,
  };
}

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private analysisId = 0;
  private currentCallback: AnalysisCallback | null = null;
  private lineBuffer = new Map<number, EngineLine>();
  private latestDepth = 0;
  private latestNodes = 0;
  private currentFen = "";
  private pendingFinish: ((analysis: PositionAnalysis) => void) | null = null;
  private pendingHandler: ((event: MessageEvent<string>) => void) | null = null;

  async init(): Promise<void> {
    if (this.worker && this.ready) return;
    if (this.worker && !this.ready) {
      await this.waitForReady();
      return;
    }

    return new Promise((resolve, reject) => {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const jsUrl = `${origin}/stockfish/stockfish.js`;

      const timeout = setTimeout(() => {
        reject(new Error("Stockfish took too long to start — check your connection and refresh"));
      }, INIT_TIMEOUT_MS);

      // Plain worker URL — stockfish.js auto-resolves stockfish.wasm from the same path.
      this.worker = new Worker(jsUrl);

      const onReady = (event: MessageEvent<string>) => {
        const text = typeof event.data === "string" ? event.data : "";
        if (text.includes("uciok")) {
          this.send("setoption name MultiPV value 3");
          this.send("isready");
        }
        if (text.includes("readyok")) {
          clearTimeout(timeout);
          this.ready = true;
          this.worker?.removeEventListener("message", onReady);
          resolve();
        }
      };

      this.worker.addEventListener("message", onReady);
      this.worker.addEventListener("message", (e) => this.handleMessage(e));

      this.worker.onerror = (err) => {
        clearTimeout(timeout);
        reject(err);
      };

      this.send("uci");
    });
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (this.ready) {
          resolve();
          return;
        }
        if (Date.now() - start > INIT_TIMEOUT_MS) {
          reject(new Error("Stockfish initialization timed out"));
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  private send(cmd: string): void {
    this.worker?.postMessage(cmd);
  }

  private finishPendingAnalysis(): void {
    if (!this.pendingFinish) return;

    const analysis = snapshotAnalysis(
      this.currentFen,
      this.lineBuffer,
      this.latestDepth,
      this.latestNodes
    );

    if (this.pendingHandler) {
      this.worker?.removeEventListener("message", this.pendingHandler);
      this.pendingHandler = null;
    }

    const finish = this.pendingFinish;
    this.pendingFinish = null;
    finish(analysis);
  }

  private handleMessage(event: MessageEvent<string>): void {
    const raw = typeof event.data === "string" ? event.data : "";
    const lines = raw.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("info ")) {
        const parsed = parseInfoLine(trimmed);
        if (!parsed || !parsed.pv) continue;

        const mpv = parsed.multipv ?? 1;
        this.latestDepth = parsed.depth ?? this.latestDepth;
        this.latestNodes = parsed.nodes ?? this.latestNodes;

        this.lineBuffer.set(mpv, {
          multipv: mpv,
          depth: parsed.depth ?? 0,
          scoreCp: parsed.scoreCp ?? null,
          scoreMate: parsed.scoreMate ?? null,
          pv: parsed.pv,
          nodes: parsed.nodes,
        });

        if (this.currentCallback) {
          this.currentCallback(
            snapshotAnalysis(
              this.currentFen,
              this.lineBuffer,
              this.latestDepth,
              this.latestNodes
            )
          );
        }
      }
    }
  }

  stop(): void {
    this.finishPendingAnalysis();
    this.send("stop");
    this.currentCallback = null;
    this.lineBuffer.clear();
  }

  analyzePosition(
    fen: string,
    options: { depth?: number; movetime?: number } = {},
    onUpdate?: AnalysisCallback
  ): Promise<PositionAnalysis> {
    this.finishPendingAnalysis();

    const id = ++this.analysisId;
    this.currentFen = fen;
    this.lineBuffer.clear();
    this.latestDepth = 0;
    this.latestNodes = 0;
    this.currentCallback = onUpdate ?? null;

    return new Promise((resolve) => {
      let resolved = false;

      const finish = (analysis: PositionAnalysis) => {
        if (resolved) return;
        resolved = true;
        if (this.pendingFinish === finish) {
          this.pendingFinish = null;
        }
        if (this.pendingHandler) {
          this.worker?.removeEventListener("message", this.pendingHandler);
          this.pendingHandler = null;
        }
        this.currentCallback = null;
        resolve(analysis);
      };

      const handler = (event: MessageEvent<string>) => {
        if (id !== this.analysisId) {
          finish(
            snapshotAnalysis(
              this.currentFen,
              this.lineBuffer,
              this.latestDepth,
              this.latestNodes
            )
          );
          return;
        }

        const raw = typeof event.data === "string" ? event.data : "";
        if (raw.includes("bestmove")) {
          finish(
            snapshotAnalysis(
              fen,
              this.lineBuffer,
              this.latestDepth,
              this.latestNodes
            )
          );
        }
      };

      this.pendingFinish = finish;
      this.pendingHandler = handler;
      this.worker?.addEventListener("message", handler);
      this.send("stop");
      this.send(`position fen ${fen}`);
      if (options.movetime) {
        this.send(`go movetime ${options.movetime}`);
      } else {
        this.send(`go depth ${options.depth ?? 18}`);
      }
    });
  }

  async getEval(
    fen: string,
    depth = 16
  ): Promise<{ cp: number; mate: number | null }> {
    const analysis = await this.analyzePosition(fen, { depth });
    const top = analysis.lines[0];
    if (!top) return { cp: 0, mate: null };
    return { cp: top.scoreCp ?? 0, mate: top.scoreMate };
  }

  destroy(): void {
    this.finishPendingAnalysis();
    this.send("quit");
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }
}

let sharedEngine: StockfishEngine | null = null;
let sharedInit: Promise<StockfishEngine> | null = null;

export async function getStockfishEngine(): Promise<StockfishEngine> {
  if (sharedEngine?.isReady()) return sharedEngine;

  if (!sharedInit) {
    sharedInit = (async () => {
      const engine = sharedEngine ?? new StockfishEngine();
      sharedEngine = engine;
      await engine.init();
      return engine;
    })().finally(() => {
      sharedInit = null;
    });
  }

  return sharedInit;
}
