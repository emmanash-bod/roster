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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-950 tracking-tight">Dashboard</h1>
        <p className="text-navy-500 text-sm mt-1">Overview of candidates, companies, and reviews</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
        <StatCard
          label="Candidates"
          value={candidateCount}
          href="/admin/candidates"
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        />
        <StatCard
          label="Companies"
          value={companyCount}
          href="/admin/companies"
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>}
        />
        <StatCard
          label="Completed Reviews"
          value={reviewCount}
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>}
        />
        <StatCard
          label="Pending Reviews"
          value={pendingReviews}
          accent
          icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-navy-950 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-orange-500 rounded-full" />
            Recent Reviews
          </h2>
          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
              </div>
              <p className="text-navy-400 text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-cream-50/80 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {review.candidate.firstName} <span className="font-normal text-navy-400">for</span> {review.assignment.company.name}
                    </p>
                    <p className="text-xs text-navy-400 mt-0.5">
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
        <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <div className="w-1 h-5 bg-navy-700 rounded-full" />
              Companies
            </h2>
            <Link href="/admin/companies" className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
              View all &rarr;
            </Link>
          </div>
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>
              </div>
              <p className="text-navy-400 text-sm">No companies yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {companies.map((company) => {
                const totalAssignments = company.assignments.length;
                const totalReviews = company.assignments.reduce((acc, a) => acc + a.reviews.length, 0);
                return (
                  <Link
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-cream-50/80 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy-900 group-hover:text-orange-600 transition-colors">{company.name}</p>
                      <p className="text-xs text-navy-400 mt-0.5">
                        {totalAssignments} candidates &middot; {company.reviewers.length} reviewers
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-navy-600 bg-navy-50 px-2.5 py-1 rounded-full">{totalReviews} reviews</span>
                      <svg className="w-4 h-4 text-navy-300 group-hover:text-orange-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
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

function StatCard({ label, value, href, accent, icon }: { label: string; value: number; href?: string; accent?: boolean; icon: React.ReactNode }) {
  const content = (
    <div className={`rounded-2xl border p-6 card-hover ${accent ? "bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/60" : "bg-white border-navy-100/80 shadow-sm"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-orange-500/10 text-orange-600" : "bg-navy-50 text-navy-500"}`}>
          {icon}
        </div>
        {href && (
          <svg className="w-4 h-4 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        )}
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? "text-orange-600" : "text-navy-950"}`}>{value}</p>
      <p className={`text-sm font-medium mt-1 ${accent ? "text-orange-500/80" : "text-navy-400"}`}>{label}</p>
    </div>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    INTERESTED: "bg-green-50 text-green-700 border-green-200",
    REQUEST_INTERVIEW: "bg-orange-50 text-orange-700 border-orange-200",
    NOT_INTERESTED: "bg-red-50 text-red-700 border-red-200",
    NOT_REVIEWED: "bg-navy-50 text-navy-500 border-navy-200",
  };
  const labels: Record<string, string> = {
    INTERESTED: "Interested",
    REQUEST_INTERVIEW: "Interview",
    NOT_INTERESTED: "Not Interested",
    NOT_REVIEWED: "Pending",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[status] || styles.NOT_REVIEWED}`}>
      {labels[status] || status}
    </span>
  );
}
