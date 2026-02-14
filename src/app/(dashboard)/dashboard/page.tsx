"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Users,
  BarChart3,
  Activity,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  CircleDot,
  Sparkles,
  ArrowRight,
  Eye,
  Bell,
  Star,
  ShoppingCart,
  Calculator,
  Truck,
  Receipt,
  PackageCheck,
  UserPlus,
  RefreshCcw,
  Settings,
  CreditCard,
} from "lucide-react";
import { useInventoryStore } from "@/stores/inventory-store";
import { useInvoicesStore } from "@/stores/invoices-store";
import { useContactsStore } from "@/stores/contacts-store";
import { formatCurrency } from "@/lib/utils";
import { AIInsights } from "@/components/dashboard/ai-insights";

/* ─────────────────────── helpers ─────────────────────── */

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─────────────────────── mini sparkline ─────────────────────── */

function Sparkline({
  data,
  color = "#9C4A29",
  height = 32,
  width = 80,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─────────────────────── donut chart ─────────────────────── */

function DonutChart({
  segments,
  size = 120,
  thickness = 14,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashLength = pct * circumference;
          const dashOffset = -offset;
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
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#2D1810]">{total}</span>
        <span className="text-[10px] text-[#6B5B4F] uppercase tracking-wider">
          Total
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────── bar chart ─────────────────────── */

function BarChart({
  data,
}: {
  data: { label: string; value: number; accent?: boolean }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-[140px] px-1">
      {data.map((d, i) => {
        const heightPct = (d.value / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <span className="text-[10px] text-[#6B5B4F] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
              {formatCompact(d.value)}
            </span>
            <div className="w-full relative flex-1 flex items-end">
              <div
                className={classNames(
                  "w-full rounded-t-md transition-all duration-500 ease-out",
                  d.accent
                    ? "bg-[#9C4A29] group-hover:bg-[#B85A35]"
                    : "bg-[#9C4A29]/15 group-hover:bg-[#9C4A29]/30"
                )}
                style={{ height: `${Math.max(heightPct, 3)}%` }}
              />
            </div>
            <span className="text-[10px] text-[#8B7B6F] uppercase tracking-wider whitespace-nowrap">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── status icon ─────────────────────── */

function InvoiceStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "paid":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "sent":
      return <Send className="w-3.5 h-3.5 text-[#9C4A29]" />;
    case "overdue":
      return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    case "draft":
      return <CircleDot className="w-3.5 h-3.5 text-[#8B7B6F]" />;
    default:
      return <CircleDot className="w-3.5 h-3.5 text-[#8B7B6F]" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    sent: "bg-[rgba(156,74,41,0.15)] text-[#9C4A29] border-[#9C4A29]/20",
    overdue: "bg-red-500/10 text-red-400 border-red-500/20",
    draft: "bg-[#DDD7C0] text-[#6B5B4F] border-[#D4CDB8]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[status] || styles.draft}`}
    >
      <InvoiceStatusIcon status={status} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─────────────────────── KPI comparison ─────────────────────── */

function KpiComparison({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[11px] font-medium ${
        isPositive ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {isPositive ? "+" : ""}
      {value}% {label}
    </span>
  );
}

/* ─────────────────────── notification bell ─────────────────────── */

function NotificationBell({ overdueCount, lowStockCount }: { overdueCount: number; lowStockCount: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalNotifs = overdueCount + (lowStockCount > 0 ? 1 : 0) + 1; // +1 for "new orders" mock

  const notifications = [
    {
      label: `${overdueCount} invoice${overdueCount !== 1 ? "s" : ""} overdue`,
      color: "bg-red-400",
      href: "/invoices",
      icon: AlertCircle,
    },
    {
      label: `${lowStockCount} product${lowStockCount !== 1 ? "s" : ""} low on stock`,
      color: "bg-amber-400",
      href: "/inventory",
      icon: AlertTriangle,
    },
    {
      label: "2 new orders today",
      color: "bg-emerald-400",
      href: "/sales",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-lg border border-[#D4CDB8] text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8] transition-all duration-200"
      >
        <Bell className="w-4 h-4" />
        {totalNotifs > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 text-[9px] font-bold text-[#E8E3CC] flex items-center justify-center">
            {totalNotifs > 9 ? "9+" : totalNotifs}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#D4CDB8]">
            <p className="text-xs font-semibold text-[#2D1810]">Notifications</p>
          </div>
          {notifications.map((n, i) => (
            <Link
              key={i}
              href={n.href}
              onClick={() => setOpen(false)}
              className={classNames(
                "flex items-center gap-3 px-4 py-3 hover:bg-[#DDD7C0] transition-colors",
                i < notifications.length - 1 && "border-b border-[#D4CDB8]/50"
              )}
            >
              <div className={`w-2 h-2 rounded-full ${n.color} flex-shrink-0`} />
              <n.icon className="w-3.5 h-3.5 text-[#8B7B6F] flex-shrink-0" />
              <span className="text-xs text-[#6B5B4F]">{n.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── activity timeline ─────────────────────── */

const TIMELINE_EVENTS = [
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    title: "Invoice #INV-2026-003 paid",
    description: "Payment received from Sunrise Wellness Clinic",
    time: "2 hours ago",
  },
  {
    icon: PackageCheck,
    color: "text-violet-400",
    dotColor: "bg-violet-400",
    title: "Stock received: Amoxicillin 500mg",
    description: "150 units added to warehouse inventory",
    time: "5 hours ago",
  },
  {
    icon: UserPlus,
    color: "text-blue-400",
    dotColor: "bg-blue-400",
    title: "New contact added",
    description: "Metro Health Supplies added as vendor",
    time: "Yesterday at 4:30 PM",
  },
  {
    icon: AlertTriangle,
    color: "text-amber-400",
    dotColor: "bg-amber-400",
    title: "Low stock alert: Ibuprofen 200mg",
    description: "Stock fell below minimum threshold (25/40)",
    time: "Yesterday at 2:15 PM",
  },
  {
    icon: Send,
    color: "text-[#9C4A29]",
    dotColor: "bg-[#9C4A29]",
    title: "Invoice #INV-2026-005 sent",
    description: "Emailed to GreenLeaf Pharmacy",
    time: "2 days ago",
  },
];

/* ════════════════════════ MAIN DASHBOARD ════════════════════════ */

export default function DashboardPage() {
  const { products } = useInventoryStore();
  const { invoices, getContactName } = useInvoicesStore();
  const { contacts } = useContactsStore();

  /* ── derived stats ── */
  const stats = useMemo(() => {
    const activeProducts = products.filter((p) => p.is_active).length;
    const totalCostValue = products.reduce(
      (sum, p) => sum + p.cost_price,
      0
    );
    const totalSellValue = products.reduce(
      (sum, p) => sum + p.sell_price,
      0
    );

    const totalRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0);

    const totalOutstanding = invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.total, 0);

    const overdueCount = invoices.filter((i) => i.status === "overdue").length;
    const paidCount = invoices.filter((i) => i.status === "paid").length;
    const sentCount = invoices.filter((i) => i.status === "sent").length;
    const draftCount = invoices.filter((i) => i.status === "draft").length;

    const customerCount = contacts.filter(
      (c) => c.type === "customer" || c.type === "both"
    ).length;
    const vendorCount = contacts.filter(
      (c) => c.type === "vendor" || c.type === "both"
    ).length;

    const lowStockCount = products.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity < p.min_quantity
    ).length;

    return {
      activeProducts,
      totalProducts: products.length,
      totalCostValue,
      totalSellValue,
      totalRevenue,
      totalOutstanding,
      overdueCount,
      paidCount,
      sentCount,
      draftCount,
      customerCount,
      vendorCount,
      totalContacts: contacts.length,
      lowStockCount,
    };
  }, [products, invoices, contacts]);

  /* ── top products by margin ── */
  const topProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.is_active)
      .map((p) => ({
        ...p,
        margin: p.sell_price - p.cost_price,
        marginPct:
          p.cost_price > 0
            ? ((p.sell_price - p.cost_price) / p.cost_price) * 100
            : 0,
      }))
      .sort((a, b) => b.marginPct - a.marginPct)
      .slice(0, 5);
  }, [products]);

  /* ── recent invoices ── */
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [invoices]);

  /* ── simulated revenue data for chart (7 months) ── */
  const revenueData = useMemo(() => {
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    const base = stats.totalRevenue || 6550;
    return months.map((m, i) => ({
      label: m,
      value: Math.round(base * (0.6 + Math.random() * 0.5 + i * 0.05)),
      accent: i === months.length - 1,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── invoice breakdown for donut ── */
  const invoiceSegments = useMemo(
    () => [
      { value: stats.paidCount, color: "#34d399", label: "Paid" },
      { value: stats.sentCount, color: "#9C4A29", label: "Sent" },
      { value: stats.overdueCount, color: "#f87171", label: "Overdue" },
      { value: stats.draftCount, color: "#8B7B6F", label: "Draft" },
    ],
    [stats]
  );

  /* ── sparkline sample data ── */
  const sparkRevenue = [32, 45, 38, 52, 48, 61, 58, 65];
  const sparkProducts = [40, 42, 44, 43, 46, 45, 48, 48];
  const sparkOutstanding = [20, 25, 18, 30, 22, 28, 19, 15];

  /* ── favorite modules ── */
  const favoriteModules = [
    { label: "Inventory", icon: Package, href: "/inventory", color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Invoices", icon: FileText, href: "/invoices", color: "text-[#9C4A29]", bg: "bg-[rgba(156,74,41,0.15)]" },
    { label: "Contacts", icon: Users, href: "/contacts", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Sales", icon: ShoppingCart, href: "/sales", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Purchases", icon: Truck, href: "/purchases", color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Accounting", icon: Calculator, href: "/accounting", color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Welcome section + Notification bell ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D1810]">
            {getGreeting()}, Demo User
          </h1>
          <p className="text-[#6B5B4F] text-sm mt-1">
            {getFormattedDate()}
          </p>
          <p className="text-[#8B7B6F] text-xs mt-1">
            Here&apos;s your business at a glance — stay on top of what matters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell overdueCount={stats.overdueCount} lowStockCount={stats.lowStockCount} />
          <Link
            href="/invoices"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            New Invoice
          </Link>
          <Link
            href="/inventory"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* ── Favorites bar ── */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
        <div className="px-5 py-3 border-b border-[#D4CDB8] flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-[#9C4A29]" />
          <span className="text-xs font-semibold text-[#6B5B4F] uppercase tracking-wider">Favorites</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-2.5 overflow-x-auto">
          {favoriteModules.map((mod) => (
            <Link
              key={mod.label}
              href={mod.href}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg hover:bg-[#DDD7C0] transition-all duration-200 flex-shrink-0 group"
            >
              <div className={`p-1.5 rounded-md ${mod.bg}`}>
                <mod.icon className={`w-3.5 h-3.5 ${mod.color}`} />
              </div>
              <span className="text-xs font-medium text-[#6B5B4F] group-hover:text-[#2D1810] transition-colors">
                {mod.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stat cards with KPI comparisons ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-5 hover:border-[#9C4A29]/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <Sparkline data={sparkRevenue} color="#34d399" />
          </div>
          <p className="text-2xl font-bold text-[#2D1810] tracking-tight">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B5B4F] uppercase tracking-wider">
              Revenue (Paid)
            </p>
            <KpiComparison value={12} label="vs last month" />
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-5 hover:border-[#9C4A29]/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-[rgba(156,74,41,0.15)]">
              <Clock className="w-4 h-4 text-[#9C4A29]" />
            </div>
            <Sparkline data={sparkOutstanding} color="#9C4A29" />
          </div>
          <p className="text-2xl font-bold text-[#9C4A29] tracking-tight">
            {formatCurrency(stats.totalOutstanding)}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B5B4F] uppercase tracking-wider">
              Outstanding
            </p>
            <KpiComparison value={-8} label="vs last month" />
          </div>
        </div>

        {/* Products */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-5 hover:border-[#9C4A29]/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Package className="w-4 h-4 text-violet-400" />
            </div>
            <Sparkline data={sparkProducts} color="#a78bfa" />
          </div>
          <p className="text-2xl font-bold text-[#2D1810] tracking-tight">
            {stats.totalProducts}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B5B4F] uppercase tracking-wider">
              Products
            </p>
            <KpiComparison value={5} label="vs last month" />
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-5 hover:border-[#9C4A29]/20 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-[#6B5B4F]">
                {stats.customerCount}{" "}
                <span className="text-[#8B7B6F]">cust</span>
              </span>
              <span className="text-[#6B5B4F]">
                {stats.vendorCount}{" "}
                <span className="text-[#8B7B6F]">vend</span>
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2D1810] tracking-tight">
            {stats.totalContacts}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#6B5B4F] uppercase tracking-wider">
              Contacts
            </p>
            <KpiComparison value={15} label="vs last month" />
          </div>
        </div>
      </div>

      {/* ── Row 2: Revenue chart + Invoice breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend chart */}
        <div className="lg:col-span-2 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
          <div className="px-6 py-5 border-b border-[#D4CDB8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-[#6B5B4F]" />
              <h2 className="text-sm font-semibold text-[#2D1810]">
                Revenue Trend
              </h2>
            </div>
            <span className="text-[11px] text-[#8B7B6F]">Last 7 months</span>
          </div>
          <div className="p-6">
            <BarChart data={revenueData} />
          </div>
        </div>

        {/* Invoice breakdown donut */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
          <div className="px-6 py-5 border-b border-[#D4CDB8] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#2D1810]">
              Invoice Status
            </h2>
            <Link
              href="/invoices"
              className="text-[11px] text-[#8B7B6F] hover:text-[#9C4A29] transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-6 flex flex-col items-center gap-5">
            <DonutChart segments={invoiceSegments} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 w-full">
              {invoiceSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-[#6B5B4F]">{seg.label}</span>
                  <span className="text-xs font-semibold text-[#2D1810] ml-auto">
                    {seg.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent invoices + Activity Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent invoices */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
          <div className="px-6 py-5 border-b border-[#D4CDB8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#6B5B4F]" />
              <h2 className="text-sm font-semibold text-[#2D1810]">
                Recent Invoices
              </h2>
            </div>
            <Link
              href="/invoices"
              className="text-[11px] text-[#8B7B6F] hover:text-[#9C4A29] transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {recentInvoices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="w-8 h-8 mx-auto mb-3 text-[#6B5B4F]/30" />
                <p className="text-sm text-[#6B5B4F]">No invoices yet</p>
              </div>
            ) : (
              recentInvoices.map((inv, i) => (
                <div
                  key={inv.id}
                  className={classNames(
                    "px-6 py-4 flex items-center justify-between transition-colors hover:bg-[#DDD7C0]/50 cursor-pointer",
                    i < recentInvoices.length - 1 &&
                      "border-b border-[#D4CDB8]/50"
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#DDD7C0] flex items-center justify-center flex-shrink-0">
                      <InvoiceStatusIcon status={inv.status} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#2D1810] font-mono">
                          {inv.invoice_number}
                        </p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-xs text-[#6B5B4F] mt-0.5 truncate">
                        {getContactName(inv.contact_id)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-semibold text-[#2D1810]">
                      {formatCurrency(inv.total)}
                    </p>
                    <p className="text-[11px] text-[#8B7B6F] mt-0.5">
                      {new Date(inv.issue_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
          <div className="px-6 py-5 border-b border-[#D4CDB8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#6B5B4F]" />
              <h2 className="text-sm font-semibold text-[#2D1810]">
                Recent Activity
              </h2>
            </div>
            <span className="text-[11px] text-[#8B7B6F]">Last 7 days</span>
          </div>
          <div className="p-6">
            <div className="space-y-0">
              {TIMELINE_EVENTS.map((event, i) => (
                <div key={i} className="flex gap-4 group">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${event.dotColor} flex-shrink-0 mt-1.5 ring-4 ring-[#F5F2E8]`} />
                    {i < TIMELINE_EVENTS.length - 1 && (
                      <div className="w-px flex-1 bg-[#D4CDB8] my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={classNames("pb-6 min-w-0 flex-1", i === TIMELINE_EVENTS.length - 1 && "pb-0")}>
                    <div className="flex items-center gap-2 mb-1">
                      <event.icon className={`w-3.5 h-3.5 ${event.color} flex-shrink-0`} />
                      <p className="text-sm font-medium text-[#2D1810] truncate">{event.title}</p>
                    </div>
                    <p className="text-xs text-[#6B5B4F] mb-1">{event.description}</p>
                    <p className="text-[11px] text-[#8B7B6F]">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Top products by margin ── */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
        <div className="px-6 py-5 border-b border-[#D4CDB8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-[#6B5B4F]" />
            <h2 className="text-sm font-semibold text-[#2D1810]">
              Top Products by Margin
            </h2>
          </div>
          <Link
            href="/inventory"
            className="text-[11px] text-[#8B7B6F] hover:text-[#9C4A29] transition-colors flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {topProducts.length === 0 ? (
            <div className="px-6 py-12 text-center col-span-2">
              <Package className="w-8 h-8 mx-auto mb-3 text-[#6B5B4F]/30" />
              <p className="text-sm text-[#6B5B4F]">No products yet</p>
            </div>
          ) : (
            topProducts.map((p, i) => (
              <div
                key={p.id}
                className={classNames(
                  "px-6 py-4 flex items-center justify-between transition-colors hover:bg-[#DDD7C0]/50 cursor-pointer border-b border-[#D4CDB8]/50"
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[#9C4A29]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2D1810] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[#6B5B4F] mt-0.5">
                      {p.category || "Uncategorized"} · {p.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-semibold text-emerald-400">
                    +{formatCurrency(p.margin)}
                  </p>
                  <p className="text-[11px] text-[#8B7B6F] mt-0.5">
                    {p.marginPct.toFixed(0)}% margin
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Row 5: AI Insights ── */}
      <AIInsights />

      {/* ── Row 6: Quick actions + AI teaser ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="lg:col-span-2 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
          <div className="px-6 py-5 border-b border-[#D4CDB8]">
            <h2 className="text-sm font-semibold text-[#2D1810]">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Add Product",
                icon: Package,
                href: "/inventory",
                color: "bg-violet-500/10",
                iconColor: "text-violet-400",
              },
              {
                label: "New Invoice",
                icon: FileText,
                href: "/invoices",
                color: "bg-[rgba(156,74,41,0.15)]",
                iconColor: "text-[#9C4A29]",
              },
              {
                label: "Add Contact",
                icon: Users,
                href: "/contacts",
                color: "bg-blue-500/10",
                iconColor: "text-blue-400",
              },
              {
                label: "View Reports",
                icon: BarChart3,
                href: "/dashboard",
                color: "bg-emerald-500/10",
                iconColor: "text-emerald-400",
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-[#DDD7C0] transition-all duration-200 group text-center"
              >
                <div
                  className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-200`}
                >
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-[#6B5B4F] group-hover:text-[#2D1810] transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Assistant teaser */}
        <div className="bg-gradient-to-br from-[#F5F2E8] to-[#1e1914] border border-[#D4CDB8] rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9C4A29]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-[rgba(156,74,41,0.15)]">
                <Sparkles className="w-4 h-4 text-[#9C4A29]" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9C4A29]">
                Coming Soon
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#2D1810] mb-2">
              AI Assistant
            </h3>
            <p className="text-xs text-[#6B5B4F] leading-relaxed mb-6">
              Ask anything about your business. &quot;What&apos;s my best-selling
              product?&quot; &quot;Show overdue invoices.&quot; &quot;Forecast next month&apos;s
              revenue.&quot;
            </p>
          </div>
          <Link
            href="/ai"
            className="relative z-10 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#9C4A29]/10 text-[#9C4A29] text-sm font-medium hover:bg-[#9C4A29]/20 transition-all duration-200 border border-[#9C4A29]/10"
          >
            Try it out
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
