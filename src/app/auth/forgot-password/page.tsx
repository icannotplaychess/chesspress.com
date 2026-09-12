"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not send reset email.");
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll send you a link to reset your password"
    >
      {sent ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-[var(--muted)]">
            If an account exists for <strong>{email}</strong>, you will receive a
            reset link shortly. Check your inbox.
          </p>
          <Link href="/auth/signin" className="text-sm text-[var(--accent-text)] hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
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
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent-bright)] py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
          <p className="text-center text-sm text-[var(--muted)]">
            <Link href="/auth/signin" className="text-[var(--accent-text)] hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
