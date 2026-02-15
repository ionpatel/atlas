"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions, hasPermission } from "@/stores/auth-store";
import type { ModuleName } from "@/types";
import {
  LayoutDashboard,
  LayoutGrid,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  Bot,
  Calculator,
  ChevronLeft,
  ChevronDown,
  Target,
  UserCircle,
  FolderKanban,
  Wallet,
  Store,
  BarChart3,
  FileSignature,
  FolderOpen,
  Briefcase,
  DollarSign,
  UsersRound,
  FileStack,
  Wrench,
} from "lucide-react";
import { useState, useMemo } from "react";
import { OrgSwitcher } from "@/components/org-switcher";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: ModuleName;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    icon: Briefcase,
    items: [
      { href: "/pos", label: "Point of Sale", icon: Store, module: "pos" },
      { href: "/sales", label: "Sales", icon: ShoppingCart, module: "sales" },
      { href: "/quotations", label: "Quotations", icon: FileText, module: "sales" },
      { href: "/inventory", label: "Inventory", icon: Package, module: "inventory" },
      { href: "/purchase", label: "Purchase", icon: Truck, module: "purchase" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    items: [
      { href: "/invoices", label: "Invoices", icon: FileText, module: "invoices" },
      { href: "/accounting", label: "Accounting", icon: Calculator, module: "accounting" },
      { href: "/payroll", label: "Payroll", icon: Wallet, module: "payroll" },
    ],
  },
  {
    label: "Relations",
    icon: UsersRound,
    items: [
      { href: "/contacts", label: "Contacts", icon: Users, module: "contacts" },
      { href: "/crm", label: "CRM", icon: Target, module: "crm" },
      { href: "/employees", label: "Employees", icon: UserCircle, module: "employees" },
    ],
  },
  {
    label: "Documents",
    icon: FileStack,
    items: [
      { href: "/documents", label: "Documents", icon: FolderOpen, module: "documents" },
      { href: "/contracts", label: "Contracts", icon: FileSignature, module: "contracts" },
      { href: "/projects", label: "Projects", icon: FolderKanban, module: "projects" },
    ],
  },
  {
    label: "Tools",
    icon: Wrench,
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
      { href: "/ai", label: "AI Assistant", icon: Bot },
      { href: "/apps", label: "Apps", icon: LayoutGrid, module: "apps" },
    ],
  },
];

const dashboardItem: NavItem = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" };
const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: Settings, module: "settings" };

function NavLink({ item, collapsed, isActive }: { item: NavItem; collapsed: boolean; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
        isActive
          ? "bg-[#CDB49E]/10 text-[#CDB49E] border border-[#CDB49E]/20"
          : "text-[#999] hover:text-[#eee] hover:bg-[#1A1A1A]"
      )}
    >
      <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive ? "text-[#CDB49E]" : "")} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function NavGroupSection({ 
  group, 
  collapsed, 
  pathname, 
  permissions,
  expandedGroups,
  toggleGroup,
}: { 
  group: NavGroup; 
  collapsed: boolean; 
  pathname: string;
  permissions: string[];
  expandedGroups: Set<string>;
  toggleGroup: (label: string) => void;
}) {
  const visibleItems = useMemo(() => {
    if (permissions.length === 0) return group.items;
    return group.items.filter((item) => {
      if (!item.module) return true;
      return hasPermission(permissions, item.module, "view");
    });
  }, [group.items, permissions]);

  if (visibleItems.length === 0) return null;

  const isExpanded = expandedGroups.has(group.label);
  const hasActiveChild = visibleItems.some(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );
  const shouldShow = isExpanded || hasActiveChild;

  if (collapsed) {
    return (
      <div className="relative group">
        <button
          className={cn(
            "w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
            hasActiveChild
              ? "bg-[#CDB49E]/10 text-[#CDB49E]"
              : "text-[#666] hover:text-[#eee] hover:bg-[#1A1A1A]"
          )}
        >
          <group.icon className="w-[18px] h-[18px]" />
        </button>
        <div className="absolute left-full ml-2 top-0 hidden group-hover:block z-50">
          <div className="bg-[#1A1A1A] border border-[#333] text-[#eee] rounded-xl shadow-2xl shadow-black/50 py-2 px-1 min-w-[180px]">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-[#CDB49E] uppercase tracking-[0.15em]">
              {group.label}
            </div>
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg mx-1 transition-colors",
                    isActive ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#999] hover:bg-[#262626] hover:text-[#eee]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => toggleGroup(group.label)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
          hasActiveChild
            ? "text-[#CDB49E]"
            : "text-[#777] hover:text-[#eee] hover:bg-[#1A1A1A]"
        )}
      >
        <div className="flex items-center gap-3">
          <group.icon className="w-[18px] h-[18px]" />
          <span>{group.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            shouldShow && "rotate-180"
          )}
        />
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          shouldShow ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-4 space-y-0.5 pt-0.5">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#CDB49E]/10 text-[#CDB49E] border border-[#CDB49E]/20"
                    : "text-[#888] hover:text-[#eee] hover:bg-[#1A1A1A]"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#CDB49E]" : "")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const permissions = usePermissions();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const showDashboard = permissions.length === 0 || hasPermission(permissions, "dashboard", "view");
  const showSettings = permissions.length === 0 || hasPermission(permissions, "settings", "view");
  const isDashboardActive = pathname === "/dashboard";
  const isSettingsActive = pathname === "/settings" || pathname.startsWith("/settings");

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-[#0D0D0D] flex flex-col transition-all duration-300 ease-in-out border-r border-[#1E1E1E]",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#1E1E1E]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CDB49E] to-[#B89B78] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#CDB49E]/10">
            <span className="text-[#0A0A0A] font-bold text-sm tracking-tight">A</span>
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-lg tracking-tight">
              Atlas
            </span>
          )}
        </Link>
      </div>

      {/* Organization Switcher */}
      {!collapsed && (
        <div className="px-2 py-2 border-b border-[#1E1E1E]">
          <OrgSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {showDashboard && (
          <NavLink item={dashboardItem} collapsed={collapsed} isActive={isDashboardActive} />
        )}

        <div className="h-px bg-[#1E1E1E] my-2 mx-2" />

        {navGroups.map((group) => (
          <NavGroupSection
            key={group.label}
            group={group}
            collapsed={collapsed}
            pathname={pathname}
            permissions={permissions}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
          />
        ))}

        <div className="h-px bg-[#1E1E1E] my-2 mx-2" />

        {showSettings && (
          <NavLink item={settingsItem} collapsed={collapsed} isActive={isSettingsActive} />
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[#1E1E1E]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-[#666] hover:text-[#CDB49E] rounded-lg hover:bg-[#1A1A1A] transition-all duration-200"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}
