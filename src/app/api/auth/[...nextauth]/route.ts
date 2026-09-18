import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { ensureSchema } from "@/lib/ensure-schema";

const { GET: authGET, POST: authPOST } = handlers;

export async function GET(request: NextRequest) {
  await ensureSchema();
  return authGET(request);
}

export async function POST(request: NextRequest) {
  await ensureSchema();
  return authPOST(request);
}
