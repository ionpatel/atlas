"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Package,
  FileText,
  Users,
  Sparkles,
  BarChart3,
  UserCog,
  Check,
  X,
  ArrowRight,
  Star,
  Menu,
  XIcon,
  Send,
  ChevronRight,
  MapPin,
} from "lucide-react";

/* ─────────────────────── palette tokens ─────────────────────── */
// bg: #111111 | card: #1a1a1a | elevated: #222222
// border: #2a2a2a | muted text: #888888 | dim: #555555
// accent: #CDB49E | accent-hover: #d4c0ad | accent-muted: #3a3028
// warm white: #f5f0eb
// green: #34d399 | red: #f87171 | blue: #60a5fa | violet: #a78bfa | amber: #fbbf24

/* ─────────────────────── scroll reveal ─────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────── ANIMATED DASHBOARD MOCKUP ─────────────────────── */

const MOCKUP_KEYFRAMES = `
@keyframes countUp {
  from { --num: 0; }
  to { --num: var(--target); }
}
@keyframes barGrow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@keyframes drawLine {
  from { stroke-dashoffset: 300; }
  to { stroke-dashoffset: 0; }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes popIn {
  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
  70% { transform: scale(1.05) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes toastSlide {
  0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes donutFill {
  from { stroke-dashoffset: var(--circumference); }
  to { stroke-dashoffset: var(--final-offset); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(205,180,158,0.15); }
  50% { box-shadow: 0 0 20px 4px rgba(205,180,158,0.1); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes typing {
  0% { width: 0; }
  100% { width: 100%; }
}
@keyframes blink {
  0%, 50% { border-right-color: #CDB49E; }
  51%, 100% { border-right-color: transparent; }
}
`;

