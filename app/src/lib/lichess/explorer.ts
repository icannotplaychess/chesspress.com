import type { LichessExplorerData } from "@/lib/types";

export async function fetchLichessExplorer(
  fen: string,
  options: { uciMoves?: string[] } = {}
): Promise<LichessExplorerData & { unavailable?: boolean }> {
  const params = new URLSearchParams({ fen });
  if (options.uciMoves?.length) {
    params.set("play", options.uciMoves.join(","));
  }

  const response = await fetch(`/api/explorer?${params}`);

  if (!response.ok) {
    const fallback = await response.json().catch(() => null);
    if (fallback && !fallback.error) return fallback;
    throw new Error("Failed to fetch opening explorer data");
  }

  return response.json();
}
