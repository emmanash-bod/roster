"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function CandidateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [teamTailorId, setTeamTailorId] = useState<string | null>(null);
  const [resyncing, setResyncing] = useState(false);

  useEffect(() => {
    fetch(`/api/candidates/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setFirstName(data.firstName);
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setSummary(data.summary || "");
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setExperience(Array.isArray(data.experience) ? data.experience : []);
        setEducation(Array.isArray(data.education) ? data.education : []);
        setLinkedinUrl(data.linkedinUrl || "");
        setPictureUrl(data.pictureUrl || "");
        setTeamTailorId(data.teamTailorId);
        setLoading(false);
      });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const res = await fetch(`/api/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName, lastName, email, phone, summary,
        skills, experience, education, linkedinUrl, pictureUrl,
      }),
    });

    if (res.ok) setMessage("Saved successfully");
    else setMessage("Save failed");
    setSaving(false);
  }

  async function handleResync() {
    if (!teamTailorId) return;
    setResyncing(true);

    const syncRes = await fetch("/api/teamtailor/sync");
    if (syncRes.ok) {
      const syncData = await syncRes.json();
      const ttCandidate = syncData.candidates.find((c: any) => c.teamTailorId === teamTailorId);

      if (ttCandidate) {
        const importRes = await fetch("/api/teamtailor/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidates: [ttCandidate] }),
        });

        if (importRes.ok) {
          setMessage("Resynced from Team Tailor");
          const refreshRes = await fetch(`/api/candidates/${id}`);
          const data = await refreshRes.json();
          setFirstName(data.firstName);
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          if (!data.summaryIsManual) setSummary(data.summary || "");
          setLinkedinUrl(data.linkedinUrl || "");
          setPictureUrl(data.pictureUrl || "");
        }
      }
    }
    setResyncing(false);
  }

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  function addExperience() {
    setExperience([...experience, { title: "", company: "", startDate: "", endDate: "", description: "" }]);
  }

  function updateExperience(index: number, field: keyof Experience, value: string) {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  }

  function removeExperience(index: number) {
    setExperience(experience.filter((_, i) => i !== index));
  }

  function addEducation() {
    setEducation([...education, { degree: "", school: "", year: "" }]);
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  }

  function removeEducation(index: number) {
    setEducation(education.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-navy-200 border-t-orange-500" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setShowPreview(false)} className="text-sm text-navy-500 hover:text-navy-700 flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to editing
          </button>
          <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full font-semibold">
            Client Preview Mode
          </span>
        </div>
        <CandidatePreview
          firstName={firstName}
          summary={summary}
          skills={skills}
          experience={experience}
          education={education}
          pictureUrl={pictureUrl}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/candidates" className="text-navy-400 hover:text-navy-600 p-1.5 rounded-lg hover:bg-navy-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-3">
            {pictureUrl ? (
              <img src={pictureUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-navy-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-sm font-bold text-navy-600">
                {firstName[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-navy-950 tracking-tight">{firstName} {lastName}</h1>
              <p className="text-navy-500 text-sm mt-0.5">Edit candidate profile</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {teamTailorId && (
            <button
              onClick={handleResync}
              disabled={resyncing}
              className="px-4 py-2.5 border border-navy-200 text-navy-600 hover:bg-navy-50 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              {resyncing ? "Resyncing..." : "Resync from TT"}
            </button>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2.5 border border-navy-200 text-navy-600 hover:bg-navy-50 rounded-xl text-sm font-semibold"
          >
            Preview Client View
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm disabled:opacity-60 shadow-sm shadow-orange-500/20"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 flex items-center gap-2 border ${message.includes("success") || message.includes("Resync") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.includes("success") || message.includes("Resync") ? (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
          )}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-navy-950 mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-orange-500 rounded-full" />
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Last Name <span className="text-navy-400 text-xs font-normal">(hidden from clients)</span></label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-navy-950 mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-navy-700 rounded-full" />
              Summary
            </h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Write a compelling candidate summary..."
              className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50 resize-none leading-relaxed"
            />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-navy-950 mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-navy-700 rounded-full" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-navy-50 text-navy-700 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-navy-100/60">
                  {skill}
                  <button onClick={() => removeSkill(i)} className="text-navy-400 hover:text-red-500 ml-0.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
                className="flex-1 px-4 py-2.5 border border-navy-200 rounded-xl text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50"
              />
              <button onClick={addSkill} className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold">
                Add
              </button>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <div className="w-1 h-5 bg-navy-700 rounded-full" />
                Experience
              </h2>
              <button onClick={addExperience} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                + Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="border border-navy-100/60 rounded-xl p-5 bg-cream-50/30">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Experience {i + 1}</span>
                    <button onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)}
                      placeholder="Job Title" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                    <input type="text" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)}
                      placeholder="Company" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                    <input type="text" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)}
                      placeholder="Start Date" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                    <input type="text" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)}
                      placeholder="End Date (or Present)" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(i, "description", e.target.value)}
                    placeholder="Description..."
                    rows={2}
                    className="w-full mt-3 px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none bg-white"
                  />
                </div>
              ))}
              {experience.length === 0 && (
                <p className="text-navy-400 text-sm py-4 text-center">No experience entries yet</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <div className="w-1 h-5 bg-navy-700 rounded-full" />
                Education
              </h2>
              <button onClick={addEducation} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                + Add Education
              </button>
            </div>
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="border border-navy-100/60 rounded-xl p-5 bg-cream-50/30">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Education {i + 1}</span>
                    <button onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)}
                      placeholder="Degree" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                    <input type="text" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)}
                      placeholder="School" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                    <input type="text" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)}
                      placeholder="Year" className="px-3.5 py-2.5 border border-navy-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <p className="text-navy-400 text-sm py-4 text-center">No education entries yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy-950 mb-4">Profile Photo</h3>
            <div className="flex items-center gap-4">
              {pictureUrl ? (
                <img src={pictureUrl} alt="" className="w-20 h-20 rounded-xl object-cover ring-2 ring-navy-100" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-2xl font-bold text-navy-500">
                  {firstName[0]}
                </div>
              )}
            </div>
            <input
              type="text"
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="Photo URL"
              className="w-full mt-4 px-3.5 py-2.5 border border-navy-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-cream-50/50"
            />
          </div>

          <div className="bg-white rounded-2xl border border-navy-100/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy-950 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-navy-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </h3>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3.5 py-2.5 border border-navy-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-cream-50/50"
            />
          </div>

          {teamTailorId && (
            <div className="bg-navy-50 rounded-2xl p-5 border border-navy-100/60">
              <p className="text-xs text-navy-500 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                <span><span className="font-semibold">Team Tailor ID:</span> {teamTailorId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Client-facing preview component — premium resume format
function CandidatePreview({
  firstName, summary, skills, experience, education, pictureUrl,
}: {
  firstName: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  pictureUrl: string;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-900 rounded-t-2xl p-10 text-white relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="relative flex items-center gap-6">
          {pictureUrl ? (
            <img src={pictureUrl} alt="" className="w-24 h-24 rounded-xl object-cover ring-2 ring-orange-500/50 shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-navy-800 flex items-center justify-center text-3xl font-bold text-orange-400 ring-2 ring-orange-500/50">
              {firstName[0]}
            </div>
          )}
          <div>
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-1">Candidate Profile</p>
            <h1 className="text-3xl font-bold tracking-tight">{firstName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-navy-400 text-xs font-medium">Presented by Blue Orange Digital</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-navy-100/80 shadow-sm">
        <div className="p-10 space-y-10">
          {/* Summary */}
          {summary && (
            <div>
              <h2 className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-3">Summary</h2>
              <p className="text-navy-700 leading-[1.75] text-[15px]">{summary}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-4">Skills &amp; Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="bg-navy-50 text-navy-700 px-4 py-2 rounded-lg text-sm font-medium border border-navy-100/60">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-6">Professional Experience</h2>
              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-orange-500" />
                    {i < experience.length - 1 && (
                      <div className="absolute left-[3px] top-4 bottom-0 w-0.5 bg-orange-200" />
                    )}
                    <h3 className="text-base font-bold text-navy-900">{exp.title}</h3>
                    <p className="text-sm text-navy-600 font-semibold">{exp.company}</p>
                    <p className="text-xs text-navy-400 mt-0.5 font-medium">
                      {exp.startDate} &mdash; {exp.endDate || "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-navy-600 mt-2.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-6">Education</h2>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-500 shrink-0 border border-navy-100/60">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">{edu.degree}</p>
                      <p className="text-sm text-navy-500">{edu.school} &middot; {edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <div className="border-t border-navy-100/60 px-10 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs text-navy-400 font-medium">Presented by <span className="text-navy-600 font-semibold">Blue Orange Digital</span></span>
            </div>
            <span className="text-[10px] text-navy-300 uppercase tracking-widest font-medium">Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}
