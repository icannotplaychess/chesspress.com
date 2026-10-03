"use client";

interface CoachPanelProps {
  message: string;
}

export function CoachPanel({ message }: CoachPanelProps) {
  return (
    <div className="cp-card mb-0">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--brand)] flex items-center justify-center text-lg font-bold text-[var(--brand-ink)]">
          S
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-mono-label">Coach — Shreya</span>
          <p className="text-sm leading-relaxed text-[var(--ink)] whitespace-pre-line mt-2 mb-0">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
