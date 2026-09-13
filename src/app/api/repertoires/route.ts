import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";
import type { Repertoire as RepertoireType } from "@/lib/repertoire/types";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const rows = await prisma.repertoire.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const repertoires: RepertoireType[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color as RepertoireType["color"],
    lines: JSON.parse(r.lines),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return NextResponse.json(repertoires);
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const name = body.name?.trim();
  const color = body.color ?? "white";
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const rep = await prisma.repertoire.create({
    data: {
      userId: user.id,
      name,
      color,
      lines: "[]",
    },
  });

  return NextResponse.json({
    id: rep.id,
    name: rep.name,
    color: rep.color,
    lines: [],
    createdAt: rep.createdAt.toISOString(),
    updatedAt: rep.updatedAt.toISOString(),
  });
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { id, name, color, lines } = body;
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const existing = await prisma.repertoire.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.repertoire.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(lines !== undefined && { lines: JSON.stringify(lines) }),
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    color: updated.color,
    lines: JSON.parse(updated.lines),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}
