## 02_FEATURES.md 

## Opening Training System 

## Overview 

The Opening Training System is the core educational feature of ChessCoach. 

It combines the adaptive learning philosophy of Chessreps with engine-assisted explanations, real game statistics, and personalized repertoires to help users build longterm opening knowledge instead of memorizing moves temporarily. 

The system should feel like having a personal opening coach. 

## Feature 1 — Personal Repertoires 

## Purpose 

Allow every user to build multiple opening repertoires for different goals. 

Examples: 

- Main White Repertoire 

- Main Black Repertoire 

- Tournament Repertoire 

- Blitz Repertoire 

- Experimental Openings 

Each repertoire should be completely independent. 

## Requirements 

Users can: 

- Create unlimited repertoires 

- Rename repertoires 

- Delete repertoires 

- Duplicate repertoires 

- Export repertoires as PGN 

- Import repertoires from PGN 

- Share repertoires 

## Feature 2 — Opening Explorer 

## Purpose 

Allow users to browse openings in an interactive explorer. 

The explorer should be inspired by Chessreps while providing richer educational content. 

## Requirements 

Users can: 

- Search openings 

- Browse opening families 

- Browse variations 

- Explore move trees 

- Navigate forward and backward 

- Jump to any position 

- View alternative continuations 

## Position Information 

For every position display: 

- Opening name 

- ECO code 

- Current variation 

- Move number 

## Database Information 

Use the Lichess database to display: 

- Number of games 

- White win percentage 

- Black win percentage 

- Draw percentage 

- Most common moves 

- Move popularity 

- Average rating 

- Master games (future feature) 

## Engine Information 

Display: 

- Stockfish evaluation 

- Best move 

- Top engine continuations 

- Mate score (when applicable) 

## Feature 3 — Add To Repertoire 

Every explored line should have an “Add to Repertoire” button. 

Users may add: 

- Entire opening 

- Single variation 

- Specific branch 

- Individual position 

## Feature 4 — Interactive Learning 

Learning should always be active. 

Instead of showing moves, the trainer asks: 

“What is the correct move here?” 

The user must recall the move before continuing. 

## Training Flow 

1. Present position 

2. User plays move 

3. Compare with repertoire 

4. Immediate feedback 

5. Continue line 

6. Repeat until variation completed 

## Feature 5 — Adaptive Spaced Repetition 

This is the most important feature. 

Every variation should have its own learning history. 

The trainer should schedule reviews automatically. 

## Memory Score 

Every variation stores: 

- Correct attempts 

- Incorrect attempts 

- Confidence score 

- Last reviewed 

- Next review date 

- Review interval 

- Mastery percentage 

## Review Logic 

If remembered correctly: 

Increase review interval. 

Example: 

- Today 

- Tomorrow 

- 3 days 

- 1 week 

- 2 weeks 

- 1 month 

- 3 months 

If forgotten: 

Immediately reduce interval and schedule another review. 

## Session Priorities 

Training sessions should prioritize: 

1. Overdue reviews 

2. Weakest lines 

3. Forgotten lines 

4. New lines 

5. Random review 

## Feature 6 — Learning Multiple Openings 

Users should never be forced to finish one opening before starting another. 

Instead, the trainer intelligently mixes openings. 

Example session: 

Italian Game 

↓ 

Queen’s Gambit 

↓ 

Najdorf 

↓ 

London System 

↓ 

French Defence 

## ↓ 

Italian Game 

The order depends on each variation’s review schedule. 

## Feature 7 — Opening Explanations 

Every important move should include explanations. 

Explain: 

- Why the move is played 

- Strategic ideas 

- Tactical ideas 

- Typical plans 

- Common mistakes 

- Typical pawn structures 

- Piece placement 

- Transpositions 

The explanation should teach understanding rather than memorization. 

## Feature 8 — Practice Modes 

Support multiple practice modes. 

## Learn Mode 

Guided learning. 

Hints available. 

Move explanations. 

## Practice Mode 

No hints. 

Play from memory. 

## Review Due 

Only practice lines that are scheduled today. 

## Weak Lines 

Only train forgotten variations. 

## Mixed Repertoire 

