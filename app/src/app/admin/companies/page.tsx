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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Companies</h1>
          <p className="text-navy-500 text-sm mt-1">{companies.length} client companies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
        >
          + New Company
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-navy-950 mb-4">Create Company</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Company Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Contact Name</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Contact Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-navy-600 hover:bg-navy-50 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <svg className="w-12 h-12 text-navy-200 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
          </svg>
          <h3 className="text-lg font-semibold text-navy-900 mb-1">No companies yet</h3>
          <p className="text-navy-400 text-sm">Create a company to start assigning candidates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/admin/companies/${company.id}`}
              className="bg-white rounded-xl border border-navy-100 p-5 hover:shadow-md hover:border-orange-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-navy-950 group-hover:text-orange-600 transition-colors">
                  {company.name}
                </h3>
                {!company.isActive && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </div>
              {company.contactName && (
                <p className="text-sm text-navy-500 mb-1">{company.contactName}</p>
              )}
              {company.contactEmail && (
                <p className="text-xs text-navy-400 mb-3">{company.contactEmail}</p>
              )}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-navy-50">
                <span className="text-xs text-navy-400">
                  <span className="font-semibold text-navy-600">{company._count.assignments}</span> candidates
                </span>
                <span className="text-xs text-navy-400">
                  <span className="font-semibold text-navy-600">{company._count.reviewers}</span> reviewers
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
