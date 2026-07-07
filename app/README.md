# ChessPress

A modern chess improvement platform with Stockfish analysis, Lichess opening data, adaptive training, and Shreya — your AI coach.

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to **Analysis Board**.

## Analysis Board

The Analysis Board (`/analysis`) includes:

- **Stockfish 18** — live position evaluation, best move, top-3 engine lines, mate detection
- **Evaluation bar** — vertical bar beside the board (Chess.com style)
- **Lichess database** — move popularity and win rates via the Opening Explorer API
- **Opening recognition** — ECO codes and names from the Lichess opening book (3,700+ lines)
- **Move classifications** — Best, Great, Good, Inaccuracy, Mistake, Miss, Blunder from Stockfish evals
- **Full-game analysis** — analyzes every move from first to last
- **Shreya** — coach explanations grounded in engine and database data
- **PGN/FEN import** — load games and positions for analysis

## Tech Stack

- Next.js 16, React 19, TypeScript
- chess.js, react-chessboard
- Stockfish WASM (lite single-threaded)
- Lichess Opening Explorer API + local ECO opening book

## Documentation

Project specifications are in the repository root (`01_PRODUCT_VISION.md` through `11_USER_SYSTEM.md`).
