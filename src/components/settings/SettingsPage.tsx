"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Account, connected platforms, and coach preferences.
        </p>
      </div>

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

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 space-y-4">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-[var(--muted)]">{settings?.email ?? session?.user?.email}</p>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={changePassword}
              className="rounded-md border border-[var(--panel-border)] px-4 py-2 text-sm"
            >
              Change password
            </button>
          </>
        )}
        <button
          onClick={saveProfile}
          className="rounded-md bg-[var(--accent-bright)] px-4 py-2 text-sm text-white"
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

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 space-y-4">
        <h2 className="font-semibold">Connected Accounts</h2>
        <p className="text-xs text-[var(--muted)]">
          Link your chess accounts to import games and analyze your own play. We never
          ask for your chess passwords.
        </p>
        {(settings?.connected ?? []).map((c) => (
          <div
            key={c.platform}
            className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-4 py-3 text-sm"
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
            className="rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm"
          >
            <option value="lichess">Lichess</option>
            <option value="chesscom">Chess.com</option>
          </select>
          <input
            value={connectUsername}
            onChange={(e) => setConnectUsername(e.target.value)}
            placeholder="Username"
            className="flex-1 rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm"
          />
          <button
            onClick={connectAccount}
            disabled={!connectUsername.trim()}
            className="rounded-md bg-[var(--accent-bright)] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Connect
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 space-y-4">
        <h2 className="font-semibold">Coach — Shreya</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["serious", "balanced", "chaotic"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setCoachPersonality(p)}
              className={`rounded-lg border p-3 text-sm capitalize ${
                coachPersonality === p
                  ? "border-[var(--accent-bright)] bg-[var(--accent)]/20"
                  : "border-[var(--panel-border)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-6">
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
    </div>
  );
}
