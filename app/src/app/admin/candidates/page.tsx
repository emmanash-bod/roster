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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Candidates</h1>
          <p className="text-navy-500 text-sm mt-1">{candidates.length} candidates in Roster</p>
        </div>
        <button
          onClick={() => { setShowSync(!showSync); if (!showSync) handleSync(); }}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
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
        <div className="bg-white rounded-xl border border-navy-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-950">Team Tailor Candidates</h2>
            <button onClick={() => setShowSync(false)} className="text-navy-400 hover:text-navy-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {syncing ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <span className="ml-3 text-navy-500">Syncing from Team Tailor...</span>
            </div>
          ) : (
            <>
              {syncMessage && (
                <p className={`text-sm mb-4 ${syncMessage.includes("fail") ? "text-red-600" : "text-green-600"}`}>
                  {syncMessage}
                </p>
              )}

              {ttCandidates.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={selectAllNew} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                      Select all new ({ttCandidates.filter((c) => !c.imported).length})
                    </button>
                    {selected.size > 0 && (
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                      >
                        {importing ? "Importing..." : `Import ${selected.size} selected`}
                      </button>
                    )}
                  </div>

                  <div className="border border-navy-100 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-navy-50 sticky top-0">
                        <tr>
                          <th className="w-10 px-3 py-2.5"></th>
                          <th className="text-left text-xs font-medium text-navy-500 uppercase px-3 py-2.5">Name</th>
                          <th className="text-left text-xs font-medium text-navy-500 uppercase px-3 py-2.5">Email</th>
                          <th className="text-left text-xs font-medium text-navy-500 uppercase px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-50">
                        {ttCandidates.map((c) => (
                          <tr key={c.teamTailorId} className="hover:bg-navy-50/50">
                            <td className="px-3 py-2.5">
                              <input
                                type="checkbox"
                                checked={selected.has(c.teamTailorId)}
                                onChange={() => toggleSelect(c.teamTailorId)}
                                className="rounded border-navy-300 text-orange-500 focus:ring-orange-500"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-sm text-navy-900 font-medium">
                              {c.firstName} {c.lastName}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-navy-500">{c.email}</td>
                            <td className="px-3 py-2.5">
                              {c.imported ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Imported</span>
                              ) : (
                                <span className="text-xs bg-navy-100 text-navy-500 px-2 py-0.5 rounded-full">New</span>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <svg className="w-12 h-12 text-navy-200 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 className="text-lg font-semibold text-navy-900 mb-1">No candidates yet</h3>
          <p className="text-navy-400 text-sm">Click &ldquo;Sync from Team Tailor&rdquo; to import candidates</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-navy-50">
              <tr>
                <th className="text-left text-xs font-medium text-navy-500 uppercase px-5 py-3">Candidate</th>
                <th className="text-left text-xs font-medium text-navy-500 uppercase px-5 py-3">Skills</th>
                <th className="text-left text-xs font-medium text-navy-500 uppercase px-5 py-3">Companies</th>
                <th className="text-left text-xs font-medium text-navy-500 uppercase px-5 py-3">Reviews</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {c.pictureUrl ? (
                        <img src={c.pictureUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-sm font-medium text-navy-500">
                          {c.firstName[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-navy-900">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-navy-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(c.skills as string[]).slice(0, 3).map((s, i) => (
                        <span key={i} className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {(c.skills as string[]).length > 3 && (
                        <span className="text-xs text-navy-400">+{(c.skills as string[]).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-600">{c._count.assignments}</td>
                  <td className="px-5 py-4 text-sm text-navy-600">{c._count.reviews}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/candidates/${c.id}`}
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Edit
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
