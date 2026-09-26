"use client";

import { useMemo, useState } from "react";
import type { ScoutFullReport, ScoutPlatform } from "@/lib/scout/types";
import { ScoutStudio } from "@/components/scout/ScoutStudio";

interface ScoutReportViewProps {
  report: ScoutFullReport;
  platform: ScoutPlatform;
}

export function ScoutReportView({ report, platform }: ScoutReportViewProps) {
  const [hunterMode, setHunterMode] = useState(true);
  const [colorFilter, setColorFilter] = useState<"white" | "black">("white");
  const [timeFormat, setTimeFormat] = useState<"blitz" | "rapid">("blitz");
  const [studioOpen, setStudioOpen] = useState(false);
  const [twinToast, setTwinToast] = useState(false);

  const openings = colorFilter === "white"
    ? report.openingsByColor.white
    : report.openingsByColor.black;

  const timeStats =
    timeFormat === "blitz"
      ? report.timeManagement.blitz
      : report.timeManagement.rapid;

  const subject = hunterMode ? report.profile.username : "you";
  const pronoun = hunterMode ? "they" : "you";

  const radar = report.psychology.radar;
  const radarPoints = useMemo(() => {
    const axes = [
      { key: "stability", label: "Stability", value: radar.stability },
      { key: "tilt", label: "Tilt", value: 100 - radar.tilt },
      { key: "resigns", label: "Resigns", value: 100 - radar.resigns },
      { key: "streak", label: "Streak", value: 100 - radar.streak },
      { key: "clock", label: "Clock", value: 100 - radar.clock },
      { key: "recovery", label: "Recovery", value: radar.recovery },
    ];
    const cx = 80;
    const cy = 80;
    const r = 60;
    const pts = axes.map((a, i) => {
      const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      const dist = (a.value / 100) * r;
      return `${cx + Math.cos(angle) * dist},${cy + Math.sin(angle) * dist}`;
    });
    return { axes, polygon: pts.join(" ") };
  }, [radar]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold">{report.profile.username}</h2>
            <p className="text-sm text-[var(--muted)]">
              Last {report.monthsBack} months · {report.profile.gamesAnalyzed} games
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <ScoreCell label="OVERALL" value={report.subScores.overall} />
            <ScoreCell label="ATK" value={report.subScores.atk} />
            <ScoreCell label="DEF" value={report.subScores.def} />
            <ScoreCell label="TIME" value={report.subScores.time} />
            <ScoreCell label="MIND" value={report.subScores.mind} />
          </div>

          <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-4">
            <p className="font-semibold text-[var(--accent-text)]">
              {report.archetype.name}
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">{report.archetype.tip}</p>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <RatingPill label="Bullet" value={report.ratingsByFormat.bullet} />
            <RatingPill label="Blitz" value={report.ratingsByFormat.blitz} />
            <RatingPill
              label="Rapid"
              value={report.ratingsByFormat.rapid}
              highlight
            />
            <RatingPill label="Daily" value={report.ratingsByFormat.daily} />
          </div>
          <div className="flex gap-6 text-sm">
            <span>Last 10: <strong>{report.lastTen}</strong></span>
            <span>
              Record:{" "}
              <strong>
                {report.profile.wins}-{report.profile.draws}-{report.profile.losses}
              </strong>
            </span>
          </div>
        </div>

        <aside className="lg:w-72 shrink-0 rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-4 lg:sticky lg:top-4 lg:self-start">
          <StalkerGauge score={report.stalker.score} label={report.stalker.label} />
          <p className="text-xs text-[var(--muted)] mt-2 mb-4">
            How exploitable {pronoun} are across {report.profile.gamesAnalyzed} games.
            Low = hard target.
          </p>
          <SignalBar label="Time trouble" value={report.stalker.signals.timeTrouble} />
          <SignalBar label="Tilts easily" value={report.stalker.signals.tiltsEasily} />
          <SignalBar label="Limited repertoire" value={report.stalker.signals.limitedRepertoire} />
          <SignalBar label="Repetitive patterns" value={report.stalker.signals.repetitivePatterns} />
        </aside>
      </header>

      <div className="rounded-xl bg-[#1a1a1a] border border-[var(--panel-border)] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm">
          Play against {report.profile.username}&apos;s Twin — practice vs their openings
          and style.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">
            Based on {report.profile.gamesAnalyzed} games
          </span>
          <button
            onClick={() => {
              setTwinToast(true);
              setTimeout(() => setTwinToast(false), 2500);
            }}
            className="rounded-lg bg-[var(--accent-bright)] px-4 py-2 text-sm text-white"
          >
            Play the Twin
          </button>
        </div>
      </div>
      {twinToast && (
        <p className="text-sm text-[var(--accent-text)]">Coming soon — Twin sparring bot.</p>
      )}

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">
            {hunterMode ? "How to beat them" : "Self-analysis"}
          </h3>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setHunterMode(true)}
              className={`px-3 py-1 rounded ${hunterMode ? "bg-[var(--accent-bright)] text-white" : "border"}`}
            >
              Hunter Mode
            </button>
            <button
              onClick={() => setHunterMode(false)}
              className={`px-3 py-1 rounded ${!hunterMode ? "bg-[var(--accent-bright)] text-white" : "border"}`}
            >
              Self-Analysis
            </button>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">Play solid — {report.archetype.tip}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setColorFilter("white")}
            className={`flex-1 py-2 rounded-lg border ${colorFilter === "white" ? "border-[var(--accent-bright)] bg-[var(--accent)]/20" : ""}`}
          >
            as White
          </button>
          <button
            onClick={() => setColorFilter("black")}
            className={`flex-1 py-2 rounded-lg border ${colorFilter === "black" ? "border-[var(--accent-bright)] bg-[var(--accent)]/20" : ""}`}
          >
            as Black
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <OpeningColumn
            title={`Weaknesses — where ${pronoun} slip as ${colorFilter}`}
            items={openings.weaknesses}
            tone="weak"
          />
          <OpeningColumn
            title={`Strengths — what holds up as ${colorFilter}`}
            items={openings.strengths}
            tone="strong"
          />
        </div>
        <div>
          <h4 className="font-medium mb-2">Pre-game checklist</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {report.preGameChecklist.map((item) => (
              <div key={item.tip} className="rounded-lg bg-[#0a0a0a] p-3 text-sm">
                <strong>{item.tip}</strong>
                <p className="text-[var(--muted)] text-xs mt-1">{item.justification}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            based on {report.profile.gamesAnalyzed} games
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
        <h3 className="text-lg font-semibold mb-2">Frequent Rivals</h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          {report.frequentRivals.rivalCount} rivals · {report.frequentRivals.nemesisCount} have their number
        </p>
        <RivalTable rows={report.frequentRivals.rivals} />
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
        <h3 className="text-lg font-semibold mb-2">Head to Head</h3>
        <RivalTable rows={report.headToHead} />
      </section>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
          <h3 className="text-lg font-semibold mb-1">Psychology</h3>
          <p className="text-xs text-[var(--muted)] mb-4">
            Mental resilience, 0–100 per dimension
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <svg viewBox="0 0 160 160" className="w-full max-w-[200px] mx-auto">
              <polygon
                points={radarPoints.polygon}
                fill="rgba(107, 163, 224, 0.35)"
                stroke="var(--accent-bright)"
              />
            </svg>
            <table className="text-sm w-full">
              <tbody>
                <MetricRow name="Stability" row={report.psychology.table.stability} />
                <MetricRow name="Tilt" row={report.psychology.table.tilt} suffix="%" />
                <MetricRow name="Post-Loss recovery" row={report.psychology.table.postLossRecovery} suffix="%" />
                <MetricRow name="Timeouts" row={report.psychology.table.timeouts} suffix="%" />
                <MetricRow name="Max losing streak" row={report.psychology.table.maxLosingStreak} />
                <MetricRow name="Resigns" row={report.psychology.table.resigns} suffix="%" />
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Recent</h3>
            <span className="text-xs text-[var(--muted)]">{report.profile.gamesAnalyzed} games</span>
          </div>
          <ul className="space-y-2 text-sm">
            {report.recentGames.map((g) => (
              <li key={g.id} className="border-b border-[var(--panel-border)] pb-2">
                <div className="flex justify-between">
                  <span>
                    {g.color === "white" ? "⬜" : "⬛"} {g.opponent}
                    {g.opponentRating ? ` (${g.opponentRating})` : ""}
                  </span>
                  <ResultBadge result={g.result} />
                </div>
                <p className="text-xs text-[var(--muted)] truncate">
                  {g.openingName ?? "Opening"} · {g.timeControl}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Time Management</h3>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setTimeFormat("blitz")}
              className={`px-3 py-1 rounded ${timeFormat === "blitz" ? "bg-[var(--accent-bright)] text-white" : "border"}`}
            >
              Blitz
            </button>
            <button
              onClick={() => setTimeFormat("rapid")}
              className={`px-3 py-1 rounded ${timeFormat === "rapid" ? "bg-[var(--accent-bright)] text-white" : "border"}`}
            >
              Rapid
            </button>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mb-4">
          {timeStats.gameCount} {timeFormat} games · clock data in {timeStats.clockDataPercent}%
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <StatTile title="Moves leaves book (avg)" value={String(timeStats.movesLeavesBookAvg)} />
          <StatTile title="Games under 0:30" value={`${timeStats.gamesUnder30Percent}%`} alert />
          <StatTile title="Blunder rate in time trouble" value={`×${timeStats.blunderRateInTimeTrouble}`} />
          <StatTile title="Instant moves out of book" value={`${timeStats.instantMovesOutOfBookPercent}%`} />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <TrapColumn title="Traps used" items={report.traps.trapsUsed} />
        <TrapColumn title="Falls into" items={report.traps.fallsInto} />
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
        <h3 className="text-lg font-semibold mb-2">Endgame Statistics</h3>
        <p className="text-sm text-[var(--muted)] mb-4">
          Where {subject} wins or collapses in long games
        </p>
        <div className="space-y-2">
          {report.endgameStats.map((row) => (
            <div key={row.type} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0">{row.type}</span>
              <div className="flex-1 h-2 bg-[#222] rounded overflow-hidden">
                <div
                  className="h-full bg-[var(--success)]"
                  style={{ width: `${Math.round(row.winRate * 100)}%` }}
                />
              </div>
              <span className="w-16 text-right">{Math.round(row.winRate * 100)}%</span>
              <span className="text-[var(--muted)] w-12">{row.games}g</span>
            </div>
          ))}
          {report.endgameStats.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Not enough long games in sample.</p>
          )}
        </div>
      </section>

      <div className="flex justify-center">
        <button
          onClick={() => setStudioOpen(true)}
          className="rounded-lg bg-[var(--accent-bright)] px-6 py-3 text-sm font-medium text-white"
        >
          Open Repertoire Studio
        </button>
      </div>

      {studioOpen && report.normalizedGames.length > 0 && (
        <ScoutStudio
          username={report.profile.username}
          platform={platform}
          games={report.normalizedGames}
          initialColor={colorFilter}
          onClose={() => setStudioOpen(false)}
        />
      )}
      {studioOpen && report.normalizedGames.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center">
          Load games for this player again to explore lines in Studio (move data is loaded on each scout).
        </p>
      )}
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-[var(--muted)]">{label}</div>
      <div className="text-2xl font-bold text-[var(--danger)]">{value}</div>
      <div className="h-1 mt-1 bg-[#333] rounded overflow-hidden">
        <div className="h-full bg-[var(--danger)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RatingPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[var(--muted)] text-xs">{label}</div>
      <div className={highlight ? "text-[var(--success)] font-bold" : "font-semibold"}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function StalkerGauge({ score, label }: { score: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold">{score}/100</div>
      <div className="text-sm text-[var(--accent-text)]">{label} exploitability</div>
    </div>
  );
}

function SignalBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-[#222] rounded">
        <div
          className="h-full bg-orange-500 rounded"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function OpeningColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: ScoutFullReport["openingsByColor"]["white"]["weaknesses"];
  tone: "weak" | "strong";
}) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No clear {tone === "weak" ? "weaknesses" : "strengths"}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((o) => (
            <li key={`${o.eco}-${o.name}`} className="text-sm border-b border-[var(--panel-border)] pb-2">
              <div className="font-semibold">{o.name}</div>
              <p className="text-xs chess-notation text-[var(--muted)]">{o.moves}</p>
              <div className="flex justify-between mt-1 text-xs">
                <span>{o.eco} · {o.gameCount} games</span>
                <span className={tone === "strong" ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                  {Math.round(o.winRate * 100)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RivalTable({ rows }: { rows: ScoutFullReport["headToHead"] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No repeat opponents in sample.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[var(--muted)] text-left">
          <th className="py-1">Opponent</th>
          <th>Games</th>
          <th>W-D-L</th>
          <th>Win%</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.username} className="border-t border-[var(--panel-border)]">
            <td className="py-2">{r.username}{r.rating ? ` (${r.rating})` : ""}</td>
            <td>{r.games}</td>
            <td>{r.wins}-{r.draws}-{r.losses}</td>
            <td>{Math.round(r.winRate * 100)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricRow({
  name,
  row,
  suffix = "",
}: {
  name: string;
  row: { value: number; label: string };
  suffix?: string;
}) {
  return (
    <tr className="border-b border-[var(--panel-border)]">
      <td className="py-1.5">{name}</td>
      <td className="py-1.5 font-medium">{row.value}{suffix}</td>
      <td className="py-1.5 text-[var(--muted)] text-xs">{row.label}</td>
    </tr>
  );
}

function ResultBadge({ result }: { result: "win" | "loss" | "draw" }) {
  const text = result === "win" ? "1-0" : result === "loss" ? "0-1" : "½-½";
  const cls =
    result === "win"
      ? "text-[var(--success)]"
      : result === "loss"
        ? "text-[var(--danger)]"
        : "text-[var(--muted)]";
  return <span className={cls} aria-label={result}>{text}</span>;
}

function StatTile({
  title,
  value,
  alert,
}: {
  title: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#0a0a0a] p-3">
      <div className="text-xs text-[var(--muted)]">{title}</div>
      <div className={`text-xl font-bold mt-1 ${alert ? "text-[var(--danger)]" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function TrapColumn({
  title,
  items,
}: {
  title: string;
  items: ScoutFullReport["traps"]["trapsUsed"];
}) {
  return (
    <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-4">
      <h4 className="font-medium mb-3">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">None detected in sample.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((t) => (
            <li key={t.name} className="flex justify-between border-b border-[var(--panel-border)] pb-2">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-[var(--muted)]">
                  {t.frequency} · {t.lastPlayed} · {t.count}x
                </div>
              </div>
              <span className={title === "Traps used" ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                {t.winRateLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
