# 12_PLAYER_ANALYSIS.md

# Player Analysis & Opponent Scout

## Purpose

ChessPress should allow users to analyze their own chess profile or scout another player's public chess games.

The system should examine a player's game history and identify recurring patterns in their openings, middlegames, endgames, results, and playing habits.

The goal is to answer:

**"What is this player's chess style, strengths, weaknesses, and tendencies?"**

---

# Player Search

Users can enter:

- Chess.com username
- Lichess username

The system retrieves publicly available player information and games.

Users should also be able to analyze themselves by connecting their Chess.com or Lichess account.

---

# Player Overview

Display:

- Username
- Platform
- Current ratings
- Games analyzed
- Win rate
- Draw rate
- Loss rate
- White/Black performance
- Time-control breakdown

---

# Opening Profile

Analyze the player's opening repertoire.

Show:

- Most-played openings
- Most-played variations
- White repertoire
- Black repertoire
- Win rate by opening
- Loss rate by opening
- Most successful openings
- Least successful openings
- Frequently repeated lines

Allow users to click an opening and explore the relevant games.

---

# Strengths

Identify statistically meaningful strengths.

Possible examples:

- Strong opening performance
- Strong tactical play
- Strong endgame results
- Good performance with a particular color
- Strong performance in certain time controls
- Good results in specific opening families
- Ability to convert advantageous positions

Each strength should include supporting statistics.

Example:

**Strong in Queen's Gambit positions**

"You score 68% in the games where you reach this opening family across 42 games."

---

# Weaknesses

Identify recurring weaknesses using actual game data.

Possible categories:

- Opening performance
- Tactical mistakes
- Strategic mistakes
- Endgame performance
- King safety
- Time management
- Converting winning positions
- Defending worse positions
- Performance after losing a game

Weaknesses should only be reported when there is enough data to support the conclusion.

Never make strong claims from a tiny sample.

---

# Game-Phase Analysis

Analyze performance separately in:

### Opening

Identify:

- Poor opening results
- Frequently repeated inaccuracies
- Lines where the player consistently struggles

### Middlegame

Identify:

- Tactical errors
- Strategic mistakes
- Recurring positional problems
- Missed opportunities

### Endgame

Identify:

- Endgame win rate
- Conversion problems
- Common endgame mistakes
- Strongest and weakest endgame types

---

# Time-Control Analysis

Compare performance across:

- Bullet
- Blitz
- Rapid
- Classical

Show:

- Rating
- Win rate
- Average game length
- Accuracy where available

---

# Color Analysis

Compare White and Black performance.

Display:

- White win rate
- Black win rate
- Draw rate
- Average rating
- Most successful openings as White
- Most successful defenses as Black

---

# Pattern Detection

Look for recurring patterns across games.

Examples:

- Repeatedly losing material in similar positions
- Frequently missing tactical opportunities
- Repeated opening mistakes
- Struggling in specific endgames
- Frequently entering time trouble
- Strong performance after gaining an advantage
- Difficulty converting winning positions

Patterns must be based on multiple games rather than isolated incidents.

---

# Opponent Preparation

When analyzing another player, provide a preparation section.

Example:

**Opponent Tendencies**

- Most common White opening
- Most common Black defense
- Favourite variations
- Least successful openings
- Frequently repeated lines
- Positions where their results deteriorate

The system may suggest areas worth preparing against, but should not claim that a particular line is guaranteed to beat the player.

---

# Game Explorer

Allow users to browse the games used for the analysis.

Filters:

- Opening
- Result
- Color
- Time control
- Date
- Rating range

Clicking a game opens it in the ChessPress Analysis Board.

---

# Data Requirements

The system should use public game data from supported platforms.

For Lichess, use the official API and game endpoints rather than scraping pages. Lichess explicitly provides APIs for user data and games.

For Chess.com, use available public player/game data and follow the platform's API requirements.

---

# Statistical Reliability

Do not generate conclusions from insufficient data.

For example:

10 games:

"Limited data — this may be a trend."

100 games:

"Moderate evidence of a recurring pattern."

500+ games:

"Strong statistical evidence of this tendency."

The exact thresholds may be adjusted during development.

---

# Privacy

Only use publicly available player information and games, or data that the user explicitly authorizes ChessPress to access.

Never expose private account information.

Connected-account credentials and tokens must never be displayed to users or stored insecurely.

---

# Shreya Integration

Shreya can explain the analysis in natural language.

Example:

"You're clearly comfortable in open positions, but your results drop when the center stays closed. You also tend to spend a lot of time solving tactical problems in those positions."

The underlying statistics must support every claim.

Shreya must distinguish between:

- Observed fact
- Statistical tendency
- Possible explanation
- Speculation

She should never present speculation as fact.

---

# Goal

Player Analysis should turn a large collection of chess games into a concise and useful chess profile.

For the user's own account:

**"What am I good at, and what should I work on?"**

For another player:

**"What does this player usually play, where are they strongest, and what patterns should I prepare for?"**