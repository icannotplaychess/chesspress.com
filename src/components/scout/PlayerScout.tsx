"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { ScoutReportView } from "@/components/scout/ScoutReportView";
import { CoachPanel } from "@/components/analysis/CoachPanel";
import type { ScoutFullReport, ScoutPlatform, ScoutReport } from "@/lib/scout/types";

type Tab = "scout" | "self";

function isFullReport(report: ScoutReport): report is ScoutFullReport {
  return "subScores" in report && report.subScores !== undefined;
}

export function PlayerScout() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("scout");
  const [platform, setPlatform] = useState<ScoutPlatform>("chesscom");
  const [username, setUsername] = useState("");
  const [monthsBack, setMonthsBack] = useState(6);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [activePlatform, setActivePlatform] = useState<ScoutPlatform>("chesscom");

  const analyze = useCallback(
    async (targetUsername: string, targetPlatform: ScoutPlatform) => {
      setError("");
      setReport(null);
      setLoading(true);
      setProgress("Fetching games…");
      setActivePlatform(targetPlatform);

      try {
        const res = await fetch("/api/scout/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: targetPlatform,
            username: targetUsername,
            maxGames: 200,
            monthsBack,
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
    [monthsBack]
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Player Scout</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          ChessStalker-style scouting — scores, psychology, openings, and prep checklist.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center border border-[var(--panel-border)] rounded-lg p-2 bg-[var(--panel)]">
        <button
          onClick={() => setPlatform("chesscom")}
          className={`px-3 py-1.5 rounded text-sm ${platform === "chesscom" ? "bg-[var(--accent-bright)] text-white" : ""}`}
        >
          Chess.com
        </button>
        <button
          onClick={() => setPlatform("lichess")}
          className={`px-3 py-1.5 rounded text-sm ${platform === "lichess" ? "bg-[var(--accent-bright)] text-white" : ""}`}
        >
          Lichess.org
        </button>
        <button disabled className="px-3 py-1.5 rounded text-sm opacity-40" title="Coming soon">
          FIDE
        </button>
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
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="flex-1 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          />
          <select
            value={monthsBack}
            onChange={(e) => setMonthsBack(Number(e.target.value))}
            className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-sm"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
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
          <button
            onClick={analyzeSelf}
            disabled={loading}
            className="rounded-lg bg-[var(--accent-bright)] px-6 py-2.5 text-sm text-white disabled:opacity-50"
          >
            Analyze My Games
          </button>
          {!session && (
            <p className="text-xs text-[var(--muted)] mt-2">
              <Link href="/auth/signin" className="text-[var(--accent-text)]">Sign in</Link> to save reports.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 animate-pulse">
          <p className="text-sm text-[var(--muted)]">{progress}</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {report && isFullReport(report) && (
        <>
          <ScoutReportView report={report} platform={activePlatform} />
          <CoachPanel message={report.shreyaSummary} />
        </>
      )}

      {report && !isFullReport(report) && (
        <p className="text-sm text-[var(--muted)]">
          Cached legacy report — scout again for the full ChessStalker-style breakdown.
        </p>
      )}
    </div>
  );
}
