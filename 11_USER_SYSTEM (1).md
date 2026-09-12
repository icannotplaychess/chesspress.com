# ChessPress — User System & Authentication

## 1. Purpose

ChessPress needs a secure user account system so users can create an account, sign in, and have their chess data saved across devices.

Users should be able to:

- Create a ChessPress account
- Sign in with email and password
- Sign in with Google
- Sign out
- Reset a forgotten password
- Maintain a personal profile
- Save repertoires
- Save games and analyses
- Track opening mastery and spaced-repetition progress
- Save bookmarks and study material
- Connect Chess.com and Lichess accounts
- Access their data from different devices

---

# 2. Authentication

ChessPress should support two primary authentication methods.

### Email & Password

Users can:

- Create an account using email and password
- Sign in using email and password
- Sign out
- Reset their password if forgotten
- Change their password from Settings

### Google Sign-In

Users should have a:

**Continue with Google**

button on the authentication screen.

Google authentication should use a standard secure OAuth flow.

After successful Google authentication:

1. Check whether the Google account already has a ChessPress account.
2. If it exists, sign the user in.
3. If it does not exist, create a new ChessPress account.
4. Create the user's profile and default settings.
5. Redirect the user to the ChessPress dashboard.

Google should never expose the user's Google password to ChessPress.

---

# 3. Authentication Screens

## Sign Up

The sign-up screen should contain:

- ChessPress logo
- Email field
- Password field
- Confirm password field
- Create Account button
- Continue with Google button
- Link to Sign In

Example:

> Create your ChessPress account  
> Start building your chess knowledge.

---

## Sign In

The sign-in screen should contain:

- Email field
- Password field
- Sign In button
- Continue with Google button
- Forgot Password link
- Link to Create Account

Example:

> Welcome back  
> Continue your chess training.

---

## Forgot Password

Users should be able to enter their email address and receive a secure password-reset link.

The reset link should:

- Expire after a limited period
- Be single-use
- Allow the user to create a new password

---

# 4. User Profile

Each ChessPress account should have a profile containing:

- Username/display name
- Profile picture/avatar
- Email address
- ChessPress account creation date
- Chess.com username if connected
- Lichess username if connected
- Current study goal
- Opening mastery
- Games analyzed
- Games studied
- Training statistics

The profile should not expose private account information to other users unless explicitly designed to do so.

---

# 5. ChessPress Account vs Chess Accounts

These must remain separate.

### ChessPress Account

Used for:

- Signing into ChessPress
- Saving personal data
- Repertoires
- Training progress
- Game library
- Settings
- Coach preferences

### Connected Chess Accounts

Users may optionally connect:

- Chess.com
- Lichess

These connections are used to import games, ratings, statistics, and other publicly/appropriately accessible chess data.

A user should be able to use ChessPress without connecting either chess platform.

---

# 6. Chess.com Connection

After signing into ChessPress, users should have an option:

**Connect Chess.com**

The connection should allow ChessPress to retrieve appropriate player/game data supported by Chess.com's available APIs or public data.

Possible imported information:

- Username
- Ratings
- Games
- Game results
- Time controls
- Opening information
- Game dates
- PGNs where available

Imported games should be added to the user's ChessPress game library.

The user should be able to disconnect Chess.com at any time.

ChessPress must not request or store the user's Chess.com password.

---

# 7. Lichess Connection

Users should also have:

**Connect Lichess**

The connection should use the appropriate Lichess authentication/API system.

Possible imported information:

- Username
- Ratings
- Games
- Game results
- Time controls
- PGNs
- Opening information
- Game dates
- Performance information

Imported games should become available in:

- Study Library
- Game Review
- Analysis Board
- Player Analysis
- Statistics

Users should be able to disconnect Lichess at any time.

ChessPress must never request or store a user's Lichess password.

---

# 8. Account Dashboard

After signing in, users should arrive at the ChessPress dashboard.

The dashboard should show:

### Training

- Reviews due today
- Opening mastery
- Current training streak
- Lines learned
- Lines due for review

### Games

- Recent games
- Games analyzed
- Recent Game Reviews
- Recently imported games

### Progress

- Accuracy
- Opening performance
- Training activity
- Frequently studied openings

### Quick Actions

- Analyze a Game
- Opening Explorer
- Practice Openings
- Import PGN
- Scout a Player
- View Study Library

---

# 9. User Data Storage

The following information should be associated with the user's ChessPress account.

### Profile

- User ID
- Display name
- Email
- Avatar
- Created date
- Preferences

### Repertoires

- Repertoire names
- Opening variations
- Saved positions
- Notes
- Mastery
- Review schedule

### Games

- Imported PGNs
- Analyzed games
- Saved games
- Bookmarked games
- Game metadata
- Analysis results

### Training

- Review history
- Correct/incorrect answers
- Memory scores
- Intervals
- Next review dates
- Opening mastery

### Settings

- Coach personality
- Board settings
- Piece set
- Sound preferences
- Notification settings
- Privacy settings

---

# 10. Data Synchronization

User data should be stored on the backend rather than only in the browser.

This allows users to:

- Sign in on another computer
- Sign in on a phone
- Continue their opening training
- Access saved games
- Keep their repertoire
- Maintain their progress

Example:

