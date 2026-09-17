import { NextResponse } from "next/server";

/** Public auth config so the UI can hide unavailable providers. */
export async function GET() {
  return NextResponse.json({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    credentials: true,
  });
}
