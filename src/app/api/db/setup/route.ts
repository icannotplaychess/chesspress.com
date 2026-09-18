import { NextResponse } from "next/server";
import { ensureSchema, isSchemaReady } from "@/lib/ensure-schema";
import { hasDatabaseConfig } from "@/lib/env";

/** One-click database setup — creates tables if missing. Safe to call repeatedly. */
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        hint:
          "Link Vercel Postgres to this project (Storage → Postgres → Connect). POSTGRES_URL is not used — Vercel sets POSTGRES_PRISMA_URL instead.",
      },
      { status: 503 }
    );
  }

  const before = await isSchemaReady();
  const result = await ensureSchema();
  const after = await isSchemaReady();

  return NextResponse.json({
    ok: result.ok && after,
    tablesReady: after,
    created: result.created,
    wasReady: before,
    hint: after
      ? "Database is ready. You can sign up now."
      : "Table creation failed. Check Vercel function logs.",
  });
}
