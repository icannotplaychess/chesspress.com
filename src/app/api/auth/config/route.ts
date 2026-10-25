import { NextResponse } from "next/server";
import { getAuthSetupError } from "@/lib/auth/readiness";

/** Public auth config so the UI can hide unavailable providers. */
export async function GET() {
  const setupError = getAuthSetupError();
  return NextResponse.json({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    credentials: true,
    ready: !setupError,
    setupError,
  });
}
