"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const AnalysisBoardInner = dynamic(
  () =>
    import("@/components/analysis/AnalysisBoard").then((mod) => ({
      default: mod.AnalysisBoard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[480px] text-[var(--muted)]">
        Loading analysis board…
      </div>
    ),
  }
);

export function AnalysisBoardClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[480px] text-[var(--muted)]">
          Loading analysis board…
        </div>
      }
    >
      <AnalysisBoardInner />
    </Suspense>
  );
}
