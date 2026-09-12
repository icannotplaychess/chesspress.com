"use client";

import dynamic from "next/dynamic";

export const OpeningExplorerClient = dynamic(
  () =>
    import("@/components/explorer/OpeningExplorer").then((mod) => ({
      default: mod.OpeningExplorer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[480px] text-[var(--muted)]">
        Loading opening explorer…
      </div>
    ),
  }
);
