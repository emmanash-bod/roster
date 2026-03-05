"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  summary: string;
  skills: string[];
  pictureUrl: string | null;
  teamTailorId: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  _count: { assignments: number; reviews: number };
}

interface TTCandidate {
  teamTailorId: string;
  firstName: string;
  lastName: string;
  email: string;
  pitch: string;
  pictureUrl: string | null;
  imported: boolean;
  rosterId: string | null;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSync, setShowSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [ttCandidates, setTtCandidates] = useState<TTCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const fetchCandidates = useCallback(async () => {
    const res = await fetch("/api/candidates");
    const data = await res.json();
    setCandidates(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage("");
    const res = await fetch("/api/teamtailor/sync");
    if (res.ok) {
      const data = await res.json();
      setTtCandidates(data.candidates);
      setSyncMessage(`Found ${data.total} candidates (${data.newCount} new)`);
    } else {
      const data = await res.json();
      setSyncMessage(data.error || "Sync failed");
    }
    setSyncing(false);
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);

    const toImport = ttCandidates.filter((c) => selected.has(c.teamTailorId));
    const res = await fetch("/api/teamtailor/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates: toImport }),
    });

    if (res.ok) {
      const data = await res.json();
      setSyncMessage(`Imported ${data.imported} candidates`);
      setSelected(new Set());
      setShowSync(false);
      fetchCandidates();
    } else {
      setSyncMessage("Import failed");
    }
    setImporting(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllNew() {
    setSelected(new Set(ttCandidates.filter((c) => !c.imported).map((c) => c.teamTailorId)));
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">Candidates</h1>
          <p className="text-navy-500 text-sm mt-1">{candidates.length} candidates in Roster</p>
        </div>
        <button
          onClick={() => { setShowSync(!showSync); if (!showSync) handleSync(); }}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-sm shadow-orange-500/20 hover:shadow-orange-500/30 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          Sync from Team Tailor
        </button>
      </div>

      {/* Team Tailor Sync Panel */}
      {showSync && (
        <div className="bg-white rounded-2xl border border-navy-100/80 p-6 mb-6 shadow-sm animate-fade-in-scale">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <div className="w-1 h-5 bg-orange-500 rounded-full" />
              Team Tailor Candidates
            </h2>
            <button onClick={() => setShowSync(false)} className="text-navy-400 hover:text-navy-600 p-1 rounded-lg hover:bg-navy-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {syncing ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-200 border-t-orange-500" />
              <span className="ml-3 text-navy-500 text-sm">Syncing from Team Tailor...</span>
            </div>
          ) : (
            <>
              {syncMessage && (
                <p className={`text-sm mb-4 font-medium ${syncMessage.includes("fail") ? "text-red-600" : "text-green-600"}`}>
                  {syncMessage}
                </p>
              )}

              {ttCandidates.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={selectAllNew} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                      Select all new ({ttCandidates.filter((c) => !c.imported).length})
                    </button>
                    {selected.size > 0 && (
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                      >
                        {importing ? "Importing..." : `Import ${selected.size} selected`}
                      </button>
                    )}
                  </div>

                  <div className="border border-navy-100 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-navy-50/80 sticky top-0">
                        <tr>
                          <th className="w-10 px-4 py-3"></th>
                          <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">Name</th>
                          <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">Email</th>
                          <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-50">
                        {ttCandidates.map((c) => (
                          <tr key={c.teamTailorId} className="hover:bg-cream-50/50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selected.has(c.teamTailorId)}
                                onChange={() => toggleSelect(c.teamTailorId)}
                                className="rounded border-navy-300 text-orange-500 focus:ring-orange-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-navy-900 font-medium">
                              {c.firstName} {c.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-navy-500">{c.email}</td>
                            <td className="px-4 py-3">
                              {c.imported ? (
                                <span className="text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full">Imported</span>
                              ) : (
                                <span className="text-[11px] font-semibold bg-navy-50 text-navy-500 border border-navy-200 px-2.5 py-0.5 rounded-full">New</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Candidate List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-200 border-t-orange-500" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-navy-100/80 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-navy-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">No candidates yet</h3>
          <p className="text-navy-400 text-sm">Click &ldquo;Sync from Team Tailor&rdquo; to import candidates</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-navy-100/80 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-navy-50/60 border-b border-navy-100">
              <tr>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-4">Candidate</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-4">Skills</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-4">Companies</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-4">Reviews</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      {c.pictureUrl ? (
                        <img src={c.pictureUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-navy-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-sm font-bold text-navy-600">
                          {c.firstName[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-navy-900 group-hover:text-orange-600 transition-colors">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-navy-400 mt-0.5">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(c.skills as string[]).slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[11px] font-medium bg-navy-50 text-navy-600 px-2.5 py-1 rounded-md">{s}</span>
                      ))}
                      {(c.skills as string[]).length > 3 && (
                        <span className="text-[11px] text-navy-400 font-medium px-1">+{(c.skills as string[]).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-navy-700">{c._count.assignments}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-navy-700">{c._count.reviews}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/candidates/${c.id}`}
                      className="text-sm text-orange-500 hover:text-orange-600 font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
