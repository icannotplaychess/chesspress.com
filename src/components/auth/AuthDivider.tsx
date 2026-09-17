"use client";

import { useEffect, useState } from "react";

/** "or" divider — only shown when Google sign-in is configured. */
export function AuthDivider() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((data) => setShow(Boolean(data.google)))
      .catch(() => setShow(false));
  }, []);

  if (!show) return null;

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--panel-border)]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-[var(--panel)] px-2 text-[var(--muted)]">or</span>
      </div>
    </div>
  );
}
