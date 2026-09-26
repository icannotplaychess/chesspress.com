import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";
import { fetchPlayerGames, fetchPlayerProfile } from "@/lib/scout/fetch-games";
import { buildFullScoutReport } from "@/lib/scout/build-full-report";
import type { ScoutPlatform } from "@/lib/scout/types";

const schema = z.object({
  platform: z.enum(["chesscom", "lichess"]),
  username: z.string().min(1).max(64),
  maxGames: z.number().min(10).max(225).optional(),
  monthsBack: z.number().min(1).max(24).optional(),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { platform, username } = parsed.data;
    const maxGames = parsed.data.maxGames ?? 200;
    const monthsBack = parsed.data.monthsBack ?? 6;
    const normalizedUsername = username.trim();

    // Check cache (24h)
    const cached = await prisma.scoutAnalysisResult.findUnique({
      where: {
        platform_username: { platform, username: normalizedUsername.toLowerCase() },
      },
    });
    if (cached && cached.expiresAt > new Date()) {
      const report = JSON.parse(cached.report);
      return NextResponse.json({ jobId: null, report, cached: true });
    }

    const job = await prisma.scoutAnalysisJob.create({
      data: {
        userId: user.id,
        platform,
        username: normalizedUsername,
        status: "fetching",
        message: "Fetching games…",
      },
    });

    // Run analysis (async in background for large sets — here inline with progress updates)
    try {
      const profile = await fetchPlayerProfile(
        platform as ScoutPlatform,
        normalizedUsername
      );
      if (!profile.exists) {
        await prisma.scoutAnalysisJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            error: `Player "${normalizedUsername}" not found on ${platform === "lichess" ? "Lichess" : "Chess.com"}.`,
          },
        });
        return NextResponse.json(
          { jobId: job.id, error: `Player not found.` },
          { status: 404 }
        );
      }

      await prisma.scoutAnalysisJob.update({
        where: { id: job.id },
        data: { status: "fetching", progress: 20, message: "Fetching games…" },
      });

      const games = await fetchPlayerGames(
        platform as ScoutPlatform,
        normalizedUsername,
        { maxGames, monthsBack, useCache: true }
      );

      if (games.length === 0) {
        await prisma.scoutAnalysisJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            error: "No games found for this player.",
          },
        });
        return NextResponse.json(
          { jobId: job.id, error: "No games found." },
          { status: 404 }
        );
      }

      if (games.length < 5) {
        await prisma.scoutAnalysisJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            error: `Only ${games.length} games found — need at least 5 for meaningful analysis.`,
          },
        });
        return NextResponse.json(
          { jobId: job.id, error: "Too few games for analysis." },
          { status: 400 }
        );
      }

      await prisma.scoutAnalysisJob.update({
        where: { id: job.id },
        data: {
          status: "analyzing",
          progress: 60,
          totalGames: games.length,
          message: `Analyzing ${games.length} games…`,
        },
      });

      const report = buildFullScoutReport(
        platform as ScoutPlatform,
        normalizedUsername,
        games,
        profile,
        { monthsBack }
      );
      report.profile.gamesAnalyzed = report.normalizedGames.length;

      const { normalizedGames: _ng, ...reportForCache } = report;

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const result = await prisma.scoutAnalysisResult.upsert({
        where: {
          platform_username: {
            platform,
            username: normalizedUsername.toLowerCase(),
          },
        },
        create: {
          platform,
          username: normalizedUsername.toLowerCase(),
          report: JSON.stringify({ ...reportForCache, normalizedGames: [] }),
          gameCount: report.profile.gamesAnalyzed,
          expiresAt,
        },
        update: {
          report: JSON.stringify({ ...reportForCache, normalizedGames: [] }),
          gameCount: report.profile.gamesAnalyzed,
          cachedAt: new Date(),
          expiresAt,
        },
      });

      await prisma.scoutAnalysisJob.update({
        where: { id: job.id },
        data: {
          status: "complete",
          progress: 100,
          totalGames: games.length,
          resultId: result.id,
          message: "Analysis complete.",
        },
      });

      return NextResponse.json({ jobId: job.id, report, cached: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed.";
      await prisma.scoutAnalysisJob.update({
        where: { id: job.id },
        data: { status: "failed", error: message },
      });
      return NextResponse.json({ jobId: job.id, error: message }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
