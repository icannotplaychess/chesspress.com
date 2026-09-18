import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/env";
import { prisma } from "@/lib/db";

/** Quick check that the database is reachable (visit /api/health after deploy). */
export async function GET() {
  const dbConfig = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    AUTH_URL: Boolean(process.env.AUTH_URL ?? process.env.NEXTAUTH_URL),
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

    let tablesReady = false;
    let userCount: number | null = null;
    try {
      userCount = await prisma.user.count();
      tablesReady = true;
    } catch (tableErr) {
      console.error("[health] User table check failed:", tableErr);
    }

    const ok = tablesReady;
    return NextResponse.json(
      {
        ok,
        database: tablesReady ? "ready" : "connected_no_tables",
        tablesReady,
        userCount,
        googleAuth: Boolean(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
        hasAuthSecret: Boolean(process.env.AUTH_SECRET),
        dbConfig,
        hint: tablesReady
          ? undefined
          : "Database is reachable but tables are missing. Redeploy to apply schema (migrate deploy / db push).",
      },
      { status: ok ? 200 : 503 }
    );
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
