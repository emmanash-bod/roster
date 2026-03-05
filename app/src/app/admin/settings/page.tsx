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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-950">Settings</h1>
        <p className="text-navy-500 text-sm mt-1">Configure integrations and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-navy-100 p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-navy-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy-950">Team Tailor Integration</h2>
            <p className="text-sm text-navy-400">Connect your Team Tailor account to import candidates</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={existingConfig ? "••••••••••••••••" : "Enter your Team Tailor API key"}
              className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
              required={!existingConfig}
            />
            <p className="text-xs text-navy-400 mt-1">
              Generate an Admin-scoped API key in Team Tailor: Settings → Integrations → API keys
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              API Region
            </label>
            <select
              value={apiRegion}
              onChange={(e) => setApiRegion(e.target.value)}
              className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors bg-white"
            >
              <option value="eu">EU (Ireland)</option>
              <option value="us">US West (Oregon)</option>
            </select>
          </div>

          {lastSync && (
            <p className="text-sm text-navy-400">
              Last synced: {new Date(lastSync).toLocaleString()}
            </p>
          )}

          {message && (
            <div className={`text-sm rounded-lg px-4 py-2.5 ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {saving ? "Saving..." : existingConfig ? "Update Configuration" : "Save Configuration"}
          </button>
        </form>
      </div>
    </div>
  );
}
