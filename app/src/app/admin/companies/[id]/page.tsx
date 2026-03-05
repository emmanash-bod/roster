"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";

interface Review {
  id: string;
  status: string;
  feedback: string | null;
  reviewer: { name: string | null; email: string; id: string };
  updatedAt: string;
}

interface Assignment {
  id: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string | null;
    summary: string | null;
    skills: string[];
    pictureUrl: string | null;
  };
  reviews: Review[];
}

interface Reviewer {
  id: string;
  name: string | null;
  email: string;
}

interface Company {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  shareToken: string;
  isActive: boolean;
  assignments: Assignment[];
  reviewers: Reviewer[];
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCandidates, setShowAddCandidates] = useState(false);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [addingReviewer, setAddingReviewer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchCompany = useCallback(async () => {
    const res = await fetch(`/api/companies/${id}`);
    const data = await res.json();
    setCompany(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  async function handleAssignCandidates() {
    const candidateIds = Array.from(selectedCandidates);
    await fetch(`/api/companies/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateIds }),
    });
    setShowAddCandidates(false);
    setSelectedCandidates(new Set());
    fetchCompany();
  }

  async function handleRemoveCandidate(candidateId: string) {
    await fetch(`/api/companies/${id}/assign`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    });
    fetchCompany();
  }

  async function handleAddReviewer(e: React.FormEvent) {
    e.preventDefault();
    setAddingReviewer(true);
    await fetch(`/api/companies/${id}/reviewers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: reviewerEmail, name: reviewerName }),
    });
    setReviewerEmail("");
    setReviewerName("");
    setAddingReviewer(false);
    fetchCompany();
  }

  async function handleRemoveReviewer(reviewerId: string) {
    await fetch(`/api/companies/${id}/reviewers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId }),
    });
    fetchCompany();
  }

  async function handleRegenerateLink() {
    const res = await fetch(`/api/companies/${id}/regenerate-link`, { method: "POST" });
    if (res.ok) fetchCompany();
  }

  async function handleToggleActive() {
    if (!company) return;
    await fetch(`/api/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !company.isActive }),
    });
    fetchCompany();
  }

  function copyLink() {
    if (!company) return;
    const link = `${window.location.origin}/review/${company.shareToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function openCandidatePicker() {
    const res = await fetch("/api/candidates");
    const data = await res.json();
    setAllCandidates(data);
    setShowAddCandidates(true);
  }

  function getOverallStatus(reviews: Review[]) {
    if (reviews.length === 0) return "NOT_REVIEWED";
    const statuses = reviews.map((r) => r.status);
    if (statuses.includes("REQUEST_INTERVIEW")) return "REQUEST_INTERVIEW";
    if (statuses.includes("INTERESTED")) return "INTERESTED";
    if (statuses.includes("NOT_INTERESTED")) return "NOT_INTERESTED";
    return "NOT_REVIEWED";
  }

  const filteredAssignments = company?.assignments.filter((a) => {
    if (statusFilter === "all") return true;
    return getOverallStatus(a.reviews) === statusFilter;
  }) ?? [];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-200 border-t-orange-500" /></div>;
  }

  if (!company) return <p className="text-red-600">Company not found</p>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/companies" className="text-navy-400 hover:text-navy-600 p-1.5 rounded-lg hover:bg-navy-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-sm font-bold text-navy-600 shrink-0">
            {company.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">{company.name}</h1>
            {company.contactName && <p className="text-navy-500 text-sm mt-0.5">{company.contactName} &middot; {company.contactEmail}</p>}
          </div>
        </div>
        <button
          onClick={handleToggleActive}
          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${company.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}
        >
          {company.isActive ? "Active" : "Inactive"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share Link */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-navy-950 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-navy-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              Client Review Link
            </h2>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-navy-50 px-4 py-2.5 rounded-xl text-xs text-navy-600 overflow-x-auto font-mono border border-navy-100/60">
                {typeof window !== "undefined" ? `${window.location.origin}/review/${company.shareToken}` : `/review/${company.shareToken}`}
              </code>
              <button onClick={copyLink}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl shrink-0 transition-all ${copied ? "bg-green-500 text-white" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm shadow-orange-500/20"}`}>
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={handleRegenerateLink}
                className="px-4 py-2.5 border border-navy-200 text-navy-600 text-xs font-semibold rounded-xl hover:bg-navy-50 shrink-0">
                Regenerate
              </button>
            </div>
          </div>

          {/* Assigned Candidates */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                Candidates ({company.assignments.length})
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-navy-200 rounded-lg px-3 py-2 text-navy-600 focus:outline-none bg-cream-50/50 font-medium"
                >
                  <option value="all">All</option>
                  <option value="NOT_REVIEWED">Not Reviewed</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="REQUEST_INTERVIEW">Interview Requested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
                <button onClick={openCandidatePicker}
                  className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                  + Assign
                </button>
              </div>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                </div>
                <p className="text-navy-400 text-sm">No candidates assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAssignments.map((a) => (
                  <div key={a.id} className="border border-navy-100/60 rounded-xl p-4 hover:border-navy-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {a.candidate.pictureUrl ? (
                          <img src={a.candidate.pictureUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-navy-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-sm font-bold text-navy-600">
                            {a.candidate.firstName[0]}
                          </div>
                        )}
                        <div>
                          <Link href={`/admin/candidates/${a.candidate.id}`} className="text-sm font-bold text-navy-900 hover:text-orange-600 transition-colors">
                            {a.candidate.firstName} {a.candidate.lastName}
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={getOverallStatus(a.reviews)} />
                        <button onClick={() => handleRemoveCandidate(a.candidate.id)} className="text-navy-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Reviews per reviewer */}
                    {a.reviews.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-navy-50 space-y-2">
                        {a.reviews.map((review) => (
                          <div key={review.id} className="flex items-center justify-between text-xs">
                            <span className="text-navy-500 font-medium">{review.reviewer.name || review.reviewer.email}</span>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={review.status} />
                              {review.feedback && (
                                <span className="text-navy-400 max-w-48 truncate italic" title={review.feedback}>
                                  &ldquo;{review.feedback}&rdquo;
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {company.reviewers
                          .filter((r) => !a.reviews.some((rev) => rev.reviewer.id === r.id))
                          .map((r) => (
                            <div key={r.id} className="flex items-center justify-between text-xs">
                              <span className="text-navy-400">{r.name || r.email}</span>
                              <span className="text-navy-300 italic">Not reviewed</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Reviewers */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-navy-950 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-navy-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Reviewers ({company.reviewers.length})
            </h2>
            <div className="space-y-2 mb-4">
              {company.reviewers.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-cream-50">
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{r.name || r.email}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{r.email}</p>
                  </div>
                  <button onClick={() => handleRemoveReviewer(r.id)} className="text-navy-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {company.reviewers.length === 0 && (
                <p className="text-navy-400 text-xs py-2">No reviewers added</p>
              )}
            </div>

            <form onSubmit={handleAddReviewer} className="space-y-2.5 pt-4 border-t border-navy-100/60">
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Name"
                className="w-full px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50"
              />
              <input
                type="email"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50"
              />
              <button type="submit" disabled={addingReviewer}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
                {addingReviewer ? "Adding..." : "Add Reviewer"}
              </button>
            </form>
          </div>

          {company.notes && (
            <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-navy-950 mb-2">Notes</h3>
              <p className="text-sm text-navy-500 leading-relaxed">{company.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Picker Modal */}
      {showAddCandidates && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-navy-950/20 border border-navy-100/50 max-h-[80vh] flex flex-col animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-950">Assign Candidates</h2>
              <button onClick={() => setShowAddCandidates(false)} className="text-navy-400 hover:text-navy-600 p-1 rounded-lg hover:bg-navy-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {allCandidates.map((c) => {
                const alreadyAssigned = company.assignments.some((a) => a.candidate.id === c.id);
                return (
                  <label key={c.id} className={`flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-cream-50 ${alreadyAssigned ? "opacity-50" : ""}`}>
                    <input
                      type="checkbox"
                      disabled={alreadyAssigned}
                      checked={selectedCandidates.has(c.id) || alreadyAssigned}
                      onChange={() => {
                        if (alreadyAssigned) return;
                        const next = new Set(selectedCandidates);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        setSelectedCandidates(next);
                      }}
                      className="rounded border-navy-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-navy-900">{c.firstName} {c.lastName}</span>
                    {alreadyAssigned && <span className="text-xs text-navy-400">(already assigned)</span>}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-navy-100 mt-4">
              <button onClick={() => setShowAddCandidates(false)}
                className="px-5 py-2.5 text-navy-600 hover:bg-navy-50 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={handleAssignCandidates} disabled={selectedCandidates.size === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 shadow-sm shadow-orange-500/20">
                Assign {selectedCandidates.size > 0 ? `(${selectedCandidates.size})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status] || styles.NOT_REVIEWED}`}>
      {labels[status] || status}
    </span>
  );
}
