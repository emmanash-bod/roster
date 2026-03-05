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
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Roster
            </span>
          </div>
          <p className="text-navy-300 text-sm">
            by <span className="text-orange-400 font-medium">Blue Orange</span> Digital
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-semibold text-navy-950 mb-1">
            Welcome back
          </h1>
          <p className="text-navy-400 text-sm mb-6">
            Sign in to manage candidates and companies
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                placeholder="admin@blueorange.digital"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg text-navy-950 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-navy-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Blue Orange Digital. All rights reserved.
        </p>
      </div>
    </div>
  );
}
