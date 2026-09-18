import { NextResponse } from "next/server";
import { ensureSchema, isSchemaReady } from "@/lib/ensure-schema";
import { hasDatabaseConfig } from "@/lib/env";
import { prisma } from "@/lib/db";

/** Quick check that the database is reachable (visit /api/health after deploy). */
export async function GET() {
  const dbConfig = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    // POSTGRES_URL is often false on Vercel — that is normal; use POSTGRES_PRISMA_URL.
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
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
          "Link Vercel Postgres (Storage → Connect). Vercel sets POSTGRES_PRISMA_URL — you do NOT need POSTGRES_URL.",
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    let tablesReady = await isSchemaReady();
    if (!tablesReady) {
      const bootstrap = await ensureSchema();
      tablesReady = bootstrap.ok && (await isSchemaReady());
    }

    let userCount: number | null = null;
    if (tablesReady) {
      userCount = await prisma.user.count();
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
          : "Tables missing. Open /api/db/setup to create them, then try sign-up again.",
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
          "Postgres env vars may be missing. Link Vercel Postgres — POSTGRES_PRISMA_URL is what the app uses (POSTGRES_URL:false is normal).",
      },
      { status: 503 }
    );
  }
}
