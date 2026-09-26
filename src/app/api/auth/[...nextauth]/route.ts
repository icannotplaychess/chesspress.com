import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { getAuthSetupError } from "@/lib/auth/readiness";
import { ensureSchema } from "@/lib/ensure-schema";
import { hasDatabaseConfig } from "@/lib/env";

const { GET: authGET, POST: authPOST } = handlers;

async function prepareAuth() {
  const setupError = getAuthSetupError();
  if (setupError) {
    return NextResponse.json(
      {
        error: setupError,
        message:
          setupError === "MissingAuthSecret"
            ? "AUTH_SECRET is not set for this deployment environment."
            : "Database is not configured for this deployment.",
      },
      { status: 503 }
    );
  }

  if (hasDatabaseConfig()) {
    const bootstrap = await ensureSchema();
    if (!bootstrap.ok) {
      return NextResponse.json(
        {
          error: "DatabaseSetup",
          message:
            "Could not create database tables. Open /api/db/setup or check function logs.",
        },
        { status: 503 }
      );
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const blocked = await prepareAuth();
  if (blocked) return blocked;
  return authGET(request);
}

export async function POST(request: NextRequest) {
  const blocked = await prepareAuth();
  if (blocked) return blocked;
  return authPOST(request);
}
