"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut, User, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

  // Close menu on outside click
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
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-80">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
        />
        <kbd className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Org badge */}
        {userInfo.orgName && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
            <Building2 className="w-3 h-3" />
            <span>{userInfo.orgName}</span>
          </div>
        )}

        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-tight">
                {userInfo.fullName || userInfo.email}
              </p>
              {userInfo.role && (
                <p className="text-xs text-muted-foreground capitalize">
                  {userInfo.role}
                </p>
              )}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">
                  {userInfo.fullName || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userInfo.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-muted transition-colors"
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
