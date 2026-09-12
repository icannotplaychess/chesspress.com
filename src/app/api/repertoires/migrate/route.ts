import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";
import type { Repertoire } from "@/lib/repertoire/types";

/** One-time migration from client localStorage repertoires to server. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const repertoires = body.repertoires as Repertoire[];
  if (!Array.isArray(repertoires)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const existing = await prisma.repertoire.count({ where: { userId: user.id } });
  if (existing > 0) {
    return NextResponse.json({ migrated: 0, message: "Already has server data" });
  }

  for (const rep of repertoires) {
    await prisma.repertoire.create({
      data: {
        userId: user.id,
        name: rep.name,
        color: rep.color,
        lines: JSON.stringify(rep.lines),
      },
    });
  }

  return NextResponse.json({ migrated: repertoires.length });
}
