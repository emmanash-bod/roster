"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("admin-login", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg relative overflow-hidden">
      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white tracking-tight block leading-tight">
                Roster
              </span>
              <span className="text-navy-400 text-xs font-medium tracking-wide uppercase">
                by Blue Orange Digital
              </span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-navy-950/30 p-8 border border-white/10">
          <h1 className="text-xl font-bold text-navy-950 mb-1">
            Welcome back
          </h1>
          <p className="text-navy-400 text-sm mb-8">
            Sign in to manage candidates and companies
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50"
                placeholder="admin@blueorange.digital"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-navy-200 rounded-xl text-navy-950 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-cream-50/50"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:hover:from-orange-500 disabled:hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-navy-500 text-xs mt-8 tracking-wide">
          &copy; {new Date().getFullYear()} Blue Orange Digital. All rights reserved.
        </p>
      </div>
    </div>
  );
}