Practice every repertoire together. 

## Tournament Mode 

Focus on one selected repertoire. 

## Feature 9 — Progress Tracking 

Each repertoire should display: 

Overall mastery 

Lines learned 

Lines remaining 

Lines due today 

Average confidence 

Current streak 

Longest streak 

Study time 

Practice sessions 

## Feature 10 — Notes 

Users should be able to attach notes to: 

Entire openings 

Variations 

Individual moves 

Specific positions 

Notes support: 

Markdown 

Diagrams 

Future images 

## Feature 11 — Bookmarks 

Users can bookmark: 

Critical positions Favourite lines 

Interesting novelties 

Tournament preparation positions 

Bookmarked positions appear in a dedicated study section. 

## Feature 12 — Search 

Search by: 

Opening Variation ECO code 

Move sequence 

Position (FEN) 

Tags 

## Acceptance Criteria 

The Opening Training System is complete when: 

- ✓ Users can create multiple repertoires. 

- ✓ Users can browse an interactive opening explorer. 

- ✓ Users can add variations directly into repertoires. 

- ✓ Every variation has independent spaced repetition. 

- ✓ Training sessions adapt automatically to user performance. 

- ✓ Multiple openings can be learned simultaneously. 

- ✓ Every important move includes educational explanations. 

- ✓ Progress persists across devices. 

- ✓ Opening mastery improves through adaptive review rather than repetition alone. 

## **Feature — Analysis-Based Spaced Repetition** 

## **Purpose** 

Transform every analyzed game into a personalized opening lesson. 

Instead of simply reviewing a finished game, ChessCoach should identify opening positions that the user struggled with and automatically schedule them for future practice using adaptive spaced repetition. 

This creates a continuous learning loop where playing, analyzing, and training all reinforce each other. 

## **Learning Workflow** 

1. User plays a game or imports a PGN. 

2. The Analysis Board reviews the opening phase. 

3. The system identifies: 

   - Incorrect opening moves 

   - Forgotten repertoire lines 

   - Missed theoretical continuations 

   - Inaccuracies during the opening 

4. Relevant positions are automatically added to the user's review queue. 

5. Future practice sessions prioritize these positions until they are mastered. 

## **Automatic Review Queue** 

The system should automatically schedule reviews for: 

- Forgotten repertoire moves 

- Incorrect opening choices 

- Frequently repeated mistakes 

- Positions where the user left known theory 

- Important transpositions 

- Critical decision points in the opening 

The user should not need to manually add these positions. 

## **Position-Based Learning** 

Instead of memorizing only move sequences, the trainer should teach positions. 

Each review presents a board position and asks: 

## **"What is the strongest continuation here?"** 

The user must play the move from memory. 

After the move, the trainer explains: 

- Why the move is correct 

- The strategic idea behind it 

- Typical plans 

- Common mistakes 

- Possible transpositions 

## **Memory Tracking** 

Every reviewed position maintains its own learning statistics: 

- Memory score 

- Correct attempts 

- Incorrect attempts 

- Review interval 

- Last reviewed 

- Next scheduled review 

- Confidence level 

- Mastery percentage 

Each position progresses independently. 

## **Adaptive Scheduling** 

Correct answers increase the review interval. 

Incorrect answers immediately shorten the interval and return the position to the review queue. 

The scheduling algorithm should continuously adapt to the user's performance. 

## **Learning Across Multiple Openings** 

Users may study multiple repertoires simultaneously. 

The review system should intelligently mix positions from: 

- White repertoire 

- Black repertoire 

- Tournament repertoire 

- Imported PGNs 

- Recently analyzed games 

Practice sessions should never become repetitive or focus exclusively on a single opening. 

## **Integration with Analysis Board** 

Whenever the Analysis Board detects an opening mistake, it should offer: 

## **Add to Review Queue** 

Selecting this option immediately schedules the position for spaced repetition. 

If the position already exists, its memory score should be updated instead of creating a duplicate. 

## **Progress Dashboard** 

Display: 

- Positions due today 

- New positions added from analysis 

- Most forgotten opening positions 

- Strongest openings 

- Weakest openings 

- Review streak 

