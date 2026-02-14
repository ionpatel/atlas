"use client";

import { Bell, User } from "lucide-react";
import { SmartSearch } from "./smart-search";

export function Header() {
  return (
    <header className="h-14 border-b border-[#D4CDB8] bg-[#E8E3CC] sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Smart Search */}
      <SmartSearch className="w-96" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#DDD7C0] transition-all duration-200 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9C4A29] rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[rgba(156,74,41,0.15)] flex items-center justify-center">
          <User className="w-4 h-4 text-[#9C4A29]" />
        </div>
      </div>
    </header>
  );
}
