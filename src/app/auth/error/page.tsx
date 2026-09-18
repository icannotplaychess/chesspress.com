"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";

const MESSAGES: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "Sign-in configuration error",
    body:
      "Google sign-in failed on the server. This usually means GOOGLE_CLIENT_SECRET is wrong in Vercel, or the redirect URI is missing in Google Cloud Console. Add https://chesspress-com.vercel.app/api/auth/callback/google as an authorized redirect URI. You can still sign up with email and password.",
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
          className="block w-full text-center rounded-lg bg-[var(--accent-bright)] py-2.5 text-sm font-medium text-white"
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
