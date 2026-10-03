"use client";

import { useThemeToggle } from "@/components/providers/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { label, toggle } = useThemeToggle();

  return (
    <button
      type="button"
      className={`cp-pill ml-auto ${className}`.trim()}
      onClick={toggle}
      aria-label="Toggle light and dark theme"
    >
      {label}
    </button>
  );
}
