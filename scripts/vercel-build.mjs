import { execSync } from "node:child_process";

// Vercel Postgres injects POSTGRES_PRISMA_URL; Prisma expects DATABASE_URL.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

function run(cmd, timeoutMs = 600_000) {
  execSync(cmd, { stdio: "inherit", env: process.env, timeout: timeoutMs });
}

run("prisma generate", 120_000);

// Apply migrations with a hard timeout. `prisma db push` was hanging deploys
// for 45+ minutes when the database was unreachable.
const migrateUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL;

if (migrateUrl) {
  const migrateEnv = { ...process.env, DATABASE_URL: migrateUrl };
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: migrateEnv,
      timeout: 90_000,
    });
    console.log("[vercel-build] Database migrations applied.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[vercel-build] Migration skipped (${message}). Deploy continues — run "npx prisma migrate deploy" if tables are missing.`
    );
  }
} else {
  console.warn(
    "[vercel-build] No database URL found — skipping migrations. Link Vercel Postgres to this project."
  );
}

run("next build", 600_000);
