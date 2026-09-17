import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

// Vercel Postgres injects POSTGRES_PRISMA_URL; Prisma expects DATABASE_URL.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

// Avoid reusing a cached .next that may still contain old Edge middleware output.
rmSync(".next", { recursive: true, force: true });

const env = { ...process.env };

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env });
}

run("prisma generate");
run("prisma db push --accept-data-loss --skip-generate");
run("next build");
