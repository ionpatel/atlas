"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apps", label: "Apps", icon: LayoutGrid },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/purchase", label: "Purchase", icon: Truck },
  { href: "/accounting", label: "Accounting", icon: Calculator },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/crm", label: "CRM", icon: Target },
  { href: "/employees", label: "Employees", icon: UserCircle },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/ai", label: "AI Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-[#111111] flex flex-col transition-all duration-300 ease-in-out border-r border-[#1a1a1a]",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#1a1a1a]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#CDB49E] flex items-center justify-center flex-shrink-0">
            <span className="text-[#111111] font-bold text-sm tracking-tight">A</span>
          </div>
          {!collapsed && (
            <span className="text-[#f5f0eb] font-semibold text-lg tracking-tight">
              Atlas
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
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
                  ? "bg-[#CDB49E] text-[#111111]"
                  : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-[#111111]")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[#1a1a1a]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2.5 text-[#888888] hover:text-[#f5f0eb] rounded-lg hover:bg-[#1a1a1a] transition-all duration-200"
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
