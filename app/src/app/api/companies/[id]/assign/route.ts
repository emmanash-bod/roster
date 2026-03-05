import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { candidateIds } = await req.json();

  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return NextResponse.json({ error: "No candidates provided" }, { status: 400 });
  }

  // Get existing assignments to avoid duplicates
  const existing = await prisma.candidateAssignment.findMany({
    where: { companyId: id, candidateId: { in: candidateIds } },
    select: { candidateId: true },
  });
  const existingIds = new Set(existing.map((e) => e.candidateId));

  const newAssignments = candidateIds
    .filter((cid: string) => !existingIds.has(cid))
    .map((candidateId: string) => ({
      candidateId,
      companyId: id,
    }));

  if (newAssignments.length > 0) {
    await prisma.candidateAssignment.createMany({ data: newAssignments });
  }

  return NextResponse.json({ assigned: newAssignments.length });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { candidateId } = await req.json();

  await prisma.candidateAssignment.deleteMany({
    where: { companyId: id, candidateId },
  });

  return NextResponse.json({ success: true });
}
