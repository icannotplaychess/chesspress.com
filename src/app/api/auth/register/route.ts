import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureSchema } from "@/lib/ensure-schema";
import { hasDatabaseConfig } from "@/lib/env";
import { prisma } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth/password";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(64).optional(),
});

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        error:
          "Server database is not configured. Link Vercel Postgres or set DATABASE_URL.",
      },
      { status: 503 }
    );
  }

  const bootstrap = await ensureSchema();
  if (!bootstrap.ok) {
    return NextResponse.json(
      {
        error:
          "Could not initialize database tables. Visit /api/db/setup or redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Check email and password." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const passwordError = validatePassword(parsed.data.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name?.trim() || email.split("@")[0],
        profile: { create: {} },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    const detail = err instanceof Error ? err.message : "";
    if (detail.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Database tables are not set up yet. Redeploy the site to create them.",
        },
        { status: 503 }
      );
    }
    const message = detail.includes("connect")
      ? "Database connection failed. Check DATABASE_URL on Vercel."
      : "Could not create account. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
