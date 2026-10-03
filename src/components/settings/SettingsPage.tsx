"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHero } from "@/components/ui/PageHero";

interface SettingsData {
  email?: string;
  name?: string;
  image?: string;
  hasPassword?: boolean;
  profile?: {
    displayName?: string;
    coachPersonality?: string;
  };
  connected?: Array<{ platform: string; username: string; ratings?: string }>;
}

export function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [coachPersonality, setCoachPersonality] = useState("balanced");
  const [connectPlatform, setConnectPlatform] = useState("lichess");
  const [connectUsername, setConnectUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
      setDisplayName(data.profile?.displayName ?? data.name ?? "");
      setCoachPersonality(data.profile?.coachPersonality ?? "balanced");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function saveProfile() {
    setError("");
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, coachPersonality }),
    });
    if (res.ok) setMessage("Settings saved.");
    else setError("Could not save settings.");
  }

  async function changePassword() {
    setError("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setError(data.error ?? "Could not update password.");
    }
  }

  async function connectAccount() {
    setError("");
    const res = await fetch("/api/connected-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: connectPlatform, username: connectUsername }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Connected ${connectUsername} on ${connectPlatform}.`);
      setConnectUsername("");
      load();
    } else {
      setError(data.error ?? "Could not connect account.");
    }
  }

  async function disconnect(platform: string) {
    await fetch("/api/connected-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    load();
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    await fetch("/api/account/delete", { method: "DELETE" });
    signOut({ callbackUrl: "/" });
  }

  return (
    <PageContainer className="py-8 space-y-8 max-w-2xl">
      <PageHero
        kicker="Settings"
        title="your account"
        titleItalic="& coach."
        description="Account, connected platforms, and how Shreya explains your chess."
        align="left"
      />

      {message && (
        <p className="text-sm text-[var(--success)] bg-[var(--success)]/10 rounded-lg px-4 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <section className="cp-card space-y-4 mb-0">
        <h2 className="cp-h2 text-[20px]">Account</h2>
        <p className="text-sm text-[var(--muted)]">{settings?.email ?? session?.user?.email}</p>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="cp-input"
          />
        </div>
        {settings?.hasPassword && (
          <>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="cp-input"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="cp-input"
              />
            </div>
            <button
              onClick={changePassword}
              className="cp-ghost"
            >
              Change password
            </button>
          </>
        )}
        <button
          onClick={saveProfile}
          className="cp-btn"
        >
          Save
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="block text-sm text-[var(--muted)] hover:text-foreground"
        >
          Sign out
        </button>
      </section>

      <section className="cp-card space-y-4 mb-0">
        <h2 className="cp-h2 text-[20px]">Connected accounts</h2>
        <p className="text-xs text-[var(--muted)]">
          Link your chess accounts to import games and analyze your own play. We never
          ask for your chess passwords.
        </p>
        {(settings?.connected ?? []).map((c) => (
          <div
            key={c.platform}
            className="flex items-center justify-between rounded-lg bg-[var(--bg)] px-4 py-3 text-sm"
          >
            <span className="capitalize">
              {c.platform}: <strong>{c.username}</strong>
            </span>
            <button
              onClick={() => disconnect(c.platform)}
              className="text-xs text-[var(--danger)] hover:underline"
            >
              Disconnect
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <select
            value={connectPlatform}
            onChange={(e) => setConnectPlatform(e.target.value)}
            className="rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="lichess">Lichess</option>
            <option value="chesscom">Chess.com</option>
          </select>
          <input
            value={connectUsername}
            onChange={(e) => setConnectUsername(e.target.value)}
            placeholder="Username"
            className="flex-1 rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <button
            onClick={connectAccount}
            disabled={!connectUsername.trim()}
            className="cp-btn disabled:opacity-50"
          >
            Connect
          </button>
        </div>
      </section>

      <section className="cp-card space-y-4 mb-0">
        <h2 className="cp-h2 text-[20px]">Coach — Shreya</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["serious", "balanced", "chaotic"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setCoachPersonality(p)}
              className={`cp-tab capitalize ${coachPersonality === p ? "on" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="cp-card mb-0 border-[var(--bad)]/30 bg-[var(--bad)]/5">
        <h2 className="font-semibold text-[var(--danger)]">Danger Zone</h2>
        <p className="text-sm text-[var(--muted)] mt-1 mb-4">
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={deleteAccount}
          className="rounded-md border border-[var(--danger)] text-[var(--danger)] px-4 py-2 text-sm hover:bg-[var(--danger)]/10"
        >
          Delete account
        </button>
      </section>
    </PageContainer>
  );
}
