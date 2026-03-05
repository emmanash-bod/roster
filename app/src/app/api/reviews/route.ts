import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { candidateId, assignmentId, status, feedback } = await req.json();

  if (!candidateId || !assignmentId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify the reviewer has access to this assignment
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const assignment = await prisma.candidateAssignment.findUnique({
    where: { id: assignmentId },
    include: { company: true },
  });

  if (!assignment || assignment.companyId !== user.companyId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Upsert review
  const review = await prisma.review.upsert({
    where: {
      reviewerId_candidateId_assignmentId: {
        reviewerId: session.user.id,
        candidateId,
        assignmentId,
      },
    },
    update: { status, feedback: feedback || null },
    create: {
      reviewerId: session.user.id,
      candidateId,
      assignmentId,
      status,
      feedback: feedback || null,
    },
  });

  return NextResponse.json(review);
}
