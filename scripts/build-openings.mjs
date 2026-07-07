import fs from "fs";
import path from "path";
import { Chess } from "chess.js";

const dir = path.join(process.cwd(), "src/data/openings");
const files = ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"];
const entries = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), "utf-8");
  for (const line of content.split("\n").slice(1)) {
    if (!line.trim()) continue;
    const [eco, name, pgn] = line.split("\t");
    if (!eco || !name || !pgn) continue;
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
    } catch {
      continue;
    }
    entries.push({
      eco,
      name,
      uciMoves: chess
        .history({ verbose: true })
        .map((m) => m.from + m.to + (m.promotion ?? "")),
    });
  }
}

const out = path.join(process.cwd(), "src/data/openings.json");
fs.writeFileSync(out, JSON.stringify(entries));
console.log(`Wrote ${entries.length} openings to ${out}`);