> User learns 20 Italian Game lines on their laptop.

Later:

> User signs into ChessPress on their phone.

Their repertoire and training progress should still be available.

---

# 11. Session Management

ChessPress should securely maintain a user's signed-in session.

Requirements:

- Secure authentication tokens
- Automatic session expiration where appropriate
- Secure logout
- Protected authenticated routes
- Do not expose authentication secrets in frontend code
- Do not store passwords in plain text

Unauthenticated users should not be able to access another user's private data.

---

# 12. Protected Routes

The following areas should require authentication:

- Dashboard
- Repertoires
- Opening Practice
- Study Library
- Saved Games
- Personal Game Review History
- Personal Statistics
- Account Settings
- Connected Accounts

Public functionality may include:

- Landing page
- Basic Opening Explorer
- Public player analysis
- Public opening information

---

# 13. Player Analysis and Public Players

The ChessPress account system must work separately from the Player Analysis feature.

### Analyze My Chess

A signed-in user can analyze their own:

- Chess.com account
- Lichess account
- Imported games

### Scout a Player

A user can enter another player's public:

- Chess.com username
- Lichess username

ChessPress can then analyze publicly available games and statistics without requiring that player to have a ChessPress account.

The target player should not receive access to the user's ChessPress account or private information.

---

# 14. Account Settings

Settings should include:

### Account

- Display name
- Email
- Password
- Profile picture
- Sign out

### Connected Accounts

- Connect Chess.com
- Disconnect Chess.com
- Connect Lichess
- Disconnect Lichess
- View connection status

### Coach

- Shreya personality
- Serious / Balanced / Chaotic
- Coach preferences

### Training

- Study goals
- Review preferences
- Training notifications

### Privacy

- Account visibility
- Data preferences
- Connected-account permissions

---

# 15. Account Deletion

Users should be able to permanently delete their ChessPress account.

Before deletion:

- Clearly explain what will be deleted.
- Require confirmation.
- Disconnect external chess accounts.
- Delete or anonymize personal account data according to the application's privacy requirements.

Account deletion should not accidentally delete the user's Chess.com or Lichess account.

---

# 16. Data Export

Users should be able to export their ChessPress data where practical.

Possible exports:

- Repertoires as PGN
- Games as PGN
- Study data
- Account data

The goal is to avoid locking users into ChessPress.

---

# 17. New User Experience

After creating an account for the first time, ChessPress should guide the user through a short setup.

### Step 1 — Welcome

> Welcome to ChessPress.

### Step 2 — Chess Level

Ask approximately:

- Beginner
- Intermediate
- Advanced

This should be used only to personalize the experience and should not be treated as an official rating.

### Step 3 — Connect Chess Account

Offer:

> Connect Chess.com

> Connect Lichess

> Skip for now

### Step 4 — Choose Training Goal

Examples:

- Learn an opening
- Improve tactics
- Analyze my games
- Build a repertoire
- Prepare for tournaments

### Step 5 — Dashboard

Take the user to their personalized ChessPress dashboard.

---

# 18. Authentication UI

The authentication experience should follow the ChessPress visual system.

### Style

- Matte black background
- Deep charcoal panels
- Dark blue accent
- White/off-white typography
- Minimal interface
- Rounded cards
- Subtle borders
- No unnecessary visual clutter

The authentication screen should feel like part of ChessPress rather than a generic authentication template.

---

# 19. Security Principles

Authentication and account data are security-critical.

The implementation must:

- Never store plain-text passwords
- Never expose API keys or OAuth secrets in frontend code
- Keep authentication secrets on the server
- Validate authenticated requests server-side
- Protect user-specific database queries
- Prevent users from accessing another user's data
- Securely handle OAuth callbacks
- Properly revoke/disconnect external integrations
- Validate imported game data
- Use HTTPS in production

Do not invent authentication behavior if the selected authentication provider/framework already provides a secure standard implementation.

---

# 20. Source of Truth

The backend authentication system is the source of truth for:

- User identity
- Sessions
- Account ownership
- Connected-account status
- User permissions

The database is the source of truth for:

- Repertoires
- Games
- Training progress
- Saved studies
- Preferences

ChessPress must not rely on browser local storage as the permanent source of a user's account data.

---

# 21. Important Development Rule

Authentication must be implemented before building features that depend heavily on persistent user data.

Recommended order:

1. Authentication
2. User database
3. User profile
4. Dashboard
5. Repertoires
6. Study progress
7. Game library
8. Chess.com/Lichess connections
9. Player Analysis
10. Advanced personalization

All authenticated features must use the same user ID so that a user's data remains connected across ChessPress.

---

# 22. Acceptance Criteria

The authentication system is complete when:

- A new user can create a ChessPress account.
- A user can sign in with email/password.
- A user can sign in with Google.
- An existing Google user is recognized on future sign-ins.
- A user can sign out.
- A user can reset their password.
- Authenticated routes are protected.
- User data belongs to the correct account.
- User data persists across devices.
- A user can connect Chess.com.
- A user can connect Lichess.
- A user can disconnect either platform.
- ChessPress never stores Chess.com or Lichess passwords.
- A user can access their repertoires and games after signing in again.
- A user can delete their ChessPress account.
- Public player analysis does not require the target player to have a ChessPress account.