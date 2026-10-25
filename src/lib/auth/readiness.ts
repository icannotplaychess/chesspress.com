import { getAuthSecret, hasDatabaseConfig } from "@/lib/env";

/** Returns an error code for /auth/error when auth cannot run safely. */
export function getAuthSetupError(): string | null {
  if (!getAuthSecret()) {
    return "MissingAuthSecret";
  }
  if (!hasDatabaseConfig()) {
    return "DatabaseNotConfigured";
  }
  return null;
}
