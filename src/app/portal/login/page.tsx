"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  FileText,
  Clock,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate login - in production this would call the API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo: accept any credentials
    if (email && password) {
      // Store session in localStorage for demo
      localStorage.setItem("portal_session", JSON.stringify({
        customerId: "demo-customer",
        email: email,
        name: email.split("@")[0],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }));
      router.push("/portal");
    } else {
      setError("Please enter your email and password");
    }
    
    setIsLoading(false);
  };

  const features = [
    {
      icon: FileText,
      title: "View Invoices",
      description: "Access all your invoices and payment history",
    },
    {
      icon: Clock,
      title: "Order History",
      description: "Track your past orders and deliveries",
    },
    {
      icon: Headphones,
      title: "Support Tickets",
      description: "Submit and track support requests",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CDB49E] to-[#B89B78] flex items-center justify-center shadow-lg shadow-[#CDB49E]/20">
              <span className="text-[#0A0A0A] font-bold text-lg">A</span>
            </div>
            <span className="text-[#FAFAFA] font-semibold text-xl tracking-tight">
              Atlas Portal
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#FAFAFA]">
              Welcome back
            </h1>
            <p className="text-[#FAFAFA] mt-2">
              Sign in to access your customer portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#FAFAFA] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAFA]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0A0A0A] border border-[#262626] rounded-xl text-[#FAFAFA] placeholder-[#555555] focus:outline-none focus:border-[#262626] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#FAFAFA] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAFA]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#0A0A0A] border border-[#262626] rounded-xl text-[#FAFAFA] placeholder-[#555555] focus:outline-none focus:border-[#262626] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] focus:ring-[#CDB49E] focus:ring-offset-0"
                />
                <span className="text-sm text-[#FAFAFA]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#161616] text-[#0A0A0A] rounded-xl font-semibold hover:bg-[#161616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#0A0A0A]/50 border border-[#262626]/50 rounded-xl">
            <p className="text-xs text-[#FAFAFA] text-center">
              <strong className="text-[#FAFAFA]">Demo:</strong> Enter any email and password to sign in
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#FAFAFA]">
            Need an account?{" "}
            <span className="text-[#FAFAFA]">Contact your vendor</span>
          </p>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0A0A0A] to-[#0A0A0A] flex-col justify-center px-16 xl:px-24 border-l border-[#262626]">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 text-[#FAFAFA] mb-6">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Secure Customer Portal</span>
          </div>

          <h2 className="text-3xl font-bold text-[#FAFAFA] mb-4">
            Manage your account in one place
          </h2>
          <p className="text-[#FAFAFA] mb-10">
            Access invoices, track orders, and get support—all from your personalized customer portal.
          </p>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#161616]/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#FAFAFA]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#FAFAFA]">{feature.title}</h3>
                  <p className="text-sm text-[#FAFAFA] mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center gap-4 pt-8 border-t border-[#262626]">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CDB49E] to-[#B89B78] border-2 border-[#262626] flex items-center justify-center text-xs font-bold text-[#0A0A0A]"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#FAFAFA]">
              <strong className="text-[#FAFAFA]">1,000+</strong> businesses trust Atlas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
