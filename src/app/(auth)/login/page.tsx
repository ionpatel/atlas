"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-[#111827]">Welcome back</h1>
        <p className="text-sm text-[#111827] mt-1.5">
          Sign in to your Atlas account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/5 text-red-400 text-sm rounded-lg px-4 py-3 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#111827]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full h-11 px-4 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-[#111827] text-sm placeholder:text-[#111827]/60 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#E5E7EB]/50 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#111827]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full h-11 px-4 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-[#111827] text-sm placeholder:text-[#111827]/60 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#E5E7EB]/50 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#111827] mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#374151] hover:text-[#111827] font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
