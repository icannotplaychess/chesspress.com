import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/env";
import { prisma } from "@/lib/db";

/** Quick check that the database is reachable (visit /api/health after deploy). */
export async function GET() {
  const dbConfig = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
  };

  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        ok: false,
        database: "not_configured",
        dbConfig,
        hasAuthSecret: Boolean(process.env.AUTH_SECRET),
        hint:
          "In Vercel → Storage → create/link Postgres, or set DATABASE_URL to your pooled Postgres URL.",
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      googleAuth: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      dbConfig,
    });
  } catch (err) {
    console.error("[health]", err);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        dbConfig,
        message: err instanceof Error ? err.message : "Database unreachable",
        hint:
          "Postgres is linked but unreachable. Try redeploying after linking Storage, or set DATABASE_URL to POSTGRES_PRISMA_URL.",
      },
      { status: 503 }
    );
  }
}
