import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/auth/password";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();

  const [profile, connected] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.connectedChessAccount.findMany({ where: { userId: user.id } }),
  ]);

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  return NextResponse.json({
    email: dbUser?.email,
    name: dbUser?.name,
    image: dbUser?.image,
    hasPassword: !!dbUser?.passwordHash,
    profile,
    connected,
  });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const body = await request.json();

  if (body.displayName !== undefined || body.coachPersonality !== undefined) {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: body.displayName,
        coachPersonality: body.coachPersonality ?? "balanced",
      },
      update: {
        ...(body.displayName !== undefined && { displayName: body.displayName }),
        ...(body.coachPersonality !== undefined && {
          coachPersonality: body.coachPersonality,
        }),
        ...(body.explanationLength !== undefined && {
          explanationLength: body.explanationLength,
        }),
        ...(body.humorLevel !== undefined && { humorLevel: body.humorLevel }),
        ...(body.beginnerMode !== undefined && { beginnerMode: body.beginnerMode }),
      },
    });
  }

  if (body.name !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: body.name },
    });
  }

  if (body.newPassword) {
    const passwordError = validatePassword(body.newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    if (body.currentPassword) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser?.passwordHash) {
        const valid = await verifyPassword(body.currentPassword, dbUser.passwordHash);
        if (!valid) {
          return NextResponse.json(
            { error: "Current password is incorrect." },
            { status: 400 }
          );
        }
      }
    }
    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  return NextResponse.json({ ok: true });
}
