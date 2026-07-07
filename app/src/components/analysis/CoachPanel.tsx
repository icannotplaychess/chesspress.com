"use client";

interface CoachPanelProps {
  message: string;
}

export function CoachPanel({ message }: CoachPanelProps) {
  return (
    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-lg font-bold text-white">
          S
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--accent-text)] mb-1">
            Shreya
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90">{message}</p>
        </div>
      </div>
    </div>
  );
}
