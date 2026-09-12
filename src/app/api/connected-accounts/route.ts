import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";
import { fetchPlayerProfile } from "@/lib/scout/fetch-games";
import type { ScoutPlatform } from "@/lib/scout/types";

const connectSchema = z.object({
  platform: z.enum(["chesscom", "lichess"]),
  username: z.string().min(1).max(64),
});

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const accounts = await prisma.connectedChessAccount.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { platform, username } = parsed.data;
  const trimmed = username.trim();

  const profile = await fetchPlayerProfile(platform as ScoutPlatform, trimmed);
  if (!profile.exists) {
    return NextResponse.json(
      { error: `Could not find "${trimmed}" on ${platform === "lichess" ? "Lichess" : "Chess.com"}.` },
      { status: 404 }
    );
  }

  const account = await prisma.connectedChessAccount.upsert({
    where: { userId_platform: { userId: user.id, platform } },
    create: {
      userId: user.id,
      platform,
      username: trimmed,
      ratings: JSON.stringify(profile.ratings),
    },
    update: {
      username: trimmed,
      ratings: JSON.stringify(profile.ratings),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(account);
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { platform } = await request.json();
  if (!platform) {
    return NextResponse.json({ error: "Platform required" }, { status: 400 });
  }

  await prisma.connectedChessAccount.deleteMany({
    where: { userId: user.id, platform },
  });

  return NextResponse.json({ ok: true });
}
