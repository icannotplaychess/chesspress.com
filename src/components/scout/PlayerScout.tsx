"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { CoachPanel } from "@/components/analysis/CoachPanel";
import type { ScoutPlatform, ScoutReport } from "@/lib/scout/types";

type Tab = "scout" | "self";

export function PlayerScout() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("scout");
  const [platform, setPlatform] = useState<ScoutPlatform>("lichess");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [gameFilter, setGameFilter] = useState("all");

  const analyze = useCallback(
    async (targetUsername: string, targetPlatform: ScoutPlatform) => {
      setError("");
      setReport(null);
      setLoading(true);
      setProgress("Fetching games…");

      try {
        const res = await fetch("/api/scout/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: targetPlatform,
            username: targetUsername,
            maxGames: 100,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Analysis failed.");
          return;
        }
        setProgress(data.cached ? "Loaded cached report." : "Analysis complete.");
        setReport(data.report);
      } catch {
        setError("Could not reach the server. Try again later.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  async function analyzeSelf() {
    const res = await fetch("/api/connected-accounts");
    if (!res.ok) {
      setError("Connect a Chess.com or Lichess account in Settings first.");
      return;
    }
    const accounts = await res.json();
    const account = accounts[0];
    if (!account) {
      setError("No connected account. Link Chess.com or Lichess in Settings.");
      return;
    }
    await analyze(account.username, account.platform as ScoutPlatform);
  }

  const filteredGames =
    report?.games.filter((g) => {
      if (gameFilter === "all") return true;
      if (gameFilter === "wins") return g.playerResult === "win";
      if (gameFilter === "losses") return g.playerResult === "loss";
      return true;
    }) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Player Scout</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Discover strengths, weaknesses, and opening patterns from real games.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--panel-border)]">
        <button
          onClick={() => setTab("scout")}
          className={`px-4 py-2 text-sm border-b-2 -mb-px ${
            tab === "scout"
              ? "border-[var(--accent-bright)] text-foreground"
              : "border-transparent text-[var(--muted)]"
          }`}
        >
          Scout a Player
        </button>
        <button
          onClick={() => setTab("self")}
          className={`px-4 py-2 text-sm border-b-2 -mb-px ${
            tab === "self"
              ? "border-[var(--accent-bright)] text-foreground"
              : "border-transparent text-[var(--muted)]"
          }`}
        >
          Analyze My Chess
        </button>
      </div>

      {tab === "scout" ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as ScoutPlatform)}
            className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          >
            <option value="lichess">Lichess</option>
            <option value="chesscom">Chess.com</option>
          </select>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="flex-1 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          />
          <button
            onClick={() => analyze(username.trim(), platform)}
            disabled={loading || !username.trim()}
            className="rounded-lg bg-[var(--accent-bright)] px-6 py-2 text-sm text-white disabled:opacity-50"
          >
            Scout Player
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
          <p className="text-sm text-[var(--muted)] mb-4">
            Uses your connected Chess.com or Lichess account from Settings.
          </p>
          <button
            onClick={analyzeSelf}
            disabled={loading}
            className="rounded-lg bg-[var(--accent-bright)] px-6 py-2.5 text-sm text-white disabled:opacity-50"
          >
            Analyze My Games
          </button>
          {!session && (
            <p className="text-xs text-[var(--muted)] mt-2">
              <Link href="/auth/signin" className="text-[var(--accent-text)]">
                Sign in
              </Link>{" "}
              to save reports.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
          <p className="text-sm text-[var(--muted)]">{progress}</p>
          <div className="mt-3 h-2 rounded-full bg-[#222] overflow-hidden">
            <div className="h-full bg-[var(--accent-bright)] animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {report && (
        <>
          <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <h2 className="text-lg font-semibold mb-1">Player Profile</h2>
            <p className="text-xs text-[var(--muted)] mb-4">
              Based on {report.profile.gamesAnalyzed} analyzed games
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[var(--muted)]">Username</div>
                <div className="font-medium">
                  {report.profile.title ? `${report.profile.title} ` : ""}
                  {report.profile.username}
                </div>
              </div>
              <div>
                <div className="text-[var(--muted)]">Platform</div>
                <div className="font-medium capitalize">{report.profile.platform}</div>
              </div>
              <div>
                <div className="text-[var(--muted)]">Win rate</div>
                <div className="font-medium">
                  {Math.round(report.profile.winRate * 100)}%
                </div>
              </div>
              <div>
                <div className="text-[var(--muted)]">Record</div>
                <div className="font-medium">
                  {report.profile.wins}W / {report.profile.draws}D / {report.profile.losses}L
                </div>
              </div>
            </div>
            {Object.keys(report.profile.ratings).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                {Object.entries(report.profile.ratings).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded-md bg-[#0a0a0a] px-2 py-1 capitalize"
                  >
                    {k}: {v}
                  </span>
                ))}
              </div>
            )}
          </section>

          <div className="grid md:grid-cols-2 gap-4">
            <InsightCard title="Strengths" items={report.strengths} positive />
            <InsightCard title="Weaknesses" items={report.weaknesses} />
          </div>

          <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <h2 className="text-lg font-semibold mb-4">Opening Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <OpeningList title="White" openings={report.openingsWhite} />
              <OpeningList title="Black" openings={report.openingsBlack} />
            </div>
          </section>

          <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {report.phases.map((p) => (
                <div key={p.phase} className="rounded-lg bg-[#0a0a0a] p-4">
                  <div className="text-xs text-[var(--muted)] capitalize">{p.phase}</div>
                  <div className="font-medium mt-1">{p.label}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {p.gamesReached} games reached
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Time Controls</h3>
                {report.timeControls.map((tc) => (
                  <div
                    key={tc.speed}
                    className="flex justify-between text-sm py-1 border-b border-[var(--panel-border)]"
                  >
                    <span className="capitalize">{tc.speed}</span>
                    <span className="text-[var(--muted)]">
                      {tc.games} games · {Math.round(tc.score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">By Color</h3>
                <div className="text-sm space-y-1">
                  <div>
                    White: {report.profile.whiteGames} games ·{" "}
                    {Math.round(report.profile.whiteScore * 100)}% score
                  </div>
                  <div>
                    Black: {report.profile.blackGames} games ·{" "}
                    {Math.round(report.profile.blackScore * 100)}% score
                  </div>
                </div>
              </div>
            </div>
          </section>

          {report.patterns.length > 0 && (
            <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
              <h2 className="text-lg font-semibold mb-4">Recurring Patterns</h2>
              <div className="space-y-3">
                {report.patterns.map((p) => (
                  <div key={p.id} className="rounded-lg bg-[#0a0a0a] p-4">
                    <div className="font-medium">{p.title}</div>
                    <p className="text-sm text-[var(--muted)] mt-1">{p.description}</p>
                    <p className="text-xs text-[var(--muted)] mt-2 capitalize">
                      {p.evidence} evidence · {p.gameCount} games
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <CoachPanel message={report.shreyaSummary} />

          <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Games</h2>
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="rounded-md border border-[var(--panel-border)] bg-[#0a0a0a] px-2 py-1 text-xs"
              >
                <option value="all">All</option>
                <option value="wins">Wins</option>
                <option value="losses">Losses</option>
              </select>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGames.slice(0, 50).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-3 py-2 text-sm"
                >
                  <div>
                    <span className="text-[var(--muted)]">
                      {g.white} vs {g.black}
                    </span>
                    {g.openingName && (
                      <span className="ml-2 text-xs text-[var(--accent-text)]">
                        {g.openingEco} {g.openingName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={
                        g.playerResult === "win"
                          ? "text-[var(--success)]"
                          : g.playerResult === "loss"
                            ? "text-[var(--danger)]"
                            : "text-[var(--muted)]"
                      }
                    >
                      {g.playerResult}
                    </span>
                    <Link
                      href={`/analysis?pgn=${encodeURIComponent(g.pgn.slice(0, 500))}`}
                      className="text-xs text-[var(--accent-text)] hover:underline"
                    >
                      Analyze
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function InsightCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: { title: string; description: string; evidence: string; gameCount: number }[];
  positive?: boolean;
}) {
  return (
    <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Not enough data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg bg-[#0a0a0a] p-4">
              <div className={positive ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                {item.title}
              </div>
              <p className="text-sm text-[var(--muted)] mt-1">{item.description}</p>
              <p className="text-xs text-[var(--muted)] mt-2 capitalize">
                {item.evidence} evidence · {item.gameCount} games
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function OpeningList({
  title,
  openings,
}: {
  title: string;
  openings: { name: string; eco?: string; games: number; score: number }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {openings.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">No data</p>
      ) : (
        <div className="space-y-1">
          {openings.slice(0, 8).map((o) => (
            <div
              key={`${o.eco}-${o.name}`}
              className="flex justify-between text-sm py-1 border-b border-[var(--panel-border)]"
            >
              <span>
                {o.eco && <span className="text-[var(--muted)] mr-1">{o.eco}</span>}
                {o.name}
              </span>
              <span className="text-[var(--muted)] text-xs">
                {o.games}g · {Math.round(o.score * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
