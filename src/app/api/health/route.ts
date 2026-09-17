import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Quick check that the database is reachable (visit /api/health after deploy). */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      googleAuth: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasDatabaseUrl: Boolean(
        process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
      ),
    });
  } catch (err) {
    console.error("[health]", err);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: err instanceof Error ? err.message : "Database unreachable",
        hint:
          "Connect Vercel Postgres (sets POSTGRES_PRISMA_URL automatically) or set DATABASE_URL to your pooled Postgres URL.",
      },
      { status: 503 }
    );
  }
}
