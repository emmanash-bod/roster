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

    // First sync to get latest data
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
          // Refresh the data
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setShowPreview(false)} className="text-sm text-navy-500 hover:text-navy-700 flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to editing
          </button>
          <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/candidates" className="text-navy-400 hover:text-navy-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-950">{firstName} {lastName}</h1>
            <p className="text-navy-500 text-sm mt-0.5">Edit candidate profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {teamTailorId && (
            <button
              onClick={handleResync}
              disabled={resyncing}
              className="px-4 py-2 border border-navy-200 text-navy-600 hover:bg-navy-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {resyncing ? "Resyncing..." : "Resync from TT"}
            </button>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-navy-200 text-navy-600 hover:bg-navy-50 rounded-lg text-sm font-medium transition-colors"
          >
            Preview Client View
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 text-sm rounded-lg px-4 py-2.5 ${message.includes("success") || message.includes("Resync") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-semibold text-navy-950 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Last Name <span className="text-navy-400 text-xs">(hidden from clients)</span></label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-semibold text-navy-950 mb-4">Summary</h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Write a compelling candidate summary..."
              className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-semibold text-navy-950 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-navy-100 text-navy-700 px-3 py-1 rounded-full text-sm">
                  {skill}
                  <button onClick={() => removeSkill(i)} className="text-navy-400 hover:text-navy-600 ml-1">
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
                className="flex-1 px-4 py-2 border border-navy-200 rounded-lg text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
              <button onClick={addSkill} className="px-4 py-2 bg-navy-100 text-navy-600 rounded-lg text-sm font-medium hover:bg-navy-200 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-950">Experience</h2>
              <button onClick={addExperience} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                + Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="border border-navy-100 rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-navy-500">Experience {i + 1}</span>
                    <button onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)}
                      placeholder="Job Title" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    <input type="text" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)}
                      placeholder="Company" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    <input type="text" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)}
                      placeholder="Start Date" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    <input type="text" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)}
                      placeholder="End Date (or Present)" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(i, "description", e.target.value)}
                    placeholder="Description..."
                    rows={2}
                    className="w-full mt-3 px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none"
                  />
                </div>
              ))}
              {experience.length === 0 && (
                <p className="text-navy-400 text-sm">No experience entries yet</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-950">Education</h2>
              <button onClick={addEducation} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                + Add Education
              </button>
            </div>
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="border border-navy-100 rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-navy-500">Education {i + 1}</span>
                    <button onClick={() => removeEducation(i)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)}
                      placeholder="Degree" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    <input type="text" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)}
                      placeholder="School" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    <input type="text" value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)}
                      placeholder="Year" className="px-3 py-2 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <p className="text-navy-400 text-sm">No education entries yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <h3 className="text-sm font-semibold text-navy-950 mb-3">Profile Photo</h3>
            <div className="flex items-center gap-3">
              {pictureUrl ? (
                <img src={pictureUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center text-xl font-medium text-navy-500">
                  {firstName[0]}
                </div>
              )}
            </div>
            <input
              type="text"
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="Photo URL"
              className="w-full mt-3 px-3 py-2 border border-navy-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <h3 className="text-sm font-semibold text-navy-950 mb-3">LinkedIn</h3>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2 border border-navy-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
          </div>

          {teamTailorId && (
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-xs text-navy-500">
                <span className="font-medium">Team Tailor ID:</span> {teamTailorId}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Client-facing preview component
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
      <div className="bg-navy-950 rounded-t-2xl p-8 text-white">
        <div className="flex items-center gap-5">
          {pictureUrl ? (
            <img src={pictureUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center text-2xl font-bold text-orange-400 border-2 border-orange-500">
              {firstName[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{firstName}</h1>
            <p className="text-navy-300 text-sm mt-1">Candidate Profile</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-navy-100 p-8 space-y-8">
        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Summary</h2>
            <p className="text-navy-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="bg-navy-50 text-navy-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-4">Experience</h2>
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-orange-200 pl-4">
                  <h3 className="font-semibold text-navy-900">{exp.title}</h3>
                  <p className="text-sm text-navy-600 font-medium">{exp.company}</p>
                  <p className="text-xs text-navy-400 mt-0.5">
                    {exp.startDate} — {exp.endDate || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-navy-600 mt-2 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-4">Education</h2>
            <div className="space-y-3">
              {education.map((edu, i) => (
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

        {/* Blue Orange Branding */}
        <div className="border-t border-navy-100 pt-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs text-navy-400">Presented by Blue Orange Digital</span>
          </div>
        </div>
      </div>
    </div>
  );
}
