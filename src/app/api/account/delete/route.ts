import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";

export async function DELETE() {
  const user = await requireUser();
  if (!user) return unauthorized();

  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ ok: true });
}
