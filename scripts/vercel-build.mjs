import { execSync } from "node:child_process";

// Map Vercel Postgres env for any build-time Prisma usage (generate only).
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

// Fast build — NO database migrate/db push here (those hung deploys for 45+ min).
// Tables are created at runtime via src/lib/ensure-schema.ts on first request.
console.log("[vercel-build] Skipping DB migrations (handled at runtime).");

execSync("npm run build", {
  stdio: "inherit",
  env: process.env,
  timeout: 600_000,
});
