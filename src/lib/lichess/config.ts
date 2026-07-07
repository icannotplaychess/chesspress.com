/** Server-side Lichess API token (never expose to the client). */
export function getLichessApiToken(): string | undefined {
  return (
    process.env.LICHESS_API_TOKEN ??
    process.env.LICHESS_API_KEY ??
    undefined
  );
}

export const EXPLORER_BASE_URL = "https://explorer.lichess.org";
