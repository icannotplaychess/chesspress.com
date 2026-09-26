import type { RawGame } from "@/lib/scout/fetch-games";
import type { ScoutPlatform } from "@/lib/scout/types";

const TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  games: RawGame[];
  fetchedAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

function cacheKey(platform: ScoutPlatform, username: string): string {
  return `${platform}:${username.toLowerCase().trim()}`;
}

export function getCachedGames(
  platform: ScoutPlatform,
  username: string
): RawGame[] | null {
  const entry = memoryCache.get(cacheKey(platform, username));
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > TTL_MS) {
    memoryCache.delete(cacheKey(platform, username));
    return null;
  }
  return entry.games;
}

export function setCachedGames(
  platform: ScoutPlatform,
  username: string,
  games: RawGame[]
): void {
  memoryCache.set(cacheKey(platform, username), {
    games,
    fetchedAt: Date.now(),
  });
}

export function clearGameCache(): void {
  memoryCache.clear();
}
