import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { assignments: true, reviewers: true } },
      assignments: {
        include: {
          candidate: { select: { firstName: true, lastName: true, id: true } },
          reviews: {
            include: { reviewer: { select: { name: true, email: true } } },
          },
        },
      },
      reviewers: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, contactName, contactEmail, notes } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      notes: notes || null,
      shareToken: randomUUID(),
    },
  });

  return NextResponse.json(company, { status: 201 });
}
