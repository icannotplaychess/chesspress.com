## 06_ANALYSIS_BOARD.md 

## Analysis Board 

## Purpose 

The Analysis Board is the central workspace of ChessCoach. 

It combines engine analysis, opening recognition, database exploration, and educational coaching into a single interface. The board should allow users to freely analyze any position while receiving accurate and synchronized feedback. 

## Features 

Users should be able to: 

- Play moves freely. 

- Import PGN files. 

- Import games from Lichess. 

- Paste PGN text. 

- Load positions using FEN. 

- Copy PGN and FEN. 

- Reset the board. 

- Flip the board. 

- Undo and redo moves. 

## Opening Recognition 

The board should automatically recognize openings using the Lichess Opening Database. 

Display: 

- Opening name 

- Variation 

- ECO Code 

Opening recognition should remain active only while the game is still in theoretical opening territory. 

The coach should never incorrectly identify an opening after theory has ended. 

## Stockfish Analysis 

Stockfish is responsible for: 

- Position evaluation 

- Best move 

- Top engine lines 

- Mate detection 

- Move quality 

- Tactical analysis 

The engine should analyze the entire game, not only the first few moves. 

## Evaluation Bar 

A vertical evaluation bar should remain fixed beside the board. 

Requirements: 

- Live evaluation updates 

- Smooth animation 

- Mate scores (M1, M2, etc.) 

- Positive values for White 

- Negative values for Black 

The evaluation bar must always remain synchronized with the engine. 

## Move Classifications 

Every move should receive one of the following classifications: 

- Brilliant (!!) 

- Best 

- Great 

- Good 

- Inaccuracy 

- Mistake 

- Miss 

- Blunder 

Classifications must be calculated from Stockfish evaluations rather than arbitrary rules. 

## Engine Panel 

Display: 

- Current evaluation 

- Best move 

- Top three engine continuations 

- Search depth 

- Nodes searched 

- Mate information (when available) 

## Opening Database 

Using the Lichess database, display: 

- Most common moves 

- Number of games 

- White win rate 

- Draw rate 

- Black win rate 

- Move popularity 

This information should update as the position changes. 

## Move List 

The move list should support: 

- Click any move to jump to it. 

- Navigate using arrow keys. 

- Scroll automatically during play. 

- Highlight the current move. 

## Analysis Tools 

Support: 

- Engine arrows 

- Suggested moves 

- Position evaluation 

- Copy PGN 

- Copy FEN 

- Save position 

- Bookmark position 

## Synchronization 

Every component should always stay synchronized. 

When the user changes the position: 

- The board updates. 

- The move list updates. 

- The evaluation bar updates. 

- The engine updates. 

- The opening information updates. 

- The database updates. 

- The coach updates. 

No component should display outdated information. 

## Performance 

The Analysis Board should feel responsive. 

Engine analysis should continue in the background while maintaining a smooth user experience. 

## Goal 

The Analysis Board should become the central chess workspace where users can analyze, study, explore, and understand any position with confidence. 

