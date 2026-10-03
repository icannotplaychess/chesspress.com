"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LearnTrainer } from "@/components/practice/LearnTrainer";
import { PracticeTrainer } from "@/components/practice/PracticeTrainer";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHero } from "@/components/ui/PageHero";
import type { PracticeMode } from "@/lib/repertoire/types";

function PracticeContent() {
  const params = useSearchParams();
  const step = params.get("step") ?? "learn";
  const mode = (params.get("mode") as PracticeMode) ?? "mixed";
  const rep = params.get("rep") ?? undefined;
  const line = params.get("line") ?? undefined;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
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
      className={`cp-tab no-underline flex flex-col ${active ? "on" : ""}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs mt-0.5 opacity-80 font-normal normal-case tracking-normal">
        {sub}
      </span>
    </Link>
  );
}

export default function PracticePage() {
  return (
    <PageContainer className="py-6">
      <PageHero
        kicker="Learn & practice"
        title="train the"
        titleItalic="lines."
        description="Learn each move with Shreya, then practice from memory with spaced repetition until your repertoire is automatic."
        align="center"
      />
      <Suspense fallback={<p className="text-[var(--mute)]">Loading…</p>}>
        <PracticeContent />
      </Suspense>
    </PageContainer>
  );
}