function AnimatedStatCard({
  label,
  value,
  prefix,
  suffix,
  color,
  delay,
  sparkData,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  delay: number;
  sparkData: number[];
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const { ref, visible } = useInView(0.3);

  useEffect(() => {
    if (!visible || started) return;
    const timeout = setTimeout(() => {
      setStarted(true);
      const duration = 1800;
      const steps = 60;
      const stepTime = duration / steps;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(value * eased));
        if (step >= steps) clearInterval(interval);
      }, stepTime);
    }, delay);
    return () => clearTimeout(timeout);
  }, [visible, started, value, delay]);

  const formatNum = (n: number) => {
    if (prefix === "$") {
      return "$" + n.toLocaleString();
    }
    return n.toLocaleString() + (suffix || "");
  };

  // Mini sparkline path
  const sparkW = 60;
  const sparkH = 20;
  const max = Math.max(...sparkData);
  const min = Math.min(...sparkData);
  const range = max - min || 1;
  const points = sparkData
    .map((v, i) => {
      const x = (i / (sparkData.length - 1)) * sparkW;
      const y = sparkH - ((v - min) / range) * (sparkH - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      ref={ref}
      className="p-3 rounded-xl bg-[#222222] border border-[#2a2a2a] text-left"
      style={{
        animation: visible ? `fadeInScale 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms both` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[9px] text-[#555555] uppercase tracking-wider font-medium">
          {label}
        </p>
        <svg
          width={sparkW}
          height={sparkH}
          viewBox={`0 0 ${sparkW} ${sparkH}`}
          className="opacity-60"
        >
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="300"
            style={{
              animation: visible
                ? `drawLine 2s cubic-bezier(.16,1,.3,1) ${delay + 400}ms both`
                : "none",
            }}
          />
        </svg>
      </div>
      <p className="text-base sm:text-lg font-bold" style={{ color }}>
        {formatNum(count)}
      </p>
    </div>
  );
}

function AnimatedBarChart({ visible, delay }: { visible: boolean; delay: number }) {
  const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

  return (
    <div className="h-24 rounded-xl bg-[#222222] border border-[#2a2a2a] flex items-end justify-center gap-1 sm:gap-1.5 px-3 pb-3 pt-2 overflow-hidden">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 max-w-[24px] rounded-t origin-bottom"
          style={{
            height: `${h}%`,
            background: i === 9 ? "#CDB49E" : "rgba(205,180,158,0.15)",
            transform: visible ? "scaleY(1)" : "scaleY(0)",
            transition: `transform 0.8s cubic-bezier(.16,1,.3,1) ${delay + i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedDonutChart({ visible, delay }: { visible: boolean; delay: number }) {
  const segments = [
    { value: 45, color: "#34d399", label: "Paid" },
    { value: 25, color: "#CDB49E", label: "Sent" },
    { value: 15, color: "#f87171", label: "Overdue" },
    { value: 15, color: "#555555", label: "Draft" },
  ];
  const size = 80;
  const thickness = 8;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dashLength = pct * circumference;
            const dashGap = circumference - dashLength;
            const currentOffset = -offset;
            offset += dashLength;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={`${dashLength} ${dashGap}`}
                style={{
                  strokeDashoffset: visible ? currentOffset : circumference,
                  transition: `stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1) ${delay + i * 200}ms`,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-[#f5f0eb]">100</span>
          <span className="text-[7px] text-[#555555] uppercase">Total</span>
        </div>
      </div>
      <div className="space-y-1">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className="flex items-center gap-1.5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(10px)",
              transition: `all 0.5s cubic-bezier(.16,1,.3,1) ${delay + 400 + i * 100}ms`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[8px] text-[#888888]">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ visible, delay }: { visible: boolean; delay: number }) {
  const items = [
    { text: "Invoice #1042 paid", accent: "#34d399", time: "2m ago" },
    { text: "New order received", accent: "#60a5fa", time: "5m ago" },
    { text: "Stock alert: Widget A", accent: "#fbbf24", time: "12m ago" },
  ];

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: `all 0.6s cubic-bezier(.16,1,.3,1) ${delay + i * 150}ms`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.accent }}
          />
          <span className="text-[8px] sm:text-[9px] text-[#888888] truncate flex-1">
            {item.text}
          </span>
          <span className="text-[7px] text-[#555555] flex-shrink-0">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Floating cards around the dashboard ── */

function FloatingInvoiceCard({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className="absolute -right-3 sm:-right-6 top-[40%] w-[140px] sm:w-[160px] z-20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-mono text-[#888888]">INV-1042</span>
          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#34d399]/10 text-[#34d399] font-medium border border-[#34d399]/20">
            Paid
          </span>
        </div>
        <p className="text-xs font-semibold text-[#f5f0eb]">$2,450.00</p>
        <p className="text-[8px] text-[#555555] mt-1">Maple Leaf Co.</p>
        <div className="mt-2 h-px bg-[#2a2a2a]" />
        <p className="text-[7px] text-[#555555] mt-1.5">Due: Feb 15, 2026</p>
      </div>
    </div>
  );
}

function FloatingNotificationToast({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className="absolute -left-2 sm:-left-4 top-[20%] w-[150px] sm:w-[170px] z-20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)",
        transition: `all 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-[#34d399]/15 flex items-center justify-center flex-shrink-0">
            <Check size={8} className="text-[#34d399]" />
          </div>
          <span className="text-[8px] font-semibold text-[#f5f0eb]">Payment Received</span>
        </div>
        <p className="text-[8px] text-[#888888] leading-relaxed">
          $1,200 from Northern Supply has been processed.
        </p>
      </div>
    </div>
  );
}

function FloatingProductCard({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className="absolute -right-2 sm:-right-5 bottom-[15%] w-[130px] sm:w-[150px] z-20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) scale(1)" : "translateX(30px) scale(0.9)",
        transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-[#a78bfa]/15 flex items-center justify-center">
            <Package size={10} className="text-[#a78bfa]" />
          </div>
          <span className="text-[8px] font-semibold text-[#f5f0eb] truncate">Widget Pro X</span>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[7px] text-[#555555]">Stock Level</span>
          <span className="text-[8px] font-medium text-[#fbbf24]">Low</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#222222] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#fbbf24]"
            style={{
              width: visible ? "25%" : "0%",
              transition: `width 1.2s cubic-bezier(.16,1,.3,1) ${delay + 300}ms`,
            }}
          />
        </div>
        <p className="text-[7px] text-[#555555] mt-1.5">12 / 50 units</p>
      </div>
    </div>
  );
}

function FloatingAIChatBubble({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className="absolute -left-2 sm:-left-5 bottom-[10%] w-[155px] sm:w-[175px] z-20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.85)",
        transition: `all 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      <div
        className="bg-[#1a1a1a] border border-[#CDB49E]/20 rounded-xl p-3 shadow-2xl shadow-black/60"
        style={{
          animation: visible ? "pulseGlow 3s ease-in-out infinite" : "none",
          animationDelay: `${delay + 1000}ms`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-lg bg-[#3a3028] flex items-center justify-center">
            <Sparkles size={8} className="text-[#CDB49E]" />
          </div>
          <span className="text-[8px] font-semibold text-[#CDB49E]">Atlas AI</span>
        </div>
        <p className="text-[8px] text-[#888888] leading-relaxed">
          Revenue is up 12% this month. Your top seller is Widget Pro X.
        </p>
      </div>
    </div>
  );
}

function AnimatedDashboardMockup() {
  const { ref, visible } = useInView(0.15);

  return (
    <div ref={ref} className="mt-20 mx-auto max-w-3xl relative">
      <style dangerouslySetInnerHTML={{ __html: MOCKUP_KEYFRAMES }} />

      {/* Floating cards */}
      <FloatingNotificationToast visible={visible} delay={1200} />
      <FloatingInvoiceCard visible={visible} delay={1400} />
      <FloatingProductCard visible={visible} delay={1600} />
      <FloatingAIChatBubble visible={visible} delay={1800} />

      {/* Main dashboard card */}
      <div
        className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden shadow-2xl shadow-black/40"
        style={{
          animation: visible ? "fadeInScale 0.8s cubic-bezier(.16,1,.3,1) both" : "none",
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2a2a2a] bg-[#161616]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]/60" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-4 py-1 rounded-md bg-[#222222] text-[10px] text-[#555555] font-mono">
              app.atlas-erp.ca/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 sm:p-6 min-h-[320px] sm:min-h-[380px]">
          {/* Stat cards row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
            <AnimatedStatCard
              label="Revenue"
              value={48250}
              prefix="$"
              color="#CDB49E"
              delay={200}
              sparkData={[32, 45, 38, 52, 48, 61, 58, 65]}
            />
            <AnimatedStatCard
              label="Orders"
              value={142}
              color="#34d399"
              delay={350}
              sparkData={[20, 28, 25, 35, 30, 38, 32, 40]}
            />
            <AnimatedStatCard
              label="Products"
              value={1247}
              color="#a78bfa"
              delay={500}
              sparkData={[40, 42, 44, 43, 46, 45, 48, 50]}
            />
            <AnimatedStatCard
              label="Invoices"
              value={89}
              color="#fbbf24"
              delay={650}
              sparkData={[15, 20, 18, 25, 22, 28, 24, 30]}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div className="col-span-2">
              <AnimatedBarChart visible={visible} delay={800} />
            </div>
            <div className="rounded-xl bg-[#222222] border border-[#2a2a2a] p-2.5 flex items-center justify-center">
              <AnimatedDonutChart visible={visible} delay={1000} />
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl bg-[#222222] border border-[#2a2a2a] p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] sm:text-[9px] font-semibold text-[#888888] uppercase tracking-wider">
                Recent Activity
              </span>
              <span className="text-[7px] text-[#555555]">Live</span>
            </div>
            <ActivityFeed visible={visible} delay={1200} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── NAV ─────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Compare", href: "#compare" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#111111]/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#CDB49E] flex items-center justify-center font-bold text-sm text-[#111111] transition-transform duration-300 group-hover:scale-105">
            A
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#f5f0eb]">
            Atlas
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[#888888] hover:text-[#f5f0eb] transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm text-[#888888] hover:text-[#f5f0eb] transition-colors duration-300"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-6 py-2.5 rounded-full bg-[#CDB49E] text-[#111111] hover:bg-[#d4c0ad] transition-all duration-300 shadow-lg shadow-[#CDB49E]/10"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#f5f0eb]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <XIcon size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#111111]/98 backdrop-blur-2xl border-t border-[#2a2a2a] px-6 pb-8 pt-6 space-y-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[#888888] hover:text-[#f5f0eb] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-5 pt-3">
            <Link href="/login" className="text-sm text-[#888888]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-6 py-2.5 rounded-full bg-[#CDB49E] text-[#111111]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────── HERO ─────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-[72px] overflow-hidden bg-[#111111]">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#CDB49E]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2a2a] to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center py-20">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#3a3028]/60 text-[#CDB49E] text-sm font-medium mb-10 border border-[#CDB49E]/15 backdrop-blur-sm">
            <Sparkles size={14} />
            AI-Powered ERP for Canada 🇨🇦
          </div>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-[#f5f0eb] leading-[1.08]">
            Run your business
            <br />
            <span className="text-[#CDB49E]">smarter, not harder</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-7 text-lg sm:text-xl text-[#888888] max-w-2xl mx-auto leading-relaxed">
            Atlas is the modern ERP that replaces Odoo at a fraction of the
            cost. Inventory, invoicing, accounting, HR, CRM, and an AI
            assistant — starting at{" "}
            <span className="text-[#f5f0eb] font-semibold">$9/user/month</span>.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#CDB49E] text-[#111111] font-semibold text-base hover:bg-[#d4c0ad] transition-all duration-300 shadow-xl shadow-[#CDB49E]/15"
            >
              Start Free Trial
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-transparent text-[#f5f0eb] font-semibold text-base hover:bg-[#1a1a1a] transition-all duration-300 border border-[#2a2a2a] hover:border-[#3a3028]"
            >
              See Live Demo
            </Link>
          </div>
        </Reveal>

        <Reveal delay={440}>
          <p className="mt-6 text-xs text-[#555555]">
            14-day free trial · No credit card required
          </p>
        </Reveal>

        {/* Animated Dashboard mockup */}
        <AnimatedDashboardMockup />
      </div>
    </section>
  );
}

/* ─────────────────────── SOCIAL PROOF ─────────────────────── */
function SocialProof() {
  const logos = [
    "Maple Leaf Co.",
    "Northern Supply",
    "Canuck Services",
    "True North Tech",
    "Prairie Goods",
    "Pacific Trade",
  ];
  return (
    <Reveal className="py-16 border-y border-[#2a2a2a] bg-[#111111]">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-[11px] text-[#555555] mb-10 tracking-[0.25em] uppercase font-medium">
          Trusted by 500+ Canadian businesses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-5">
          {logos.map((name) => (
            <span
              key={name}
              className="text-[#333333] font-semibold text-base tracking-tight select-none hover:text-[#555555] transition-colors duration-500"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ─────────────────────── PROBLEM / SOLUTION ─────────────────────── */
function ProblemSolution() {
  const problems = [
    {
      emoji: "💸",
      title: "Overpriced",
      desc: "Odoo charges $24.90–49 per user, per month. Enterprise modules cost even more.",
    },
    {
      emoji: "🐌",
      title: "Bloated",
      desc: "Thousands of modules you'll never use. Slow, clunky interfaces from another era.",
    },
    {
      emoji: "🤯",
      title: "Complex",
      desc: "Weeks of setup. Consultants charging $200/hr. Training manuals nobody reads.",
    },
    {
      emoji: "🤖",
      title: "No AI",
      desc: "Legacy ERPs bolt on AI as an afterthought. Atlas was built AI-first.",
    },
  ];

  return (
    <section className="py-28 sm:py-36 bg-[#111111]">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
              Odoo charges{" "}
              <span className="line-through text-[#444444] decoration-red-500/50">
                $49/user
              </span>
              .
              <br />
              We charge{" "}
              <span className="text-[#CDB49E]">$9</span>.
            </h2>
            <p className="mt-5 text-[#888888] text-lg">
              Current ERPs are overpriced, over-engineered, and stuck in the
              past.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="group p-7 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3028] hover:bg-[#1e1e1e] transition-all duration-500">
                <span className="text-3xl">{p.emoji}</span>
                <h3 className="text-[#f5f0eb] font-semibold text-base mt-5 mb-2.5">
                  {p.title}
                </h3>
                <p className="text-[#888888] text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FEATURES ─────────────────────── */
const features = [
  {
    icon: Package,
    title: "Inventory Management",
    desc: "Real-time stock tracking, automatic reordering, multi-warehouse. Always know what you have.",
    badge: false,
  },
  {
    icon: FileText,
    title: "Smart Invoicing",
    desc: "Professional invoices in seconds. Automatic reminders, recurring billing, multi-currency.",
    badge: false,
  },
  {
    icon: Users,
    title: "Contacts & CRM",
    desc: "Customers, vendors, leads in one place. Track interactions and never lose a deal.",
    badge: false,
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    desc: "Ask anything about your business. Generate reports, forecast demand, automate workflows.",
    badge: true,
  },
  {
    icon: BarChart3,
    title: "Accounting",
    desc: "Double-entry bookkeeping, P&L, balance sheets. GST/HST ready for Canadian businesses.",
    badge: false,
  },
  {
    icon: UserCog,
    title: "HR & Payroll",
    desc: "Employee records, time tracking, leave management. Compliant with Canadian labor laws.",
    badge: false,
  },
];

function Features() {
  return (
    <section className="py-28 sm:py-36 bg-[#0e0e0e]" id="features">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-sm font-medium text-[#CDB49E] mb-4 tracking-wide uppercase">
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
              Six modules. One platform.
            </h2>
            <p className="mt-5 text-[#888888] text-lg">
              Every module works together. No plugins, no integrations, no
              headaches.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group relative p-8 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#CDB49E]/20 transition-all duration-500 h-full">
                  {f.badge && (
                    <span className="absolute top-6 right-6 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#3a3028] text-[#CDB49E] border border-[#CDB49E]/15">
                      Only in Atlas
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-[#3a3028] flex items-center justify-center mb-6 group-hover:bg-[#CDB49E]/15 transition-colors duration-500">
                    <Icon size={22} className="text-[#CDB49E]" />
                  </div>
                  <h3 className="text-[#f5f0eb] font-semibold text-base mb-2.5">
                    {f.title}
                  </h3>
                  <p className="text-[#888888] text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── WEBSITE BUILDER SHOWCASE ─────────────────────── */
function WebsiteBuilder() {
  const builderFeatures = [
    { icon: "🎨", title: "90+ Components", desc: "Drag-and-drop heroes, features, testimonials, pricing tables, forms, and more." },
    { icon: "📱", title: "Responsive Preview", desc: "See how your site looks on desktop, tablet, and mobile in real-time." },
    { icon: "⚡", title: "Command Palette", desc: "Press ⌘K to access any action instantly. Work faster than ever." },
    { icon: "🤖", title: "AI Content", desc: "Generate headlines, copy, and images with AI. Just describe what you need." },
    { icon: "🛒", title: "E-commerce Ready", desc: "Built-in cart, checkout, product grids. Launch your store in minutes." },
    { icon: "✨", title: "Scroll Animations", desc: "Parallax sections, fade effects, animated counters. Make it pop." },
  ];

  return (
    <section className="py-28 sm:py-36 bg-[#111111]" id="website-builder">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#3a3028]/60 text-[#CDB49E] text-sm font-medium mb-6 border border-[#CDB49E]/15">
              <Sparkles size={14} />
              New in v3.1
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
              Website Builder Pro
            </h2>
            <p className="mt-5 text-[#888888] text-lg">
              Build stunning websites without code. 90+ components, AI-powered content, 
              e-commerce ready. All inside Atlas.
            </p>
          </div>
        </Reveal>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {builderFeatures.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="group p-6 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#CDB49E]/20 transition-all duration-500">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="text-[#f5f0eb] font-semibold text-sm mt-4 mb-2">
                  {f.title}
                </h3>
                <p className="text-[#888888] text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Browser Mockup */}
        <Reveal delay={200}>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden shadow-2xl shadow-black/40">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2a2a2a] bg-[#161616]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]/60" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-block px-4 py-1 rounded-md bg-[#222222] text-[10px] text-[#555555] font-mono">
                  app.atlas-erp.ca/website
                </div>
              </div>
            </div>
            
            {/* Editor mockup */}
            <div className="flex">
              {/* Left panel */}
              <div className="w-48 border-r border-[#2a2a2a] p-3 hidden sm:block">
                <div className="text-[9px] font-semibold text-[#555] uppercase mb-2">Components</div>
                {["Hero Section", "Features Grid", "Testimonials", "Pricing Table", "Contact Form"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#222] text-[11px] text-[#888] cursor-pointer">
                    <div className="w-4 h-4 rounded bg-[#CDB49E]/10" />
                    {item}
                  </div>
                ))}
              </div>
              
              {/* Canvas */}
              <div className="flex-1 p-6 bg-[#0f0f0f] min-h-[300px]">
                <div className="max-w-lg mx-auto space-y-4">
                  {/* Mock hero */}
                  <div className="p-6 rounded-lg bg-gradient-to-br from-[#CDB49E]/20 to-[#CDB49E]/5 border border-[#CDB49E]/20 text-center">
                    <div className="text-[10px] px-2 py-1 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] inline-block mb-3">✨ New</div>
                    <div className="text-lg font-bold text-white mb-2">Your Headline Here</div>
                    <div className="text-xs text-[#888] mb-4">Drag and drop to build your perfect landing page</div>
                    <div className="inline-block px-4 py-2 rounded-lg bg-[#CDB49E] text-[#111] text-xs font-semibold">Get Started</div>
                  </div>
                  
                  {/* Mock features */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-center">
                        <div className="w-6 h-6 rounded-lg bg-[#CDB49E]/10 mx-auto mb-2" />
                        <div className="text-[10px] font-medium text-white">Feature {i}</div>
                        <div className="text-[8px] text-[#666] mt-1">Description text</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right panel */}
              <div className="w-48 border-l border-[#2a2a2a] p-3 hidden md:block">
                <div className="text-[9px] font-semibold text-[#555] uppercase mb-2">Style</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[9px] text-[#666] mb-1">Background</div>
                    <div className="flex gap-1">
                      {["#CDB49E", "#6366f1", "#f43f5e", "#10b981"].map(c => (
                        <div key={c} className="w-5 h-5 rounded border border-[#333]" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#666] mb-1">Animation</div>
                    <div className="px-2 py-1.5 rounded bg-[#222] text-[10px] text-[#888]">Fade In</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={300}>
          <div className="mt-12 text-center">
            <Link
              href="/website"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#CDB49E] text-[#111111] font-semibold text-sm hover:bg-[#d4c0ad] transition-all duration-300"
            >
              Try Website Builder
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────── COMPARISON ─────────────────────── */
function Comparison() {
  const rows = [
    { feature: "Starting Price", atlas: "$9/user/mo", odoo: "$24.90/user/mo", qb: "$35/mo" },
    { feature: "AI Assistant", atlas: true, odoo: false, qb: false },
    { feature: "Inventory", atlas: true, odoo: true, qb: "Basic" },
    { feature: "Invoicing", atlas: true, odoo: true, qb: true },
    { feature: "CRM", atlas: true, odoo: "Extra $$", qb: false },
    { feature: "HR & Payroll", atlas: true, odoo: "Extra $$", qb: false },
    { feature: "Accounting", atlas: true, odoo: true, qb: true },
    { feature: "GST/HST Ready", atlas: true, odoo: true, qb: true },
    { feature: "Setup Time", atlas: "Minutes", odoo: "Weeks", qb: "Hours" },
    { feature: "Modern UI", atlas: true, odoo: false, qb: false },
  ];

  const renderCell = (v: string | boolean) => {
    if (v === true)
      return <Check size={18} className="text-[#CDB49E] mx-auto" />;
    if (v === false)
      return <X size={18} className="text-[#333333] mx-auto" />;
    return <span className="text-sm text-[#888888]">{String(v)}</span>;
  };

  return (
    <section className="py-28 sm:py-36 bg-[#111111]" id="compare">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-[#CDB49E] mb-4 tracking-wide uppercase">
              Honest comparison
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
              See how Atlas stacks up
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden bg-[#1a1a1a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="p-5 text-sm font-medium text-[#555555]">
                      Feature
                    </th>
                    <th className="p-5 text-sm font-semibold text-[#CDB49E] text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-7 h-7 rounded-md bg-[#CDB49E] flex items-center justify-center text-xs font-bold text-[#111111]">
                          A
                        </div>
                        Atlas
                      </div>
                    </th>
                    <th className="p-5 text-sm font-medium text-[#555555] text-center">
                      Odoo
                    </th>
                    <th className="p-5 text-sm font-medium text-[#555555] text-center">
                      QuickBooks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-b border-[#2a2a2a]/50 ${
                        i % 2 === 0 ? "bg-[#161616]" : "bg-[#1a1a1a]"
                      }`}
                    >
                      <td className="p-5 text-sm text-[#f5f0eb] font-medium">
                        {row.feature}
                      </td>
                      <td className="p-5 text-center font-medium text-[#f5f0eb]">
                        {renderCell(row.atlas)}
                      </td>
                      <td className="p-5 text-center">
                        {renderCell(row.odoo)}
                      </td>
                      <td className="p-5 text-center">
                        {renderCell(row.qb)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────── PRICING ─────────────────────── */
const plans = [
  {
    name: "Starter",
    price: 9,
    desc: "For small businesses getting started",
    features: [
      "Inventory Management",
      "Smart Invoicing",
      "Contacts",
      "Up to 5 users",
      "Email support",
      "Canadian data residency",
    ],
    popular: false,
  },
  {
    name: "Business",
    price: 19,
    desc: "For growing teams that need more",
    features: [
      "Everything in Starter",
      "Accounting & Reports",
      "HR & Payroll",
      "CRM & Pipeline",
      "Up to 25 users",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 29,
    desc: "For businesses that want it all",
    features: [
      "Everything in Business",
      "AI Assistant",
      "Custom integrations",
      "Unlimited users",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    popular: false,
  },
];

function Pricing() {
  return (
    <section className="py-28 sm:py-36 bg-[#0e0e0e]" id="pricing">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-sm font-medium text-[#CDB49E] mb-4 tracking-wide uppercase">
              Simple pricing
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
              One price. No surprises.
            </h2>
            <p className="mt-5 text-[#888888] text-lg">
              14-day free trial on all plans. No credit card required.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 120}>
              <div
                className={`relative rounded-2xl p-8 h-full transition-all duration-500 ${
                  plan.popular
                    ? "bg-[#1a1a1a] border-2 border-[#CDB49E] shadow-2xl shadow-[#CDB49E]/5"
                    : "bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3028]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#CDB49E] text-[#111111] text-xs font-bold rounded-full tracking-wide uppercase">
                    Most Popular
                  </div>
                )}
                <h3 className="text-base font-semibold text-[#f5f0eb]">
                  {plan.name}
                </h3>
                <p className="text-sm text-[#888888] mt-1">{plan.desc}</p>
                <div className="mt-7 mb-7">
                  <span className="text-5xl font-bold text-[#f5f0eb]">
                    ${plan.price}
                  </span>
                  <span className="text-[#555555] text-sm ml-1.5">
                    /user/mo
                  </span>
                </div>
                <Link
                  href="/signup"
                  className={`block text-center py-3.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                    plan.popular
                      ? "bg-[#CDB49E] text-[#111111] hover:bg-[#d4c0ad] shadow-lg shadow-[#CDB49E]/10"
                      : "bg-[#222222] text-[#f5f0eb] hover:bg-[#2a2a2a] border border-[#2a2a2a]"
                  }`}
                >
                  Start Free Trial
                </Link>
                <ul className="mt-8 space-y-3.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-[#888888]"
                    >
                      <Check
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          plan.popular ? "text-[#CDB49E]" : "text-[#555555]"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── TESTIMONIALS ─────────────────────── */
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Owner, Maple Leaf Bakery",
    location: "Toronto, ON",
    quote:
      "We switched from Odoo and saved over $400/month. Atlas is faster, cleaner, and the AI assistant is a game-changer for inventory forecasting.",
    rating: 5,
  },
  {
    name: "Marc Dubois",
    role: "Director, Northern Consulting",
    location: "Montréal, QC",
    quote:
      "Setting up Atlas took 20 minutes. Setting up Odoo took us 3 weeks and $8,000 in consulting fees. The difference is night and day.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Ops Manager, Pacific Retail",
    location: "Vancouver, BC",
    quote:
      "The invoicing and accounting modules are exactly what we needed. GST/HST handling is seamless, and our accountant loves the reports.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section className="py-28 sm:py-36 bg-[#111111]" id="testimonials">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
              Loved across Canada
            </h2>
            <p className="mt-5 text-[#888888] text-lg">
              Real businesses, real results.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <div className="group p-8 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3028] transition-all duration-500 h-full flex flex-col">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="fill-[#CDB49E] text-[#CDB49E]"
                    />
                  ))}
                </div>
                <p className="text-[#aaaaaa] text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-7 pt-6 border-t border-[#2a2a2a]">
                  <p className="text-sm font-semibold text-[#f5f0eb]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#555555] mt-1 flex items-center gap-1.5">
                    {t.role} <MapPin size={10} /> {t.location}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FINAL CTA ─────────────────────── */
function FinalCTA() {
  const [email, setEmail] = useState("");

  return (
    <section className="relative py-28 sm:py-36 bg-[#0e0e0e] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#CDB49E]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <Reveal>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f0eb]">
            Ready to run your business smarter?
          </h2>
          <p className="mt-5 text-[#888888] text-lg max-w-xl mx-auto">
            Join 500+ Canadian businesses already saving time and money with
            Atlas.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/signup?email=${encodeURIComponent(email)}`;
            }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="you@company.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f0eb] placeholder:text-[#555555] text-sm focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/20 focus:border-[#CDB49E]/40 transition-all duration-300"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#CDB49E] text-[#111111] font-semibold text-sm hover:bg-[#d4c0ad] transition-all duration-300 shadow-lg shadow-[#CDB49E]/10"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </form>

          <p className="mt-5 text-xs text-[#444444]">
            Free 14-day trial · No credit card · Cancel anytime
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────── FOOTER ─────────────────────── */
function Footer() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Compare", href: "#compare" },
        { label: "Changelog", href: "#" },
      ],
    },
    {
      title: "Modules",
      links: [
        { label: "Inventory", href: "#" },
        { label: "Invoicing", href: "#" },
        { label: "Accounting", href: "#" },
        { label: "HR & Payroll", href: "#" },
        { label: "CRM", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[#2a2a2a] bg-[#111111]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#CDB49E] flex items-center justify-center font-bold text-xs text-[#111111]">
                A
              </div>
              <span className="text-base font-semibold text-[#f5f0eb]">
                Atlas
              </span>
            </Link>
            <p className="text-sm text-[#555555] leading-relaxed">
              Modern ERP for Canadian businesses.
            </p>
            <p className="mt-3 text-sm text-[#555555]">Built in Canada 🇨🇦</p>
          </div>
          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#555555] hover:text-[#CDB49E] transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#444444]">
            © {new Date().getFullYear()} Atlas ERP Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs text-[#444444] hover:text-[#CDB49E] transition-colors duration-300"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-[#f5f0eb] overflow-x-hidden antialiased">
      <Nav />
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <Features />
      <WebsiteBuilder />
      <Comparison />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
