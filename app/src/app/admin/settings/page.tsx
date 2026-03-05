"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [apiRegion, setApiRegion] = useState("eu");
  const [existingConfig, setExistingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/teamtailor/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.configured) {
          setExistingConfig(true);
          setApiKey(data.maskedKey || "");
          setApiRegion(data.region || "eu");
          setLastSync(data.lastSyncAt);
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/teamtailor/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, apiRegion }),
    });

    if (res.ok) {
      setMessage("Team Tailor configuration saved successfully");
      setExistingConfig(true);
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to save configuration");
    }
    setSaving(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-950 tracking-tight">Settings</h1>
        <p className="text-navy-500 text-sm mt-1">Configure integrations and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-navy-100/80 p-8 max-w-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-navy-100/60">
          <div className="w-12 h-12 bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-navy-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-950">Team Tailor Integration</h2>
            <p className="text-sm text-navy-400 mt-0.5">Connect your Team Tailor account to import candidates</p>
          </div>
          {existingConfig && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-600">Connected</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={existingConfig ? "••••••••••••••••" : "Enter your Team Tailor API key"}
              className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50"
              required={!existingConfig}
            />
            <p className="text-xs text-navy-400 mt-2">
              Generate an Admin-scoped API key in Team Tailor: Settings &rarr; Integrations &rarr; API keys
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">
              API Region
            </label>
            <select
              value={apiRegion}
              onChange={(e) => setApiRegion(e.target.value)}
              className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50 appearance-none"
            >
              <option value="eu">EU (Ireland)</option>
              <option value="us">US West (Oregon)</option>
            </select>
          </div>

          {lastSync && (
            <div className="flex items-center gap-2 text-sm text-navy-400 bg-navy-50 rounded-xl px-4 py-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              Last synced: {new Date(lastSync).toLocaleString()}
            </div>
          )}

          {message && (
            <div className={`text-sm rounded-xl px-4 py-3 flex items-center gap-2 ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.includes("success") ? (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
              )}
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-sm shadow-orange-500/20 text-sm"
          >
            {saving ? "Saving..." : existingConfig ? "Update Configuration" : "Save Configuration"}
          </button>
        </form>
      </div>
    </div>
  );
}
