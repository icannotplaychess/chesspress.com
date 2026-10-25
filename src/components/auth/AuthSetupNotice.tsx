"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthConfig = {
  ready?: boolean;
  setupError?: string | null;
};

export function AuthSetupNotice() {
  const [config, setConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((data: AuthConfig) => setConfig(data))
      .catch(() => setConfig({ ready: true }));
  }, []);

  if (!config || config.ready) return null;

  const code = config.setupError ?? "Configuration";

  return (
    <div
      className="mb-4 rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-3 text-sm text-[var(--danger)]"
      role="alert"
    >
      <p className="font-medium">Sign-in is unavailable on this deployment.</p>
      <p className="mt-1 text-[var(--muted)]">
        {code === "MissingAuthSecret"
          ? "Set AUTH_SECRET in Vercel (Production and Preview), then redeploy. Use the main site if you are on a preview URL."
          : "The server database is not configured for this URL."}
      </p>
      <Link
        href={`/auth/error?error=${encodeURIComponent(code)}`}
        className="mt-2 inline-block text-[var(--accent-text)] hover:underline"
      >
        View setup steps
      </Link>
    </div>
  );
}
