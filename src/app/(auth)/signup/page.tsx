"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password, fullName, orgName);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-[#FAFAFA]">Create your account</h1>
        <p className="text-sm text-[#FAFAFA] mt-1.5">
          Get started with Atlas for your business
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
            htmlFor="fullName"
            className="block text-sm font-medium text-[#FAFAFA]"
          >
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full h-11 px-4 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] text-sm placeholder:text-[#FAFAFA]/60 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#FAFAFA]"
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
            className="w-full h-11 px-4 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] text-sm placeholder:text-[#FAFAFA]/60 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#FAFAFA]"
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
            minLength={6}
            className="w-full h-11 px-4 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] text-sm placeholder:text-[#FAFAFA]/60 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="orgName"
            className="block text-sm font-medium text-[#FAFAFA]"
          >
            Organization name
          </label>
          <input
            id="orgName"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Inc."
            required
            className="w-full h-11 px-4 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] text-sm placeholder:text-[#FAFAFA]/60 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
          />
          <p className="text-[11px] text-[#FAFAFA]/70">
            You&apos;ll be the owner of this organization
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#FAFAFA] mt-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#ccc] hover:text-[#FAFAFA] font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
