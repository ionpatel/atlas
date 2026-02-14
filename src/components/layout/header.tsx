"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 border-b border-[#D4CDB8] bg-[#F5F2E8]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-2.5 bg-[#E8E3CC] border border-[#D4CDB8] rounded-lg px-4 py-2 w-80 focus-within:border-[#9C4A29]/40 transition-colors duration-200">
        <Search className="w-4 h-4 text-[#6B5B4F]" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm w-full text-[#2D1810] placeholder:text-[#6B5B4F]/60"
        />
        <kbd className="text-xs text-[#6B5B4F] bg-[#DDD7C0] px-1.5 py-0.5 rounded border border-[#D4CDB8]">
          ⌘K
        </kbd>
      </div>

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
