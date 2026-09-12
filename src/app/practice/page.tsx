"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LearnTrainer } from "@/components/practice/LearnTrainer";
import { PracticeTrainer } from "@/components/practice/PracticeTrainer";
import type { PracticeMode } from "@/lib/repertoire/types";

function PracticeContent() {
  const params = useSearchParams();
  const step = params.get("step") ?? "learn";
  const mode = (params.get("mode") as PracticeMode) ?? "mixed";
  const rep = params.get("rep") ?? undefined;
  const line = params.get("line") ?? undefined;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-[var(--panel-border)]">
        <TabLink
          href={buildHref("learn", rep, line)}
          active={step === "learn"}
          label="1. Learn"
          sub="Shreya teaches the moves"
        />
        <TabLink
          href={buildHref("practice", rep, line, mode)}
          active={step === "practice"}
          label="2. Practice"
          sub="Repeat until memorized"
        />
      </div>

      {step === "learn" ? (
        <LearnTrainer
          key={`learn-${rep ?? ""}-${line ?? ""}`}
          tournamentRepId={rep}
          initialLineId={line}
        />
      ) : (
        <PracticeTrainer
          key={`practice-${mode}-${rep ?? ""}-${line ?? ""}`}
          initialMode={mode}
          tournamentRepId={mode === "tournament" ? rep : undefined}
          initialLineId={line}
        />
      )}
    </div>
  );
}

function buildHref(
  step: string,
  rep?: string,
  line?: string,
  mode?: string
): string {
  const params = new URLSearchParams();
  params.set("step", step);
  if (rep) params.set("rep", rep);
  if (line) params.set("line", line);
  if (mode && step === "practice") params.set("mode", mode);
  return `/practice?${params.toString()}`;
}

function TabLink({
  href,
  active,
  label,
  sub,
}: {
  href: string;
  active: boolean;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 px-4 py-3 text-left border-b-2 transition-colors ${
        active
          ? "border-[var(--accent-bright)] text-foreground"
          : "border-transparent text-[var(--muted)] hover:text-foreground"
      }`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-0.5 opacity-80">{sub}</div>
    </Link>
  );
}

export default function PracticePage() {
  return (
    <div className="flex-1 max-w-[900px] mx-auto w-full px-4 py-6">
      <Suspense fallback={<p className="text-[var(--muted)]">Loading…</p>}>
        <PracticeContent />
      </Suspense>
    </div>
  );
}
