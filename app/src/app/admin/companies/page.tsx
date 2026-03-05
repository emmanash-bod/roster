"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  shareToken: string;
  isActive: boolean;
  _count: { assignments: number; reviewers: number };
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCompanies = useCallback(async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactName, contactEmail, notes }),
    });
    if (res.ok) {
      setShowCreate(false);
      setName("");
      setContactName("");
      setContactEmail("");
      setNotes("");
      fetchCompanies();
    }
    setCreating(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">Companies</h1>
          <p className="text-navy-500 text-sm mt-1">{companies.length} client companies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-sm shadow-orange-500/20 hover:shadow-orange-500/30 text-sm"
        >
          + New Company
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-navy-950/20 border border-navy-100/50 animate-fade-in-scale">
            <h2 className="text-lg font-bold text-navy-950 mb-6">Create Company</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Company Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Contact Name</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Contact Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 text-navy-600 hover:bg-navy-50 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 shadow-sm shadow-orange-500/20">
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-200 border-t-orange-500" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-navy-100/80 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">No companies yet</h3>
          <p className="text-navy-400 text-sm">Create a company to start assigning candidates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/admin/companies/${company.id}`}
              className="bg-white rounded-2xl border border-navy-100/80 p-6 card-hover group shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-sm font-bold text-navy-600 shrink-0">
                    {company.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 group-hover:text-orange-600 transition-colors">
                      {company.name}
                    </h3>
                    {company.contactName && (
                      <p className="text-xs text-navy-400 mt-0.5">{company.contactName}</p>
                    )}
                  </div>
                </div>
                {!company.isActive && (
                  <span className="text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </div>
              {company.contactEmail && (
                <p className="text-xs text-navy-400 mb-4 truncate">{company.contactEmail}</p>
              )}
              <div className="flex items-center gap-4 pt-4 border-t border-navy-100/60">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-navy-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <span className="text-xs text-navy-500">
                    <span className="font-bold text-navy-700">{company._count.assignments}</span> candidates
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-navy-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span className="text-xs text-navy-500">
                    <span className="font-bold text-navy-700">{company._count.reviewers}</span> reviewers
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
