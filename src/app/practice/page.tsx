"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PracticeTrainer } from "@/components/practice/PracticeTrainer";
import type { PracticeMode } from "@/lib/repertoire/types";

function PracticeContent() {
  const params = useSearchParams();
  const mode = (params.get("mode") as PracticeMode) ?? "mixed";
  const rep = params.get("rep") ?? undefined;

  return (
    <PracticeTrainer
      key={`${mode}-${rep ?? ""}`}
      initialMode={mode}
      tournamentRepId={mode === "tournament" ? rep : undefined}
    />
  );
}

export default function PracticePage() {
  return (
    <div className="flex-1 max-w-[800px] mx-auto w-full px-4 py-6">
      <Suspense fallback={<p className="text-[var(--muted)]">Loading…</p>}>
        <PracticeContent />
      </Suspense>
    </div>
  );
}
