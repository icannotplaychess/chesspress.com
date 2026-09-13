import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, unauthorized } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const job = await prisma.scoutAnalysisJob.findFirst({
    where: { id, userId: user.id },
    include: { result: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    totalGames: job.totalGames,
    message: job.message,
    error: job.error,
    report: job.result ? JSON.parse(job.result.report) : null,
  });
}
