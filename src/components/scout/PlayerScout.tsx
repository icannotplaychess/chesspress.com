"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { ScoutReportView } from "@/components/scout/ScoutReportView";
import { CoachPanel } from "@/components/analysis/CoachPanel";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHero } from "@/components/ui/PageHero";
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
    <PageContainer className="py-8 space-y-8">
      <PageHero
        kicker="Player scout"
        title="prep for"
        titleItalic="your game."
        description="Optional deep reports from real games — strengths, weaknesses, and a checklist. One feature in your improvement stack."
        align="left"
      />

      <div className="cp-nav-shell !mx-0 !max-w-none">
        <button
          type="button"
          onClick={() => setPlatform("chesscom")}
          className={`cp-pill ${platform === "chesscom" ? "on" : ""}`}
        >
          Chess.com
        </button>
        <button
          type="button"
          onClick={() => setPlatform("lichess")}
          className={`cp-pill ${platform === "lichess" ? "on" : ""}`}
        >
          Lichess.org
        </button>
        <button type="button" disabled className="cp-pill" title="Coming soon">
          FIDE
        </button>
        {tab === "scout" && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="cp-search"
            aria-label="Player username"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("scout")}
          className={`cp-tab ${tab === "scout" ? "on" : ""}`}
        >
          Scout a Player
        </button>
        <button
          type="button"
          onClick={() => setTab("self")}
          className={`cp-tab ${tab === "self" ? "on" : ""}`}
        >
          Analyze My Chess
        </button>
      </div>

      {tab === "scout" ? (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select
            value={monthsBack}
            onChange={(e) => setMonthsBack(Number(e.target.value))}
            className="cp-ghost bg-[var(--card)]"
            aria-label="Months of games"
          >
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
          <button
            type="button"
            onClick={() => analyze(username.trim(), platform)}
            disabled={loading || !username.trim()}
            className="cp-btn sm:ml-auto"
          >
            Scout Player
          </button>
        </div>
      ) : (
        <div className="cp-card mb-0">
          <button
            type="button"
            onClick={analyzeSelf}
            disabled={loading}
            className="cp-btn"
          >
            Analyze My Games
          </button>
          {!session && (
            <p className="text-xs text-[var(--mute)] mt-2 mb-0">
              <Link href="/auth/signin" className="text-[var(--brand)]">
                Sign in
              </Link>{" "}
              to save reports.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="cp-card mb-0 animate-pulse">
          <p className="text-sm text-[var(--mute)] m-0">{progress}</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--bad)] bg-[var(--bad)]/10 rounded-lg px-4 py-3 m-0">
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
        <p className="text-sm text-[var(--mute)]">
          This report is incomplete. Run scout again to refresh the analysis.
        </p>
      )}
    </PageContainer>
  );
}
