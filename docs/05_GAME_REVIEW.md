## 05_GAME_REVIEW.md 

## Game Review 

## Purpose 

Game Review helps users understand their games by combining Stockfish analysis with educational explanations from the coach. 

The goal is to explain mistakes, highlight strengths, and teach better decisions. 

## Features 

Users should be able to: 

- Import PGN files 

- Review imported games 

- Review games imported from Lichess 

- Navigate to any move 

- Replay games move by move 

## Analysis 

Every move should be analyzed using Stockfish. 

Display: 

- Evaluation 

- Best move 

- Move classification 

- Coach explanation 

Analysis should cover the entire game, not only the opening. 

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

These classifications must be determined directly from Stockfish evaluations. 

## Evaluation Bar 

Display a vertical evaluation bar beside the chessboard similar to Chess.com. Requirements: 

- Live updates after every move 

- Smooth transitions 

- Mate scores (e.g. M1, M3) 

- Positive values for White 

- Negative values for Black 

The evaluation bar must always match the coach’s explanations. 

## Coach 

The coach (Shreya) should explain: 

- Why a move was good or bad 

- Better alternatives 

- Tactical ideas 

- Strategic plans 

- Missed opportunities 

The coach should never contradict the engine. 

## Accuracy 

Display: 

- White accuracy 

- Black accuracy 

Accuracy should be calculated after the complete analysis. 

## Summary 

After the review, provide: 

- Accuracy scores 

- Number of mistakes 

- Number of blunders 

- Number of brilliant moves 

- Opening played 

- Key turning points 

- Biggest missed opportunity 

## User Experience 

Game Review should feel educational rather than critical. 

The objective is to help users understand how they can improve and encourage them to continue learning. 

