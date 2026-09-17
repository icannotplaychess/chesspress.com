/** Resolve the Postgres URL Vercel/Prisma expect at runtime. */
export function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const fallback =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (fallback) {
    // Prisma schema reads env("DATABASE_URL") — mirror Vercel Postgres vars.
    process.env.DATABASE_URL = fallback;
    return fallback;
  }

  return undefined;
}

export function hasDatabaseConfig(): boolean {
  return Boolean(resolveDatabaseUrl());
}
