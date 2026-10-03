"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme/theme-script";

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readDark(): boolean {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark") return true;
  if (attr === "light") return false;
  return systemPrefersDark();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useThemeToggle() {
  const [label, setLabel] = useState("☾ Dark");

  useEffect(() => {
    const sync = () => setLabel(readDark() ? "☀ Light" : "☾ Dark");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  const toggle = useCallback(() => {
    const nextDark = !readDark();
    const theme = nextDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    setLabel(nextDark ? "☀ Light" : "☾ Dark");
  }, []);

  return { label, toggle };
}
