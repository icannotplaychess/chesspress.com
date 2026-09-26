import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/db";

let schemaReady: boolean | null = null;

function isMissingTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("P2021")
  );
}

/** Returns true when the User table exists and is queryable. */
export async function isSchemaReady(): Promise<boolean> {
  if (schemaReady === true) return true;
  try {
    await prisma.user.count();
    schemaReady = true;
    return true;
  } catch (err) {
    if (isMissingTableError(err)) {
      schemaReady = false;
      return false;
    }
    throw err;
  }
}

function loadMigrationStatements(): string[] {
  const relative = "prisma/migrations/20250918000000_init/migration.sql";
  const candidates = [
    join(process.cwd(), relative),
    join(process.cwd(), ".next/server", relative),
  ];

  let sql: string | null = null;
  for (const sqlPath of candidates) {
    try {
      sql = readFileSync(sqlPath, "utf-8");
      break;
    } catch {
      // try next path (Vercel serverless bundle layout varies)
    }
  }

  if (!sql) {
    throw new Error(
      `Migration SQL not found (tried: ${candidates.join(", ")}). Redeploy with prisma/migrations included.`
    );
  }
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

/**
 * Create tables at runtime when missing. Vercel injects Postgres env vars at
 * runtime but often not during build, so build-time migrate/db push is skipped.
 */
export async function ensureSchema(): Promise<{ ok: boolean; created: boolean }> {
  if (await isSchemaReady()) {
    return { ok: true, created: false };
  }

  if (!resolveDatabaseUrl()) {
    return { ok: false, created: false };
  }

  console.log("[ensure-schema] User table missing — applying migration SQL...");

  try {
    const statements = loadMigrationStatements();
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
    schemaReady = true;
    console.log("[ensure-schema] Tables created.");
    return { ok: true, created: true };
  } catch (err) {
    console.error("[ensure-schema] migration failed:", err);
    schemaReady = false;
    return { ok: false, created: false };
  }
}
