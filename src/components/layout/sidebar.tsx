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

// Grouped navigation structure
const navGroups: NavGroup[] = [
  {
    label: "Operations",
    icon: Briefcase,
    items: [
      { href: "/pos", label: "Point of Sale", icon: Store, module: "pos" },
      { href: "/sales", label: "Sales", icon: ShoppingCart, module: "sales" },
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

// Standalone items (top and bottom)
const dashboardItem: NavItem = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" };
const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: Settings, module: "settings" };

function NavLink({ item, collapsed, isActive }: { item: NavItem; collapsed: boolean; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-[#273B3A] to-[#273B3A] text-[#E6D4C7] shadow-md shadow-[#273B3A]/20"
          : "text-[#273B3A] hover:text-[#273B3A] hover:bg-[#E6D4C7]"
      )}
    >
      <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-[#E6D4C7]")} />
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
  // Filter items based on permissions
  const visibleItems = useMemo(() => {
    if (permissions.length === 0) return group.items;
    return group.items.filter((item) => {
      if (!item.module) return true;
      return hasPermission(permissions, item.module, "view");
    });
  }, [group.items, permissions]);

  // Don't render group if no visible items
  if (visibleItems.length === 0) return null;

  const isExpanded = expandedGroups.has(group.label);
  const hasActiveChild = visibleItems.some(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  // Auto-expand if has active child
  const shouldShow = isExpanded || hasActiveChild;

  if (collapsed) {
    // In collapsed mode, show first item icon as group indicator
    return (
      <div className="relative group">
        <button
          className={cn(
            "w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
            hasActiveChild
              ? "bg-gradient-to-r from-[#273B3A] to-[#273B3A] text-[#E6D4C7]"
              : "text-[#273B3A] hover:text-[#273B3A] hover:bg-[#E6D4C7]"
          )}
        >
          <group.icon className="w-[18px] h-[18px]" />
        </button>
        {/* Tooltip on hover */}
        <div className="absolute left-full ml-2 top-0 hidden group-hover:block z-50">
          <div className="bg-[#273B3A] text-[#E6D4C7] rounded-lg shadow-xl py-2 px-1 min-w-[160px]">
            <div className="px-3 py-1.5 text-xs font-semibold text-[#273B3A] uppercase tracking-wider">
              {group.label}
            </div>
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-[13px] rounded-md mx-1 transition-colors",
                    isActive ? "bg-[#273B3A] text-[#E6D4C7]" : "hover:bg-[#3D2820]"
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
            ? "text-[#273B3A]"
            : "text-[#273B3A] hover:text-[#273B3A] hover:bg-[#E6D4C7]"
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
      
      {/* Expandable content */}
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
                    ? "bg-gradient-to-r from-[#273B3A] to-[#273B3A] text-[#E6D4C7] shadow-md shadow-[#273B3A]/20"
                    : "text-[#273B3A] hover:text-[#273B3A] hover:bg-[#E6D4C7]"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-[#E6D4C7]")} />
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

  // Check visibility for standalone items
  const showDashboard = permissions.length === 0 || hasPermission(permissions, "dashboard", "view");
  const showSettings = permissions.length === 0 || hasPermission(permissions, "settings", "view");

  const isDashboardActive = pathname === "/dashboard";
  const isSettingsActive = pathname === "/settings" || pathname.startsWith("/settings");

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-[#E6D4C7] flex flex-col transition-all duration-300 ease-in-out border-r border-[#D4CEB8]",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#D4CEB8]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#273B3A] to-[#273B3A] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#273B3A]/20">
            <span className="text-[#E6D4C7] font-bold text-sm tracking-tight">A</span>
          </div>
          {!collapsed && (
            <span className="text-[#273B3A] font-semibold text-lg tracking-tight">
              Atlas
            </span>
          )}
        </Link>
      </div>

      {/* Organization Switcher */}
      {!collapsed && (
        <div className="px-2 py-2 border-b border-[#D4CEB8]">
          <OrgSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D4CEB8] scrollbar-track-transparent">
        {/* Dashboard - standalone top item */}
        {showDashboard && (
          <NavLink item={dashboardItem} collapsed={collapsed} isActive={isDashboardActive} />
        )}

        {/* Divider */}
        <div className="h-px bg-[#D4CEB8] my-2 mx-2" />

        {/* Grouped navigation */}
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

        {/* Divider */}
        <div className="h-px bg-[#D4CEB8] my-2 mx-2" />

        {/* Settings - standalone bottom item */}
        {showSettings && (
          <NavLink item={settingsItem} collapsed={collapsed} isActive={isSettingsActive} />
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[#D4CEB8]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-[#273B3A] hover:text-[#273B3A] rounded-lg hover:bg-[#E6D4C7] transition-all duration-200"
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
