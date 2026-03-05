import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { email, companyToken } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Find the company by share token
  const company = await prisma.company.findUnique({
    where: { shareToken: companyToken },
  });

  if (!company || !company.isActive) {
    return NextResponse.json({ error: "Invalid or inactive link" }, { status: 400 });
  }

  // Find reviewer user for this company
  const user = await prisma.user.findFirst({
    where: { email, companyId: company.id, role: "REVIEWER" },
  });

  if (!user) {
    return NextResponse.json({ error: "You are not authorized to review candidates for this company" }, { status: 403 });
  }

  // Create magic token (valid for 1 hour)
  const token = randomUUID();
  await prisma.magicToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // In production, send email with magic link
  // For now, return the token directly (dev mode)
  const magicLink = `/review/${companyToken}?token=${token}`;

  return NextResponse.json({
    success: true,
    // In production, remove this - just send email
    magicLink,
    message: "Check your email for the login link",
  });
}
