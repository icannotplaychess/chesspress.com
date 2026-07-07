import { NextRequest, NextResponse } from "next/server";
import { lookupOpening } from "@/lib/lichess/opening-lookup";
import type { LichessExplorerData, LichessMoveStat } from "@/lib/types";

const EXPLORER_HOSTS = [
  "https://explorer.lichess.ovh",
  "https://explorer.lichess.org",
];

function parseExplorerResponse(data: Record<string, unknown>): LichessExplorerData {
  const white = (data.white as number) ?? 0;
  const draws = (data.draws as number) ?? 0;
  const black = (data.black as number) ?? 0;
  const total = white + draws + black;

  const rawMoves = (data.moves as Array<Record<string, unknown>>) ?? [];
  const positionTotal = rawMoves.reduce(
    (sum, m) =>
      sum + ((m.white as number) ?? 0) + ((m.draws as number) ?? 0) + ((m.black as number) ?? 0),
    0
  );

  const moves: LichessMoveStat[] = rawMoves
    .map((m) => {
      const w = (m.white as number) ?? 0;
      const d = (m.draws as number) ?? 0;
      const b = (m.black as number) ?? 0;
      const games = w + d + b;
      return {
        uci: m.uci as string,
        san: m.san as string,
        white: games > 0 ? Math.round((w / games) * 100) : 0,
        draws: games > 0 ? Math.round((d / games) * 100) : 0,
        black: games > 0 ? Math.round((b / games) * 100) : 0,
        averageRating: (m.averageRating as number) ?? null,
        gameCount: games,
        popularity: positionTotal > 0 ? Math.round((games / positionTotal) * 100) : 0,
      };
    })
    .sort((a, b) => b.gameCount - a.gameCount);

  const openingData = data.opening as { eco: string; name: string } | null | undefined;

  return {
    white: total > 0 ? Math.round((white / total) * 100) : 0,
    draws: total > 0 ? Math.round((draws / total) * 100) : 0,
    black: total > 0 ? Math.round((black / total) * 100) : 0,
    moves,
    opening: openingData ? { eco: openingData.eco, name: openingData.name } : null,
    isOpening: (data.isOpening as boolean) ?? false,
  };
}

export async function GET(request: NextRequest) {
  const fen = request.nextUrl.searchParams.get("fen");
  if (!fen) {
    return NextResponse.json({ error: "FEN required" }, { status: 400 });
  }

  const play = request.nextUrl.searchParams.get("play") ?? "";
  const uciMoves = play ? play.split(",").filter(Boolean) : [];

  const params = new URLSearchParams({ fen });
  if (play) params.set("play", play.replace(/,/g, ","));

  let explorerData: LichessExplorerData | null = null;

  for (const host of EXPLORER_HOSTS) {
    try {
      const response = await fetch(`${host}/lichess?${params}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });

      if (!response.ok) continue;

      const text = await response.text();
      const line = text.trim().split("\n").pop() ?? text;
      const raw = JSON.parse(line) as Record<string, unknown>;
      explorerData = parseExplorerResponse(raw);
      break;
    } catch {
      // try next host
    }
  }

  const localOpening = lookupOpening(uciMoves);

  if (!explorerData) {
    explorerData = {
      white: 0,
      draws: 0,
      black: 0,
      moves: [],
      opening: localOpening
        ? { eco: localOpening.eco, name: localOpening.name }
        : null,
      isOpening: localOpening?.isInTheory ?? false,
    };

    return NextResponse.json({
      ...explorerData,
      unavailable: true,
    });
  }

  if (!explorerData.opening && localOpening) {
    explorerData.opening = { eco: localOpening.eco, name: localOpening.name };
    explorerData.isOpening = localOpening.isInTheory;
  } else if (localOpening && !localOpening.isInTheory) {
    explorerData.isOpening = false;
  }

  return NextResponse.json(explorerData);
}
