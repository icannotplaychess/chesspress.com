import { hasDatabaseConfig } from "@/lib/env";

/** Returns an error code for /auth/error when auth cannot run safely. */
export function getAuthSetupError(): string | null {
  if (!process.env.AUTH_SECRET) {
    return "MissingAuthSecret";
  }
  if (!hasDatabaseConfig()) {
    return "DatabaseNotConfigured";
  }
  return null;
}
