import { NextRequest, NextResponse } from "next/server";
import { getLichessApiToken, EXPLORER_BASE_URL } from "@/lib/lichess/config";
import { lookupOpening } from "@/lib/lichess/opening-lookup";
import type { LichessExplorerData, LichessMoveStat } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    isOpening: Boolean(openingData),
  };
}

function mergeOpening(
  data: LichessExplorerData,
  uciMoves: string[]
): LichessExplorerData {
  const localOpening = lookupOpening(uciMoves);

  if (localOpening) {
    data.opening = { eco: localOpening.eco, name: localOpening.name };
    data.isOpening = localOpening.isInTheory;
  } else if (!data.opening) {
    data.isOpening = false;
  }

  return data;
}

function buildFallback(
  uciMoves: string[],
  reason: "missing_token" | "unavailable"
): LichessExplorerData & { unavailable: boolean; missingToken?: boolean } {
  const localOpening = lookupOpening(uciMoves);

  return {
    white: 0,
    draws: 0,
    black: 0,
    moves: [],
    opening: localOpening
      ? { eco: localOpening.eco, name: localOpening.name }
      : null,
    isOpening: localOpening?.isInTheory ?? false,
    unavailable: true,
    missingToken: reason === "missing_token",
  };
}

async function fetchFromLichess(
  fen: string,
  token: string
): Promise<LichessExplorerData | null> {
  const params = new URLSearchParams({ fen });

  const response = await fetch(`${EXPLORER_BASE_URL}/lichess?${params}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Lichess explorer error:", response.status, await response.text());
    return null;
  }

  const text = await response.text();
  const line = text.trim().split("\n").pop() ?? text;
  const raw = JSON.parse(line) as Record<string, unknown>;
  return parseExplorerResponse(raw);
}

export async function GET(request: NextRequest) {
  const fen = request.nextUrl.searchParams.get("fen");
  if (!fen) {
    return NextResponse.json({ error: "FEN required" }, { status: 400 });
  }

  const play = request.nextUrl.searchParams.get("play") ?? "";
  const uciMoves = play ? play.split(",").filter(Boolean) : [];

  const token = getLichessApiToken();

  if (!token) {
    return NextResponse.json(buildFallback(uciMoves, "missing_token"));
  }

  try {
    const explorerData = await fetchFromLichess(fen, token);

    if (!explorerData) {
      return NextResponse.json(buildFallback(uciMoves, "unavailable"));
    }

    return NextResponse.json(mergeOpening(explorerData, uciMoves));
  } catch (error) {
    console.error("Explorer route error:", error);
    return NextResponse.json(buildFallback(uciMoves, "unavailable"));
  }
}
