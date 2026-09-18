import { execSync } from "node:child_process";

// Vercel Postgres injects POSTGRES_PRISMA_URL; Prisma expects DATABASE_URL.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

function run(cmd, env, timeoutMs = 600_000) {
  execSync(cmd, { stdio: "inherit", env, timeout: timeoutMs });
}

run("prisma generate", process.env, 120_000);

const migrateUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL;

if (migrateUrl) {
  const migrateEnv = { ...process.env, DATABASE_URL: migrateUrl };
  let schemaReady = false;

  try {
    run("npx prisma migrate deploy", migrateEnv, 90_000);
    schemaReady = true;
    console.log("[vercel-build] Database migrations applied.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[vercel-build] migrate deploy failed: ${message}`);
  }

  if (!schemaReady) {
    try {
      run(
        "npx prisma db push --accept-data-loss --skip-generate",
        migrateEnv,
        90_000
      );
      schemaReady = true;
      console.log("[vercel-build] Database schema pushed via db push.");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[vercel-build] db push failed: ${message}`);
    }
  }

  if (!schemaReady) {
    console.warn(
      "[vercel-build] Database tables may be missing — auth will fail until schema is applied."
    );
  }
} else {
  console.warn(
    "[vercel-build] No database URL found — skipping schema setup. Link Vercel Postgres to this project."
  );
}

run("next build", process.env, 600_000);
