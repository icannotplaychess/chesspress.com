"use client";

import type { ReactNode } from "react";
import { EvaluationBar } from "@/components/analysis/EvaluationBar";

export function BoardWrapper({
  children,
  cp,
  mate,
  orientation = "white",
  evalTitle,
}: {
  children: ReactNode;
  cp?: number | null;
  mate?: number | null;
  orientation?: "white" | "black";
  evalTitle?: string;
}) {
  const showEval = cp !== undefined || mate !== undefined;

  return (
    <div className="cp-board-wrap" role="group" aria-label="Chess board and evaluation">
      {showEval && (
        <EvaluationBar
          cp={cp ?? 0}
          mate={mate ?? null}
          orientation={orientation}
          title={evalTitle}
        />
      )}
      <div className="flex-1 aspect-square min-w-0">{children}</div>
    </div>
  );
}
