"use client";

import { useState } from "react";
import type { Repertoire } from "@/lib/repertoire/types";
import type { RepertoireMove } from "@/lib/repertoire/types";

interface AddToRepertoireModalProps {
  repertoires: Repertoire[];
  lineName: string;
  eco?: string;
  moves: RepertoireMove[];
  onAdd: (repertoireId: string, lineName: string, eco?: string) => void;
  onCreate: (name: string) => Repertoire | void | Promise<Repertoire | void>;
  onClose: () => void;
}

export function AddToRepertoireModal({
  repertoires,
  lineName,
  eco,
  moves,
  onAdd,
  onCreate,
  onClose,
}: AddToRepertoireModalProps) {
  const [selectedId, setSelectedId] = useState(repertoires[0]?.id ?? "");
  const [name, setName] = useState(lineName);
  const [newRepName, setNewRepName] = useState("");
  const [showCreate, setShowCreate] = useState(repertoires.length === 0);

  if (moves.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-1">Add to Repertoire</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          {moves.length} move{moves.length !== 1 ? "s" : ""} · {moves.map((m) => m.san).join(" ")}
        </p>

        {showCreate ? (
          <div className="space-y-3">
            <input
              value={newRepName}
              onChange={(e) => setNewRepName(e.target.value)}
              placeholder="New repertoire name"
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
            <div className="flex gap-2 justify-end">
              {repertoires.length > 0 && (
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-sm rounded-md border border-[var(--panel-border)]"
                >
                  Back
                </button>
              )}
              <button
                onClick={async () => {
                  if (!newRepName.trim()) return;
                  const rep = await onCreate(newRepName.trim());
                  if (rep) {
                    onAdd(rep.id, name, eco);
                    onClose();
                  }
                }}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--accent-bright)] text-white"
              >
                Create & Add
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Line name"
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
            />
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--bg)] px-3 py-2 text-sm"
            >
              {repertoires.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.lines.length} lines)
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => setShowCreate(true)}
                className="text-sm text-[var(--accent-text)] hover:underline"
              >
                + New repertoire
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-sm rounded-md border border-[var(--panel-border)]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!selectedId || !name.trim()) return;
                    onAdd(selectedId, name.trim(), eco);
                    onClose();
                  }}
                  className="px-4 py-1.5 text-sm rounded-md bg-[var(--accent-bright)] text-white"
                >
                  Add Line
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
