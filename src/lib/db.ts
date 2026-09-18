import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Real Prisma client instance (required by @auth/prisma-adapter). */
export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = resolveDatabaseUrl();
    if (!url) {
      throw new Error(
        "Database not configured. Link Vercel Postgres or set DATABASE_URL."
      );
    }

    globalForPrisma.prisma = new PrismaClient({
      datasources: { db: { url } },
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}

/** Lazy Prisma client — avoids crashing builds when DATABASE_URL is unset. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
