import type { EngineLine, PositionAnalysis } from "@/lib/types";

type AnalysisCallback = (analysis: PositionAnalysis) => void;

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

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready = false;
  private analysisId = 0;
  private currentCallback: AnalysisCallback | null = null;
  private lineBuffer = new Map<number, EngineLine>();
  private latestDepth = 0;
  private latestNodes = 0;
  private currentFen = "";

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const jsUrl = `${origin}/stockfish/stockfish.js`;
      // stockfish.js 18 loads stockfish.wasm from the same directory — do NOT append ",worker"
      this.worker = new Worker(jsUrl);

      const onReady = (event: MessageEvent<string>) => {
        const text = typeof event.data === "string" ? event.data : "";
        if (text.includes("uciok")) {
          this.send("setoption name MultiPV value 3");
          this.send("isready");
        }
        if (text.includes("readyok")) {
          this.ready = true;
          this.worker?.removeEventListener("message", onReady);
          resolve();
        }
      };

      this.worker.addEventListener("message", onReady);
      this.worker.addEventListener("message", (e) => this.handleMessage(e));

      this.worker.onerror = (err) => reject(err);
      this.send("uci");
    });
  }

  private send(cmd: string): void {
    this.worker?.postMessage(cmd);
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
          const linesArr = Array.from(this.lineBuffer.values()).sort(
            (a, b) => a.multipv - b.multipv
          );
          this.currentCallback({
            fen: this.currentFen,
            depth: this.latestDepth,
            nodes: this.latestNodes,
            lines: linesArr,
            bestMove: linesArr[0]?.pv[0] ?? null,
          });
        }
      }
    }
  }

  stop(): void {
    this.send("stop");
    this.currentCallback = null;
    this.lineBuffer.clear();
  }

  analyzePosition(
    fen: string,
    options: { depth?: number; movetime?: number } = {},
    onUpdate?: AnalysisCallback
  ): Promise<PositionAnalysis> {
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
        this.currentCallback = null;
        resolve(analysis);
      };

      const handler = (event: MessageEvent<string>) => {
        if (id !== this.analysisId) return;

        const raw = typeof event.data === "string" ? event.data : "";
        if (raw.includes("bestmove")) {
          const linesArr = Array.from(this.lineBuffer.values()).sort(
            (a, b) => a.multipv - b.multipv
          );
          finish({
            fen,
            depth: this.latestDepth,
            nodes: this.latestNodes,
            lines: linesArr,
            bestMove: linesArr[0]?.pv[0] ?? null,
          });
          this.worker?.removeEventListener("message", handler);
        }
      };

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

export async function getStockfishEngine(): Promise<StockfishEngine> {
  if (!sharedEngine) {
    sharedEngine = new StockfishEngine();
    await sharedEngine.init();
  }
  return sharedEngine;
}
