# ChessPress

A modern chess improvement platform with Stockfish analysis, Lichess opening data, adaptive training, and Shreya — your AI coach.

## Quick start (local)

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your Lichess token (see below)
npm run dev
```

Open [http://localhost:3000/analysis](http://localhost:3000/analysis)

## Lichess API token (required for database stats)

As of 2026, the **Lichess Opening Explorer requires authentication**. ChessPress proxies all Lichess requests through a server-side API route so your token is never exposed to the browser.

1. Go to [lichess.org/account/oauth/token](https://lichess.org/account/oauth/token)
2. Create a **Personal API access token** (no special scopes needed for read-only explorer access)
3. Set the environment variable:

```
LICHESS_API_TOKEN=lip_your_token_here
```

**Local:** add to `.env.local`  
**Vercel:** Project → Settings → Environment Variables → add `LICHESS_API_TOKEN`

Without the token, the Analysis Board still works — Stockfish analysis, opening names (local ECO book), and Shreya all function. Only live move popularity / win-rate stats from the Lichess database are disabled.

## Deployment (Vercel)

The Next.js app lives at the **repository root**. Connect the repo to Vercel with these settings:

| Setting | Value |
|---------|--------|
| **Production Branch** | `main` |
| **Root Directory** | *(leave empty — do NOT use `app`)* |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` |
| **Environment variable** | `LICHESS_API_TOKEN` |

### If the site is blank or shows "not found"

**The app is deployed and working at:** [https://chesspress-com.vercel.app](https://chesspress-com.vercel.app)

If `chesspress.com` shows a blank page or redirects to `/lander`, your **custom domain is not connected to Vercel** — it still points to a domain parking page. Fix:

1. Vercel → your project → **Settings → Domains**
2. Add `chesspress.com` and `www.chesspress.com`
3. Update DNS at your registrar to the records Vercel provides (usually `A` record to `76.76.21.21` or `CNAME` to `cname.vercel-dns.com`)
4. Wait for DNS propagation, then redeploy

Also verify:

- **Production branch** is `main`
- **Root Directory** is empty (not `app`)
- `LICHESS_API_TOKEN` is set in Environment Variables

Routes:

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/analysis` | Analysis Board |

## Analysis Board features

- **Stockfish 18** — live eval, best move, top-3 lines, mate scores
- **Evaluation bar** — vertical, synced with engine
- **Lichess database** — move popularity and win rates (with token)
- **Opening recognition** — ECO names from Lichess opening book + local fallback
- **Full-game analysis** — Stockfish move classifications for every move
- **Shreya** — coach explanations grounded in engine data
- **PGN/FEN import** — load games and positions

## Documentation

Project specifications are in the [`docs/`](docs/) directory.
