import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [candidateCount, companyCount, reviewCount, pendingReviews] = await Promise.all([
    prisma.candidate.count(),
    prisma.company.count(),
    prisma.review.count({ where: { status: { not: "NOT_REVIEWED" } } }),
    prisma.review.count({ where: { status: "NOT_REVIEWED" } }),
  ]);

  const recentReviews = await prisma.review.findMany({
    where: { status: { not: "NOT_REVIEWED" } },
    include: {
      reviewer: { select: { name: true, email: true } },
      candidate: { select: { firstName: true, lastName: true } },
      assignment: { include: { company: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const companies = await prisma.company.findMany({
    include: {
      assignments: {
        include: {
          reviews: { where: { status: { not: "NOT_REVIEWED" } } },
        },
      },
      reviewers: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-950">Dashboard</h1>
        <p className="text-navy-500 text-sm mt-1">Overview of candidates, companies, and reviews</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Candidates" value={candidateCount} href="/admin/candidates" />
        <StatCard label="Companies" value={companyCount} href="/admin/companies" />
        <StatCard label="Reviews" value={reviewCount} />
        <StatCard label="Pending Reviews" value={pendingReviews} accent />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-950 mb-4">Recent Reviews</h2>
          {recentReviews.length === 0 ? (
            <p className="text-navy-400 text-sm">No reviews yet</p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      {review.candidate.firstName} — {review.assignment.company.name}
                    </p>
                    <p className="text-xs text-navy-400">
                      by {review.reviewer.name || review.reviewer.email}
                    </p>
                  </div>
                  <StatusBadge status={review.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Companies Overview */}
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-950">Companies</h2>
            <Link href="/admin/companies" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              View all
            </Link>
          </div>
          {companies.length === 0 ? (
            <p className="text-navy-400 text-sm">No companies yet</p>
          ) : (
            <div className="space-y-3">
              {companies.map((company) => {
                const totalAssignments = company.assignments.length;
                const totalReviews = company.assignments.reduce((acc, a) => acc + a.reviews.length, 0);
                return (
                  <Link
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    className="flex items-center justify-between py-2 border-b border-navy-50 last:border-0 hover:bg-navy-50/50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy-900">{company.name}</p>
                      <p className="text-xs text-navy-400">
                        {totalAssignments} candidates · {company.reviewers.length} reviewers
                      </p>
                    </div>
                    <span className="text-xs text-navy-500">{totalReviews} reviews</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href?: string; accent?: boolean }) {
  const content = (
    <div className={`rounded-xl border p-5 ${accent ? "bg-orange-50 border-orange-200" : "bg-white border-navy-100"}`}>
      <p className={`text-sm font-medium ${accent ? "text-orange-600" : "text-navy-500"}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? "text-orange-600" : "text-navy-950"}`}>{value}</p>
    </div>
  );
  if (href) return <Link href={href} className="hover:shadow-md transition-shadow rounded-xl">{content}</Link>;
  return content;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    INTERESTED: "bg-green-100 text-green-700",
    REQUEST_INTERVIEW: "bg-orange-100 text-orange-700",
    NOT_INTERESTED: "bg-red-100 text-red-700",
    NOT_REVIEWED: "bg-navy-100 text-navy-500",
  };
  const labels: Record<string, string> = {
    INTERESTED: "Interested",
    REQUEST_INTERVIEW: "Interview",
    NOT_INTERESTED: "Not Interested",
    NOT_REVIEWED: "Pending",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.NOT_REVIEWED}`}>
      {labels[status] || status}
    </span>
  );
}
