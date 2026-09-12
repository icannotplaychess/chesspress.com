"use client";

import { useState } from "react";
import Link from "next/link";
import { useRepertoires } from "@/hooks/useRepertoires";
import {
  linesDueToday,
  repertoireMastery,
} from "@/lib/repertoire/spaced-repetition";
import { lineToPgn, repertoireToPgn } from "@/lib/repertoire/pgn";
import type { Repertoire } from "@/lib/repertoire/types";

export function RepertoireManager() {
  const {
    repertoires,
    loaded,
    create,
    update,
    remove,
    duplicate,
    addLineFromPgn,
    removeLine,
  } = useRepertoires();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<Repertoire["color"]>("white");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [importPgn, setImportPgn] = useState<{ repId: string; text: string; name: string } | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  if (!loaded) {
    return <p className="text-[var(--muted)]">Loading repertoires…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repertoires</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Build and manage your opening repertoires with spaced repetition tracking.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--accent-bright)] px-4 py-2 text-sm text-white"
        >
          + New Repertoire
        </button>
      </div>

      {repertoires.length === 0 ? (
        <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-12 text-center">
          <p className="text-lg mb-2">No repertoire yet.</p>
          <p className="text-sm text-[var(--muted)] mb-4">
            Create your first repertoire or explore openings and add lines.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-md bg-[var(--accent-bright)] px-4 py-2 text-sm text-white"
            >
              Create Repertoire
            </button>
            <Link
              href="/explorer"
              className="rounded-md border border-[var(--panel-border)] px-4 py-2 text-sm hover:bg-[#222]"
            >
              Explore Openings
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {repertoires.map((rep) => {
            const mastery = repertoireMastery(rep.lines);
            const due = linesDueToday(rep.lines);
            const expanded = expandedId === rep.id;

            return (
              <div
                key={rep.id}
                className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] overflow-hidden"
              >
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold">{rep.name}</h2>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-[var(--muted)]">
                      <span>{rep.lines.length} lines</span>
                      <span>{due} due today</span>
                      <span>{mastery}% mastery</span>
                      <span className="capitalize">{rep.color}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-[#222] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-bright)] transition-all"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                      href={`/practice?mode=tournament&rep=${rep.id}`}
                      className="rounded-md bg-[var(--accent-bright)] px-3 py-1.5 text-xs text-white"
                    >
                      Practice
                    </Link>
                    <button
                      onClick={() => {
                        setRenameId(rep.id);
                        setRenameValue(rep.name);
                      }}
                      className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-xs hover:bg-[#222]"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => setExpandedId(expanded ? null : rep.id)}
                      className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-xs hover:bg-[#222]"
                    >
                      {expanded ? "Hide" : "Lines"}
                    </button>
                    <button
                      onClick={() => duplicate(rep.id)}
                      className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-xs hover:bg-[#222]"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        const pgn = repertoireToPgn(rep.lines);
                        navigator.clipboard.writeText(pgn);
                      }}
                      className="rounded-md border border-[var(--panel-border)] px-3 py-1.5 text-xs hover:bg-[#222]"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${rep.name}"?`)) remove(rep.id);
                      }}
                      className="rounded-md border border-[var(--danger)]/50 text-[var(--danger)] px-3 py-1.5 text-xs hover:bg-[var(--danger)]/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-[var(--panel-border)] p-4 space-y-2">
                    <button
                      onClick={() =>
                        setImportPgn({ repId: rep.id, text: "", name: "New line" })
                      }
                      className="text-sm text-[var(--accent-text)] hover:underline mb-2"
                    >
                      + Import PGN line
                    </button>
                    {rep.lines.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">No lines yet.</p>
                    ) : (
                      rep.lines.map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="font-medium">{line.name}</span>
                            {line.eco && (
                              <span className="text-[var(--muted)] ml-2 text-xs">
                                {line.eco}
                              </span>
                            )}
                            <div className="text-xs text-[var(--muted)] chess-notation mt-0.5">
                              {line.moves.map((m) => m.san).join(" ")}
                            </div>
                            <div className="text-xs text-[var(--muted)] mt-0.5">
                              {line.memory.mastery}% mastery · next review{" "}
                              {line.memory.nextReview ?? "today"}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(lineToPgn(line))
                              }
                              className="text-xs text-[var(--muted)] hover:text-foreground"
                            >
                              Copy PGN
                            </button>
                            <button
                              onClick={() => removeLine(rep.id, line.id)}
                              className="text-xs text-[var(--danger)] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <h2 className="text-lg font-semibold mb-4">New Repertoire</h2>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Main White Repertoire"
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm mb-3"
            />
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value as Repertoire["color"])}
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm mb-4"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="both">Both</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--panel-border)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newName.trim()) return;
                  create(newName.trim(), newColor);
                  setNewName("");
                  setShowCreate(false);
                }}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--accent-bright)] text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {renameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <h2 className="text-lg font-semibold mb-4">Rename Repertoire</h2>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameId(null)}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--panel-border)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const rep = repertoires.find((r) => r.id === renameId);
                  if (rep && renameValue.trim()) {
                    update({ ...rep, name: renameValue.trim() });
                  }
                  setRenameId(null);
                }}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--accent-bright)] text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {importPgn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6">
            <h2 className="text-lg font-semibold mb-4">Import PGN Line</h2>
            <input
              value={importPgn.name}
              onChange={(e) =>
                setImportPgn({ ...importPgn, name: e.target.value })
              }
              placeholder="Line name"
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm mb-3"
            />
            <textarea
              value={importPgn.text}
              onChange={(e) =>
                setImportPgn({ ...importPgn, text: e.target.value })
              }
              placeholder="Paste PGN…"
              className="w-full h-32 rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] px-3 py-2 text-sm font-mono mb-4 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportPgn(null)}
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--panel-border)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const result = addLineFromPgn(
                    importPgn.repId,
                    importPgn.text,
                    importPgn.name
                  );
                  if (!result) alert("Invalid PGN");
                  setImportPgn(null);
                }}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--accent-bright)] text-white"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