- Overall opening retention 

## **Goal** 

The Analysis Board should not simply explain past mistakes. 

It should convert those mistakes into future learning opportunities by automatically building a personalized opening study plan. 

Every analyzed game should improve the user's opening knowledge through adaptive spaced repetition, making ChessCoach a continuously evolving training system rather than just an analysis tool. 

## **Feature — Chessreps-Style Opening Trainer & Spaced Repetition** 

## **Purpose** 

The Opening Trainer is designed to help users build long-term opening knowledge through active recall and adaptive spaced repetition. 

Instead of memorizing opening moves once, users continuously review variations at intelligently scheduled intervals until they become second nature. 

The system should function similarly to Chessreps while providing a modern, intuitive learning experience. 

## **Learning Philosophy** 

Users learn by recalling moves from memory rather than passively watching move sequences. 

For every training position, the user is asked: 

## **"What is the correct next move?"** 

The user must play the move on the board before continuing. 

Immediate feedback is provided after every move. 

## **Opening Repertoires** 

Users can create multiple repertoires, including: 

- White Repertoire 

- Black vs 1.e4 

- Black vs 1.d4 

- Tournament Repertoire 

- Blitz Repertoire 

- Experimental Repertoire 

Each repertoire contains opening trees made up of variations and sub-variations. 

Every variation is tracked independently. 

## **Spaced Repetition** 

Every opening variation has its own review schedule. 

Each variation stores: 

- Memory score 

- Mastery percentage 

- Review interval 

- Last review date 

- Next scheduled review 

- Correct attempts 

- Incorrect attempts 

- Confidence score 

Progress is automatically updated after every training session. 

## **Adaptive Review Scheduling** 

The review schedule adapts based on user performance. 

## **Correct Answer** 

When a variation is completed correctly: 

- Increase the review interval. 

- Reduce its review priority. 

- Mark it as progressing toward mastery. 

Example intervals: 

- Today 

- 1 day 

- 3 days 

- 7 days 

- 14 days 

- 30 days 

- 60 days 

- 90 days 

- 180 days 

- 365 days 

## **Incorrect Answer** 

When a mistake is made: 

- Reset or shorten the review interval. 

- Increase the review priority. 

- Schedule the variation for another review soon. 

- Continue teaching until the variation is remembered correctly. 

## **Learning Multiple Openings** 

Users should be able to study multiple openings simultaneously. 

The trainer should automatically mix variations from all selected repertoires into one training session. 

Example session: 

- Italian Game 

- Queen's Gambit 

- Sicilian Najdorf 

- Caro-Kann 

- Ruy Lopez 

- King's Indian Defence 

The order should be determined by each variation's review schedule rather than by opening. 

This ensures balanced learning across an entire repertoire. 

## **Training Modes** 

Support multiple study modes: 

## **Learn New Lines** 

Focus on variations that have never been studied. 

## **Review Due** 

Practice only variations scheduled for review today. 

## **Mixed Practice** 

Combine all selected repertoires into one adaptive session. 

## **Weakest Lines** 

Focus on variations with the lowest mastery scores. 

## **Tournament Preparation** 

Train only the openings selected for an upcoming event. 

## **Random Practice** 

Review random variations regardless of review schedule. 

## **Session Flow** 

1. Present a position from the user's repertoire. 

2. Ask the user to find the correct move. 

3. Compare the move with the stored repertoire. 

4. Give immediate feedback. 

5. Continue through the variation. 

6. Update the memory score. 

7. Schedule the next review automatically. 

## **Mastery Tracking** 

For every repertoire display: 

- Overall mastery percentage 

- Lines learned 

- Lines remaining 

- Lines due today 

- Weakest variations 

- Strongest variations 

- Current study streak 

- Total study time 

- Review history 

Users should always know what to study next. 

## **User Experience** 

The trainer should feel simple, fast, and distraction-free. 

Users should never need to decide what to review manually. 

The system should automatically choose the most valuable variations based on the user's learning history and spaced repetition schedule. 

## **Goal** 

Create an intelligent opening trainer that helps users build and retain complete opening repertoires over the long term through adaptive spaced repetition, active recall, and continuous practice. 

