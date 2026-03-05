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
  const { email, name } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Find or create reviewer user
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // If user exists but belongs to different company, update
    if (user.companyId !== id) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { companyId: id, name: name || user.name },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        role: "REVIEWER",
        companyId: id,
      },
    });
  }

  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewerId } = await req.json();

  await prisma.user.update({
    where: { id: reviewerId },
    data: { companyId: null },
  });

  return NextResponse.json({ success: true });
}
