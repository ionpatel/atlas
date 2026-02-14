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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9C4A29] to-[#7D3B21] flex items-center justify-center shadow-lg shadow-[#9C4A29]/20">
              <span className="text-[#E8E3CC] font-bold text-lg">A</span>
            </div>
            <span className="text-[#2D1810] font-semibold text-xl tracking-tight">
              Atlas Portal
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2D1810]">
              Welcome back
            </h1>
            <p className="text-[#6B5B4F] mt-2">
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
              <label className="block text-sm font-medium text-[#6B5B4F] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7B6F]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl text-[#2D1810] placeholder-[#8B7B6F] focus:outline-none focus:border-[#9C4A29] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B5B4F] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7B6F]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl text-[#2D1810] placeholder-[#8B7B6F] focus:outline-none focus:border-[#9C4A29] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7B6F] hover:text-[#6B5B4F] transition-colors"
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
                  className="w-4 h-4 rounded border-[#DDD7C0] bg-[#F5F2E8] text-[#9C4A29] focus:ring-[#9C4A29] focus:ring-offset-0"
                />
                <span className="text-sm text-[#6B5B4F]">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-[#9C4A29] hover:text-[#7D3B21] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#9C4A29] text-[#E8E3CC] rounded-xl font-semibold hover:bg-[#7D3B21] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-6 p-4 bg-[#F5F2E8]/50 border border-[#DDD7C0]/50 rounded-xl">
            <p className="text-xs text-[#8B7B6F] text-center">
              <strong className="text-[#6B5B4F]">Demo:</strong> Enter any email and password to sign in
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#8B7B6F]">
            Need an account?{" "}
            <span className="text-[#9C4A29]">Contact your vendor</span>
          </p>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#F5F2E8] to-[#E8E3CC] flex-col justify-center px-16 xl:px-24 border-l border-[#DDD7C0]">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 text-[#9C4A29] mb-6">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Secure Customer Portal</span>
          </div>

          <h2 className="text-3xl font-bold text-[#2D1810] mb-4">
            Manage your account in one place
          </h2>
          <p className="text-[#6B5B4F] mb-10">
            Access invoices, track orders, and get support—all from your personalized customer portal.
          </p>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#9C4A29]/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#9C4A29]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D1810]">{feature.title}</h3>
                  <p className="text-sm text-[#6B5B4F] mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center gap-4 pt-8 border-t border-[#DDD7C0]">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9C4A29] to-[#7D3B21] border-2 border-[#E8E3CC] flex items-center justify-center text-xs font-bold text-[#E8E3CC]"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-[#6B5B4F]">
              <strong className="text-[#2D1810]">1,000+</strong> businesses trust Atlas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
