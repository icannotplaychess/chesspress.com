"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";

const MESSAGES: Record<string, { title: string; body: string }> = {
  MissingAuthSecret: {
    title: "Server auth not configured",
    body:
      "AUTH_SECRET is missing for this deployment (common on Preview URLs). In Vercel → Project → Settings → Environment Variables, set AUTH_SECRET for Production and Preview (generate with: openssl rand -base64 32), then redeploy.",
  },
  DatabaseNotConfigured: {
    title: "Database not linked",
    body:
      "This deployment has no Postgres connection. In Vercel → Storage → connect Postgres to the project, then redeploy.",
  },
  DatabaseSetup: {
    title: "Database tables not ready",
    body:
      "Postgres is linked but tables could not be created. Open /api/db/setup on this site once, or redeploy. If you use Preview deployments with a new Neon branch, wait a minute and try again.",
  },
  Configuration: {
    title: "Sign-in configuration error",
    body:
      "Auth failed on the server. Check AUTH_SECRET on this environment (Preview and Production), Google OAuth redirect URIs (include this site's URL + /api/auth/callback/google), or sign up with email and password.",
  },
  OAuthAccountNotLinked: {
    title: "Account already exists",
    body:
      "An account with this email already exists. Sign in with email/password first, then link Google from Settings.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Verification failed",
    body: "The sign-in link expired or was already used.",
  },
};

function ErrorContent() {
  const params = useSearchParams();
  const code = params.get("error") ?? "Configuration";
  const info = MESSAGES[code] ?? {
    title: "Sign-in failed",
    body: `Error code: ${code}. Try email sign-up instead, or clear cookies and try again.`,
  };

  return (
    <AuthLayout title={info.title} subtitle={info.body}>
      <div className="space-y-3">
        <Link
          href="/auth/signup"
          className="cp-btn block w-full text-center"
        >
          Create account with email
        </Link>
        <Link
          href="/auth/signin"
          className="block w-full text-center rounded-lg border border-[var(--panel-border)] py-2.5 text-sm text-[var(--muted)] hover:text-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
