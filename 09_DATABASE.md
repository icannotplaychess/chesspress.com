## 09_DATABASE.md 

## Chess Database Specification 

## Purpose 

The Chess Database stores and provides all non-engine chess information. 

While Stockfish evaluates positions, the database provides opening knowledge, game statistics, and historical information. 

## Primary Database 

The primary database should use the Lichess database and Opening Explorer. 

This database is responsible for: 

- Opening recognition 

- Opening variations 

- ECO codes 

- Move popularity 

- Win percentages 

- Game statistics 

## Opening Recognition 

The database should automatically recognize openings during the opening phase. 

Display: 

- Opening name 

- Variation name 

- ECO Code 

Recognition should stop once the game has left established opening theory. 

The application should never continue displaying an incorrect opening deep into the middlegame. 

## Opening Explorer 

For every position, display: 

- Most common moves 

- Number of games 

- White win percentage 

- Draw percentage 

- Black win percentage 

- Move popularity 

Data should update automatically as the user explores new positions. 

## Game Database 

Store: 

- Imported PGNs 

- Lichess games 

- Saved games 

- Bookmarked games 

- Study games 

Users should be able to: 

- Search games 

- Filter games 

- Replay games 

- Export games 

## Repertoire Database 

Each repertoire stores: 

- Opening tree 

- Variations 

- Sub-variations 

- Notes 

- Mastery progress 

- Spaced repetition data 

## Users can: 

- Create 

- Rename 

- Delete 

- Duplicate 

- Import 

- Export 

## multiple repertoires. 

## User Data 

## Store: 

- Practice history 

- Games analyzed 

- Study statistics 

- Review schedules 

- Progress 

- Bookmarks 

- Saved positions 

- Preferences 

All user progress should persist across sessions. 

## PGN Support 

## Support: 

- Import PGN 

- Export PGN 

- Paste PGN 

- Download PGN 

- Automatic PGN generation 

Every analyzed game should have an associated PGN. 

## FEN Support 

Support: 

- Import FEN 

- Export FEN 

- Copy FEN 

- Load custom positions 

## Search 

Users should be able to search by: 

- Opening name 

- Variation 

- ECO code 

- Player 

- PGN 

- FEN 

- Tags 

## Synchronization 

Whenever the board position changes: 

- Opening recognition updates. 

- Database statistics update. 

- Opening Explorer updates. 

- Coach context updates. 

All information should remain synchronized with the current board position. 

## Future Improvements 

Future versions may include: 

- Master games 

- World Championship games 

- User-created studies 

- Community repertoires 

- Shared opening trees 

- Cloud synchronization 

## Goal 

The database should serve as the complete source of opening knowledge, repertoire data, user progress, and game storage, allowing ChessCoach to provide a seamless and educational chess learning experience. 

