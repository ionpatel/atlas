"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, User, AlertCircle, AlertTriangle, ShoppingCart, CheckCircle2, Package } from "lucide-react";
import { SmartSearch } from "./smart-search";
import { cn } from "@/lib/utils";

// Mock notification data - in real app would come from stores/API
const notifications = [
  {
    id: 1,
    label: "2 invoices overdue",
    color: "bg-red-400",
    href: "/invoices",
    icon: AlertCircle,
    type: "warning",
  },
  {
    id: 2,
    label: "3 products low on stock",
    color: "bg-amber-400",
    href: "/inventory",
    icon: AlertTriangle,
    type: "warning",
  },
  {
    id: 3,
    label: "2 new orders today",
    color: "bg-emerald-400",
    href: "/sales",
    icon: ShoppingCart,
    type: "success",
  },
  {
    id: 4,
    label: "Invoice #INV-2026-003 paid",
    color: "bg-emerald-400",
    href: "/invoices",
    icon: CheckCircle2,
    type: "success",
  },
];

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200",
          open && "bg-[#0A0A0A] text-[#FAFAFA]"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#161616] text-[9px] font-bold text-[#0A0A0A] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#FAFAFA]">Notifications</p>
            <span className="text-[10px] font-medium text-[#FAFAFA] bg-[#161616]/10 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n, i) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-[#0A0A0A] transition-colors",
                  i < notifications.length - 1 && "border-b border-[#262626]/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  n.type === "warning" ? "bg-amber-500/10" : "bg-emerald-500/10"
                )}>
                  <n.icon className={cn(
                    "w-4 h-4",
                    n.type === "warning" ? "text-amber-500" : "text-emerald-500"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#FAFAFA]">{n.label}</p>
                  <p className="text-[11px] text-[#FAFAFA]">Just now</p>
                </div>
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", n.color)} />
              </Link>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-[#262626] bg-[#0A0A0A]">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-sm text-[#FAFAFA] hover:text-[#FAFAFA] font-medium transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  return (
    <header className="h-14 border-b border-[#262626] bg-[#0A0A0A] sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Smart Search */}
      <SmartSearch className="w-96" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <div className="w-8 h-8 rounded-full bg-[rgba(156,74,41,0.15)] flex items-center justify-center cursor-pointer hover:bg-[rgba(156,74,41,0.25)] transition-colors">
          <User className="w-4 h-4 text-[#FAFAFA]" />
        </div>
      </div>
    </header>
  );
}
