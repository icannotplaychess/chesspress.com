## 08_ENGINE.md 

## Chess Engine Specification 

## Purpose 

The Chess Engine is responsible for all chess analysis within ChessCoach. 

Stockfish is the single source of truth for every evaluation, move classification, engine line, and tactical assessment. 

No other component may invent or estimate engine evaluations. 

## Engine 

ChessCoach uses Stockfish as its primary chess engine. 

Stockfish should power: 

- Position evaluation 

- Best move calculation 

- Top engine lines 

- Tactical analysis 

- Mate detection 

- Move classification 

- Accuracy calculation 

- Game Review 

## Analysis Scope 

The engine must analyze the **entire game** , not only the opening. 

Analysis should continue until: 

- Checkmate 

- Draw 

- Resignation 

- End of PGN 

Engine analysis must never stop after a fixed number of moves. 

## Engine Output 

For every analyzed position provide: 

- Evaluation 

- Best move 

- Top three candidate moves 

- Mate score (if applicable) 

- Search depth 

- Principal variation (PV) 

## Evaluation Bar 

The evaluation bar should always use the latest Stockfish evaluation. 

Requirements: 

- Live updates 

- Smooth transitions 

- White advantage above zero 

- Black advantage below zero 

- Mate scores displayed as M1, M2, M3, etc. 

## Move Classification 

Every move should receive one classification. 

Available classifications: 

- Brilliant (!!) 

- Best 

- Great 

- Good 

- Inaccuracy 

- Mistake 

- Miss 

- Blunder 

These classifications must be calculated from Stockfish evaluations and never assigned randomly. 

## Coach Synchronization 

Shreya must always use the engine’s evaluation. 

If the engine says a move is a blunder, Shreya explains the blunder. 

If the engine says a move is best, Shreya explains why it is best. 

The coach and engine must never contradict each other. 

## Performance 

Engine analysis should: 

- Run in the background 

- Continue while users browse moves 

- Cache completed analysis 

- Avoid repeating identical calculations 

Previously analyzed positions should load instantly whenever possible. 

## Future Improvements 

Future versions may support: 

- Multiple engine depths 

- User-selectable analysis strength 

- Cloud analysis 

- MultiPV customization 

- Engine tournaments 

## Goal 

The engine should provide fast, accurate, and complete analysis for every position while serving as the authoritative source for all chess evaluations across the application. 

