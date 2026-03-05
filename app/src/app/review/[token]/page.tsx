"use client";

import { useState, useEffect, use, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface CandidateReview {
  id: string;
  status: string;
  feedback: string | null;
}

interface Candidate {
  id: string;
  assignmentId: string;
  firstName: string;
  summary: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
  pictureUrl: string | null;
  myReview: CandidateReview | null;
}

interface PortalData {
  authenticated: boolean;
  company: { name: string };
  candidates?: Candidate[];
}

export default function ReviewPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState("all");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"email" | "password">("email");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLink, setMagicLink] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/review/${token}`);
    if (!res.ok) {
      setError("This link is invalid or has been revoked.");
      setLoading(false);
      return;
    }
    const result = await res.json();
    setData(result);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData, sessionStatus]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const res = await fetch("/api/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, companyToken: token }),
    });

    const result = await res.json();
    if (res.ok) {
      setMagicLinkSent(true);
      // Dev mode: show the magic link directly
      if (result.magicLink) setMagicLink(result.magicLink);
    } else {
      setAuthError(result.error || "Failed to send magic link");
    }
    setAuthLoading(false);
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const result = await signIn("reviewer-login", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("Invalid credentials");
      setAuthLoading(false);
    } else {
      window.location.reload();
    }
  }

  async function handleMagicLinkAuth() {
    if (!magicLink) return;
    const urlToken = new URLSearchParams(magicLink.split("?")[1]).get("token");
    if (!urlToken) return;

    const result = await signIn("magic-link", { token: urlToken, redirect: false });
    if (result?.error) {
      setAuthError("Magic link expired or invalid");
    } else {
      window.location.reload();
    }
  }

  // Check URL for magic link token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      signIn("magic-link", { token: urlToken, redirect: false }).then((result) => {
        if (!result?.error) {
          window.location.href = window.location.pathname;
        }
      });
    }
  }, []);

  async function handleSubmitReview(candidateId: string, assignmentId: string, status: string, feedback: string) {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, assignmentId, status, feedback }),
    });

    if (res.ok) {
      fetchData();
      setSelectedCandidate(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link Unavailable</h1>
          <p className="text-navy-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Auth Screen
  if (!data.authenticated) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Roster</span>
            </div>
            <p className="text-navy-300 text-sm">by <span className="text-orange-400">Blue Orange</span> Digital</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-xl font-semibold text-navy-950 mb-1">
              Candidate Review
            </h1>
            <p className="text-navy-400 text-sm mb-6">
              Sign in to review candidates for <span className="font-medium text-navy-700">{data.company.name}</span>
            </p>

            {magicLinkSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <p className="text-navy-700 font-medium mb-1">Check your email</p>
                <p className="text-navy-400 text-sm mb-4">We sent a login link to {email}</p>
                {/* Dev mode: show magic link button */}
                {magicLink && (
                  <button
                    onClick={handleMagicLinkAuth}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium underline"
                  >
                    [Dev] Click here to authenticate
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setAuthMode("email")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${authMode === "email" ? "bg-navy-900 text-white" : "text-navy-500 hover:bg-navy-50"}`}
                  >
                    Magic Link
                  </button>
                  <button
                    onClick={() => setAuthMode("password")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${authMode === "password" ? "bg-navy-900 text-white" : "text-navy-500 hover:bg-navy-50"}`}
                  >
                    Password
                  </button>
                </div>

                <form onSubmit={authMode === "email" ? handleMagicLink : handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                      placeholder="your@email.com" />
                  </div>

                  {authMode === "password" && (
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
                    </div>
                  )}

                  {authError && (
                    <div className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2.5">{authError}</div>
                  )}

                  <button type="submit" disabled={authLoading}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors">
                    {authLoading ? "..." : authMode === "email" ? "Send Magic Link" : "Sign in"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Review Portal
  const candidates = data.candidates || [];
  const filteredCandidates = candidates.filter((c) => {
    if (filter === "all") return true;
    if (filter === "not_reviewed") return !c.myReview || c.myReview.status === "NOT_REVIEWED";
    if (filter === "reviewed") return c.myReview && c.myReview.status !== "NOT_REVIEWED";
    return c.myReview?.status === filter;
  });

  if (selectedCandidate) {
    return (
      <ReviewCandidateView
        candidate={selectedCandidate}
        companyName={data.company.name}
        onBack={() => { setSelectedCandidate(null); fetchData(); }}
        onSubmit={handleSubmitReview}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-navy-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-bold">Roster</span>
              <span className="text-navy-400 text-sm ml-2">· {data.company.name}</span>
            </div>
          </div>
          <div className="text-sm text-navy-300">
            {candidates.filter((c) => c.myReview && c.myReview.status !== "NOT_REVIEWED").length} of {candidates.length} reviewed
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy-950">Candidates</h1>
          <div className="flex gap-2">
            {["all", "not_reviewed", "INTERESTED", "REQUEST_INTERVIEW", "NOT_INTERESTED"].map((f) => {
              const labels: Record<string, string> = {
                all: "All",
                not_reviewed: "To Review",
                INTERESTED: "Interested",
                REQUEST_INTERVIEW: "Interview",
                NOT_INTERESTED: "Not Interested",
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-navy-900 text-white" : "text-navy-500 hover:bg-navy-100"}`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className="bg-white rounded-xl border border-navy-100 p-5 text-left hover:shadow-lg hover:border-orange-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                {candidate.pictureUrl ? (
                  <img src={candidate.pictureUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-lg font-semibold text-navy-500">
                    {candidate.firstName[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-navy-900 group-hover:text-orange-600 transition-colors">
                    {candidate.firstName}
                  </h3>
                  {candidate.myReview && candidate.myReview.status !== "NOT_REVIEWED" && (
                    <ReviewBadge status={candidate.myReview.status} />
                  )}
                </div>
              </div>

              {candidate.summary && (
                <p className="text-sm text-navy-500 mb-3 line-clamp-2">{candidate.summary}</p>
              )}

              {candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(candidate.skills as string[]).slice(0, 4).map((skill, i) => (
                    <span key={i} className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full">{skill}</span>
                  ))}
                  {(candidate.skills as string[]).length > 4 && (
                    <span className="text-xs text-navy-400">+{(candidate.skills as string[]).length - 4}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCandidateView({
  candidate,
  companyName,
  onBack,
  onSubmit,
}: {
  candidate: Candidate;
  companyName: string;
  onBack: () => void;
  onSubmit: (candidateId: string, assignmentId: string, status: string, feedback: string) => void;
}) {
  const [status, setStatus] = useState(candidate.myReview?.status || "");
  const [feedback, setFeedback] = useState(candidate.myReview?.feedback || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!status) return;
    setSubmitting(true);
    await onSubmit(candidate.id, candidate.assignmentId, status, feedback);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-navy-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <button onClick={onBack} className="text-navy-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold">Roster</span>
            <span className="text-navy-400 text-sm">· {companyName}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile */}
        <div className="bg-navy-950 rounded-t-2xl p-8 text-white">
          <div className="flex items-center gap-5">
            {candidate.pictureUrl ? (
              <img src={candidate.pictureUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center text-2xl font-bold text-orange-400 border-2 border-orange-500">
                {candidate.firstName[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{candidate.firstName}</h1>
              <p className="text-navy-300 text-sm mt-1">Candidate Profile</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl border border-t-0 border-navy-100 p-8 space-y-8">
          {candidate.summary && (
            <div>
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Summary</h2>
              <p className="text-navy-700 leading-relaxed">{candidate.summary}</p>
            </div>
          )}

          {candidate.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(candidate.skills as string[]).map((skill, i) => (
                  <span key={i} className="bg-navy-50 text-navy-700 px-3 py-1.5 rounded-lg text-sm font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {candidate.experience.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-4">Experience</h2>
              <div className="space-y-5">
                {(candidate.experience as Experience[]).map((exp, i) => (
                  <div key={i} className="border-l-2 border-orange-200 pl-4">
                    <h3 className="font-semibold text-navy-900">{exp.title}</h3>
                    <p className="text-sm text-navy-600 font-medium">{exp.company}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{exp.startDate} — {exp.endDate || "Present"}</p>
                    {exp.description && <p className="text-sm text-navy-600 mt-2 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidate.education.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-4">Education</h2>
              <div className="space-y-3">
                {(candidate.education as Education[]).map((edu, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-navy-900">{edu.degree}</p>
                      <p className="text-sm text-navy-500">{edu.school} · {edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review Panel */}
        <div className="bg-white rounded-2xl border border-navy-100 p-6 mt-6">
          <h2 className="text-lg font-semibold text-navy-950 mb-4">Your Review</h2>

          <div className="flex gap-3 mb-4">
            {[
              { value: "INTERESTED", label: "Interested", color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" },
              { value: "REQUEST_INTERVIEW", label: "Request Interview", color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" },
              { value: "NOT_INTERESTED", label: "Not Interested", color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setStatus(option.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  status === option.value
                    ? `${option.color} ring-2 ring-offset-2 ring-navy-200`
                    : "border-navy-100 text-navy-500 hover:border-navy-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {(status === "NOT_INTERESTED" || feedback) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-navy-700 mb-1.5">
                {status === "NOT_INTERESTED" ? "Reason (optional but appreciated)" : "Comments"}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none"
                placeholder="Share your thoughts..."
              />
            </div>
          )}

          {status && status !== "NOT_INTERESTED" && !feedback && (
            <button
              onClick={() => setFeedback(" ")}
              className="text-sm text-navy-400 hover:text-navy-600 mb-4"
            >
              + Add comments
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!status || submitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium rounded-xl transition-colors"
          >
            {submitting ? "Submitting..." : candidate.myReview ? "Update Review" : "Submit Review"}
          </button>
        </div>

        {/* Branding */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs text-navy-400">Powered by Blue Orange Digital</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    INTERESTED: "bg-green-100 text-green-700",
    REQUEST_INTERVIEW: "bg-orange-100 text-orange-700",
    NOT_INTERESTED: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    INTERESTED: "Interested",
    REQUEST_INTERVIEW: "Interview",
    NOT_INTERESTED: "Not Interested",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
