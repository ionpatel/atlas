"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SmartSearch } from "@/components/smart-search";

interface UserInfo {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  orgName: string | null;
  role: string | null;
}

export function AuthHeader({ userInfo }: { userInfo: UserInfo }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = userInfo.fullName
    ? userInfo.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userInfo.email[0].toUpperCase();

  return (
    <header className="h-16 border-b border-[#1a1a1a] bg-[#111111] sticky top-0 z-10 flex items-center justify-between px-8">
      {/* Smart Search */}
      <SmartSearch />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Org badge */}
        {userInfo.orgName && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#888888] bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg">
            <Building2 className="w-3 h-3" />
            <span>{userInfo.orgName}</span>
          </div>
        )}

        {/* Notifications */}
        <button className="p-2.5 rounded-lg hover:bg-[#1a1a1a] text-[#888888] hover:text-[#f5f0eb] transition-all duration-200 relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#CDB49E] rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 hover:bg-[#1a1a1a] rounded-lg px-3 py-2 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-[#3a3028] flex items-center justify-center text-xs font-semibold text-[#CDB49E]">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[#f5f0eb] leading-tight">
                {userInfo.fullName || userInfo.email}
              </p>
              {userInfo.role && (
                <p className="text-[11px] text-[#888888] capitalize">
                  {userInfo.role}
                </p>
              )}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/40 py-1 z-50">
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <p className="text-sm font-medium text-[#f5f0eb]">
                  {userInfo.fullName || "User"}
                </p>
                <p className="text-xs text-[#888888] truncate mt-0.5">
                  {userInfo.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-[#222222] transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
