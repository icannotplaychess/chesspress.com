import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const existing = await prisma.repertoire.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.repertoire.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
