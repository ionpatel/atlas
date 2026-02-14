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
  Target,
  UserCircle,
  FolderKanban,
  Wallet,
  Store,
  BarChart3,
  FileSignature,
  FolderOpen,
} from "lucide-react";
import { useState, useMemo } from "react";
import { OrgSwitcher } from "@/components/org-switcher";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: ModuleName; // If undefined, always visible
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/apps", label: "Apps", icon: LayoutGrid, module: "apps" },
  { href: "/pos", label: "Point of Sale", icon: Store, module: "pos" },
  { href: "/inventory", label: "Inventory", icon: Package, module: "inventory" },
  { href: "/invoices", label: "Invoices", icon: FileText, module: "invoices" },
  { href: "/sales", label: "Sales", icon: ShoppingCart, module: "sales" },
  { href: "/purchase", label: "Purchase", icon: Truck, module: "purchase" },
  { href: "/accounting", label: "Accounting", icon: Calculator, module: "accounting" },
  { href: "/contracts", label: "Contracts", icon: FileSignature, module: "contracts" },
  { href: "/documents", label: "Documents", icon: FolderOpen, module: "documents" },
  { href: "/contacts", label: "Contacts", icon: Users, module: "contacts" },
  { href: "/crm", label: "CRM", icon: Target, module: "crm" },
  { href: "/employees", label: "Employees", icon: UserCircle, module: "employees" },
  { href: "/payroll", label: "Payroll", icon: Wallet, module: "payroll" },
  { href: "/projects", label: "Projects", icon: FolderKanban, module: "projects" },
  { href: "/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/ai", label: "AI Assistant", icon: Bot }, // Always visible
  { href: "/settings", label: "Settings", icon: Settings, module: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const permissions = usePermissions();

  // Filter nav items based on permissions
  const visibleNavItems = useMemo(() => {
    // If no permissions loaded yet (loading state), show all items
    // This prevents flash of hidden content
    if (permissions.length === 0) {
      return navItems;
    }

    return navItems.filter((item) => {
      // Items without module restriction are always visible
      if (!item.module) return true;
      
      // Check if user has view permission for this module
      return hasPermission(permissions, item.module, "view");
    });
  }, [permissions]);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-[#E8E3CC] flex flex-col transition-all duration-300 ease-in-out border-r border-[#F5F2E8]",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#F5F2E8]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9C4A29] to-[#7D3B21] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#9C4A29]/20">
            <span className="text-[#E8E3CC] font-bold text-sm tracking-tight">A</span>
          </div>
          {!collapsed && (
            <span className="text-[#2D1810] font-semibold text-lg tracking-tight">
              Atlas
            </span>
          )}
        </Link>
      </div>

      {/* Organization Switcher */}
      {!collapsed && (
        <div className="px-2 py-3 border-b border-[#F5F2E8]">
          <OrgSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-[#9C4A29] to-[#7D3B21] text-[#E8E3CC] shadow-md shadow-[#9C4A29]/20"
                  : "text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8]"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-[#E8E3CC]")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#F5F2E8]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2.5 text-[#6B5B4F] hover:text-[#2D1810] rounded-lg hover:bg-[#F5F2E8] transition-all duration-200"
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
