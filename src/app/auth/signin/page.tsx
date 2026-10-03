"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { GoogleButton } from "@/components/auth/GoogleButton";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to ChessPress">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
        </div>
        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-[var(--accent-text)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent-bright)] py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/auth/signup" className="text-[var(--accent-text)] hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
