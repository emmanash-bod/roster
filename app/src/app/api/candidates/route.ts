import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidates = await prisma.candidate.findMany({
    include: {
      _count: { select: { assignments: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(candidates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const candidate = await prisma.candidate.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
      summary: data.summary || "",
      skills: data.skills || [],
      experience: data.experience || [],
      education: data.education || [],
      certifications: data.certifications || [],
    },
  });

  return NextResponse.json(candidate, { status: 201 });
}
