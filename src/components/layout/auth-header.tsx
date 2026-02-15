"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SmartSearch } from "@/components/smart-search";

interface UserInfo { email: string; fullName: string; avatarUrl: string | null; orgName: string | null; role: string | null; }

export function AuthHeader({ userInfo }: { userInfo: UserInfo }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = userInfo.fullName
    ? userInfo.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userInfo.email[0].toUpperCase();

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white sticky top-0 z-10 flex items-center justify-between px-8">
      <SmartSearch />
      <div className="flex items-center gap-4">
        {userInfo.orgName && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#6B7280] bg-[#F1F3F5] border border-[#E5E7EB] px-3 py-1.5 rounded-lg">
            <Building2 className="w-3 h-3 text-[#DC2626]" />
            <span>{userInfo.orgName}</span>
          </div>
        )}
        <button className="p-2.5 rounded-lg hover:bg-[#F1F3F5] text-[#6B7280] hover:text-[#111827] transition-all duration-200 relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
        </button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3 hover:bg-[#F1F3F5] rounded-lg px-3 py-2 transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-xs font-semibold text-[#DC2626]">{initials}</div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[#111827] leading-tight">{userInfo.fullName || userInfo.email}</p>
              {userInfo.role && <p className="text-[11px] text-[#6B7280] capitalize">{userInfo.role}</p>}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-float py-1 z-50">
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <p className="text-sm font-medium text-[#111827]">{userInfo.fullName || "User"}</p>
                <p className="text-xs text-[#6B7280] truncate mt-0.5">{userInfo.email}</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-all">
                <User className="w-4 h-4" />Profile
              </button>
              <button onClick={async () => { setMenuOpen(false); await logout(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
