import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface TTCandidate {
  id: string;
  attributes: {
    "first-name": string;
    "last-name": string;
    email: string;
    phone: string;
    pitch: string;
    picture: { standard?: string } | null;
    resume: string | null;
    "original-resume": string | null;
    "linkedin-url": string;
    tags: string[];
    "created-at": string;
    "updated-at": string;
  };
}

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await prisma.teamTailorConfig.findFirst();
  if (!config) {
    return NextResponse.json({ error: "Team Tailor not configured" }, { status: 400 });
  }

  const baseUrl = config.apiRegion === "us"
    ? "https://api.na.teamtailor.com"
    : "https://api.teamtailor.com";

  try {
    // Fetch all candidates with pagination
    const allCandidates: TTCandidate[] = [];
    let nextUrl: string | null = `${baseUrl}/v1/candidates?page[size]=30`;

    while (nextUrl) {
      const res: Response = await fetch(nextUrl, {
        headers: {
          Authorization: `Token token=${config.apiKey}`,
          "X-Api-Version": "20161108",
        },
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from Team Tailor" }, { status: 500 });
      }

      const data = await res.json();
      allCandidates.push(...data.data);
      nextUrl = data.links?.next || null;

      // Respect rate limits - max 500 candidates as per spec
      if (allCandidates.length >= 500) break;
    }

    // Get already imported candidate IDs
    const importedCandidates = await prisma.candidate.findMany({
      where: { teamTailorId: { not: null } },
      select: { teamTailorId: true, id: true, lastSyncedAt: true },
    });
    const importedMap = new Map(
      importedCandidates.map((c) => [c.teamTailorId, { id: c.id, lastSyncedAt: c.lastSyncedAt }])
    );

    const candidates = allCandidates.map((c) => {
      const imported = importedMap.get(c.id);
      return {
        teamTailorId: c.id,
        firstName: c.attributes["first-name"] || "",
        lastName: c.attributes["last-name"] || "",
        email: c.attributes.email || "",
        phone: c.attributes.phone || "",
        pitch: c.attributes.pitch || "",
        pictureUrl: typeof c.attributes.picture === "object" && c.attributes.picture?.standard
          ? c.attributes.picture.standard
          : null,
        resumeUrl: c.attributes["original-resume"] || c.attributes.resume || null,
        linkedinUrl: c.attributes["linkedin-url"] || "",
        tags: c.attributes.tags || [],
        createdAt: c.attributes["created-at"],
        updatedAt: c.attributes["updated-at"],
        imported: !!imported,
        rosterId: imported?.id || null,
        lastSyncedAt: imported?.lastSyncedAt || null,
      };
    });

    // Update last sync time
    await prisma.teamTailorConfig.update({
      where: { id: config.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      candidates,
      total: candidates.length,
      newCount: candidates.filter((c) => !c.imported).length,
    });
  } catch (error) {
    console.error("Team Tailor sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
