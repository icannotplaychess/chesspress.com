"use client";

import { useState } from "react";

interface ToolbarProps {
  onReset: () => void;
  onFlip: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onLoadPgn: (pgn: string) => boolean;
  onLoadFen: (fen: string) => boolean;
  onCopyPgn: () => void;
  onCopyFen: () => void;
  onAnalyzeGame: () => void;
  isAnalyzingGame: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  onReset,
  onFlip,
  onUndo,
  onRedo,
  onLoadPgn,
  onLoadFen,
  onCopyPgn,
  onCopyFen,
  onAnalyzeGame,
  isAnalyzingGame,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importType, setImportType] = useState<"pgn" | "fen">("pgn");
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = () => {
    setImportError(null);
    const success =
      importType === "pgn"
        ? onLoadPgn(importText)
        : onLoadFen(importText.trim());

    if (success) {
      setShowImport(false);
      setImportText("");
    } else {
      setImportError(
        importType === "pgn"
          ? "Invalid PGN. Check the format and try again."
          : "Invalid FEN. Check the position string and try again."
      );
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ToolButton onClick={onUndo} disabled={!canUndo} title="Undo">
          ←
        </ToolButton>
        <ToolButton onClick={onRedo} disabled={!canRedo} title="Redo">
          →
        </ToolButton>
        <Divider />
        <ToolButton onClick={onFlip} title="Flip board">
          ⇅
        </ToolButton>
        <ToolButton onClick={onReset} title="Reset board">
          Reset
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => setShowImport(true)} title="Import PGN or FEN">
          Import
        </ToolButton>
        <ToolButton onClick={onCopyPgn} title="Copy PGN">
          Copy PGN
        </ToolButton>
        <ToolButton onClick={onCopyFen} title="Copy FEN">
          Copy FEN
        </ToolButton>
        <Divider />
        <button
          onClick={onAnalyzeGame}
          disabled={isAnalyzingGame}
          className="rounded-md bg-[var(--accent-bright)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-text)] transition-colors disabled:opacity-50"
        >
          {isAnalyzingGame ? "Analyzing…" : "Analyze Game"}
        </button>
      </div>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">Import Position</h2>

            <div className="flex gap-2 mb-4">
              <TabButton
                active={importType === "pgn"}
                onClick={() => setImportType("pgn")}
              >
                PGN
              </TabButton>
              <TabButton
                active={importType === "fen"}
                onClick={() => setImportType("fen")}
              >
                FEN
              </TabButton>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={
                importType === "pgn"
                  ? "Paste PGN here…"
                  : "Paste FEN here…"
              }
              className="w-full h-40 rounded-lg border border-[var(--panel-border)] bg-[#0a0a0a] p-3 text-sm font-mono resize-none focus:outline-none focus:border-[var(--accent-bright)]"
            />

            {importError && (
              <p className="text-sm text-[var(--danger)] mt-2">{importError}</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <ToolButton onClick={() => setShowImport(false)}>Cancel</ToolButton>
              <button
                onClick={handleImport}
                className="rounded-md bg-[var(--accent-bright)] px-4 py-1.5 text-sm font-medium text-white"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-md border border-[var(--panel-border)] bg-[#1a1a1a] px-3 py-1.5 text-sm hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--panel-border)]" />;
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--muted)] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
