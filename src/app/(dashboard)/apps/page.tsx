"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  Bot,
  Calculator,
  ShoppingCart,
  Truck,
  UserCheck,
  Wallet,
  CalendarOff,
  FolderKanban,
  Headphones,
  Mail,
  Globe,
  Search,
  ChevronDown,
  ChevronRight,
  Lock,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────── types ─────────────────────── */

interface AppItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  available: boolean;
  category: string;
}

/* ─────────────────────── app definitions ─────────────────────── */

const apps: AppItem[] = [
  // Core Business
  {
    name: "Dashboard",
    description: "Business overview & KPIs",
    href: "/",
    icon: LayoutDashboard,
    iconBg: "bg-[rgba(156,74,41,0.15)]",
    iconColor: "text-[#9C4A29]",
    available: true,
    category: "Core Business",
  },
  {
    name: "Inventory",
    description: "Products, stock & warehousing",
    href: "/inventory",
    icon: Package,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    available: true,
    category: "Core Business",
  },
  {
    name: "Invoices",
    description: "Billing, payments & receivables",
    href: "/invoices",
    icon: FileText,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    available: true,
    category: "Core Business",
  },
  {
    name: "Contacts",
    description: "Customers, vendors & leads",
    href: "/contacts",
    icon: Users,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    available: true,
    category: "Core Business",
  },
  {
    name: "CRM",
    description: "Pipeline, leads & opportunities",
    href: "/crm",
    icon: Target,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    available: true,
    category: "Core Business",
  },
  {
    name: "Accounting",
    description: "General ledger & financial reports",
    href: "/accounting",
    icon: Calculator,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    available: false,
    category: "Core Business",
  },
  {
    name: "Sales",
    description: "Quotations, orders & pipeline",
    href: "/sales",
    icon: ShoppingCart,
    iconBg: "bg-[rgba(156,74,41,0.15)]",
    iconColor: "text-[#9C4A29]",
    available: false,
    category: "Core Business",
  },
  {
    name: "Purchase",
    description: "Purchase orders & vendor bills",
    href: "/purchase",
    icon: Truck,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    available: false,
    category: "Core Business",
  },

  // Human Resources
  {
    name: "Employees",
    description: "Employee directory & profiles",
    href: "/employees",
    icon: UserCheck,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    available: true,
    category: "Human Resources",
  },
  {
    name: "Payroll",
    description: "Salaries, deductions & payslips",
    href: "/payroll",
    icon: Wallet,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    available: false,
    category: "Human Resources",
  },
  {
    name: "Time Off",
    description: "Leave requests & approvals",
    href: "/time-off",
    icon: CalendarOff,
    iconBg: "bg-[rgba(156,74,41,0.15)]",
    iconColor: "text-[#9C4A29]",
    available: false,
    category: "Human Resources",
  },

  // Services
  {
    name: "Projects",
    description: "Task boards & timesheets",
    href: "/projects",
    icon: FolderKanban,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    available: true,
    category: "Services",
  },
  {
    name: "Helpdesk",
    description: "Support tickets & SLAs",
    href: "/helpdesk",
    icon: Headphones,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    available: false,
    category: "Services",
  },

  // Marketing
  {
    name: "Email Marketing",
    description: "Campaigns, templates & analytics",
    href: "/marketing",
    icon: Mail,
    iconBg: "bg-[rgba(156,74,41,0.15)]",
    iconColor: "text-[#9C4A29]",
    available: false,
    category: "Marketing",
  },
  // Productivity
  {
    name: "AI Assistant",
    description: "Natural language business queries",
    href: "/ai",
    icon: Bot,
    iconBg: "bg-[rgba(156,74,41,0.15)]",
    iconColor: "text-[#9C4A29]",
    available: true,
    category: "Productivity",
  },
  {
    name: "Settings",
    description: "Organization, billing & config",
    href: "/settings",
    icon: Settings,
    iconBg: "bg-[#DDD7C0]",
    iconColor: "text-[#6B5B4F]",
    available: true,
    category: "Productivity",
  },
];

const categories = [
  "Core Business",
  "Human Resources",
  "Services",
  "Marketing",
  "Productivity",
];

/* ════════════════════════ APPS PAGE ════════════════════════ */

export default function AppsPage() {
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.description.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#2D1810]">
          Apps
        </h1>
        <p className="text-[#6B5B4F] text-sm mt-1">
          Install and manage your business modules.
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7B6F]" />
        <input
          type="text"
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder-[#8B7B6F] focus:outline-none focus:border-[#9C4A29]/40 transition-colors"
        />
      </div>

      {/* ── Category sections ── */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryApps = filteredApps.filter(
            (app) => app.category === category
          );
          if (categoryApps.length === 0) return null;

          const isCollapsed = collapsedCategories.has(category);

          return (
            <div key={category}>
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 mb-4 group cursor-pointer"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-[#8B7B6F] group-hover:text-[#6B5B4F] transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8B7B6F] group-hover:text-[#6B5B4F] transition-colors" />
                )}
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8B7B6F] group-hover:text-[#6B5B4F] transition-colors">
                  {category}
                </h2>
                <span className="text-[11px] text-[#8B7B6F]">
                  ({categoryApps.length})
                </span>
              </button>

              {/* App grid */}
              {!isCollapsed && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {categoryApps.map((app) => {
                    const CardContent = (
                      <div
                        className={cn(
                          "relative bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 group",
                          app.available
                            ? "hover:border-[#9C4A29]/30 hover:bg-[#DDD7C0] cursor-pointer"
                            : "opacity-60 cursor-default"
                        )}
                      >
                        {/* Coming soon badge */}
                        {!app.available && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DDD7C0] border border-[#D4CDB8]">
                            <Lock className="w-2.5 h-2.5 text-[#8B7B6F]" />
                            <span className="text-[9px] font-medium text-[#8B7B6F] uppercase tracking-wider">
                              Soon
                            </span>
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            "p-3.5 rounded-xl transition-transform duration-200",
                            app.iconBg,
                            app.available && "group-hover:scale-110"
                          )}
                        >
                          <app.icon
                            className={cn("w-6 h-6", app.iconColor)}
                          />
                        </div>

                        {/* Label */}
                        <div>
                          <p className="text-sm font-medium text-[#2D1810]">
                            {app.name}
                          </p>
                          <p className="text-[11px] text-[#6B5B4F] mt-1 leading-relaxed">
                            {app.description}
                          </p>
                        </div>
                      </div>
                    );

                    if (app.available) {
                      return (
                        <Link key={app.name} href={app.href}>
                          {CardContent}
                        </Link>
                      );
                    }

                    return (
                      <div key={app.name}>{CardContent}</div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 mx-auto mb-3 text-[#6B5B4F]/30" />
            <p className="text-sm text-[#6B5B4F]">
              No apps match &quot;{search}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
