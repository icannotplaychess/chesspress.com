import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { getAuthSetupError } from "@/lib/auth/readiness";
import { ensureSchema } from "@/lib/ensure-schema";
import { hasDatabaseConfig } from "@/lib/env";

const { GET: authGET, POST: authPOST } = handlers;

/** OAuth sign-in links are full-page navigations; send humans to /auth/error instead of JSON. */
function shouldRedirectSetupErrorToPage(request: NextRequest): boolean {
  return request.nextUrl.pathname.includes("/signin/");
}

function setupErrorResponse(setupError: string, request: NextRequest) {
  if (shouldRedirectSetupErrorToPage(request)) {
    const url = new URL("/auth/error", request.url);
    url.searchParams.set("error", setupError);
    return NextResponse.redirect(url);
  }

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

async function prepareAuth(request: NextRequest) {
  const setupError = getAuthSetupError();
  if (setupError) {
    return setupErrorResponse(setupError, request);
  }

  if (hasDatabaseConfig()) {
    const bootstrap = await ensureSchema();
    if (!bootstrap.ok) {
      if (shouldRedirectSetupErrorToPage(request)) {
        const url = new URL("/auth/error", request.url);
        url.searchParams.set("error", "DatabaseSetup");
        return NextResponse.redirect(url);
      }
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
  const blocked = await prepareAuth(request);
  if (blocked) return blocked;
  return authGET(request);
}

export async function POST(request: NextRequest) {
  const blocked = await prepareAuth(request);
  if (blocked) return blocked;
  return authPOST(request);
}
