import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          company: { select: { id: true, name: true } },
          reviews: {
            include: {
              reviewer: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  // Track if summary was manually edited
  const updateData: any = {};
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.summary !== undefined) {
    updateData.summary = data.summary;
    updateData.summaryIsManual = true;
  }
  if (data.skills !== undefined) updateData.skills = data.skills;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.education !== undefined) updateData.education = data.education;
  if (data.certifications !== undefined) updateData.certifications = data.certifications;
  if (data.pictureUrl !== undefined) updateData.pictureUrl = data.pictureUrl;
  if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;

  const candidate = await prisma.candidate.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(candidate);
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
  await prisma.candidate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
