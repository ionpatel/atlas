"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 border-b border-[#2a2a2a] bg-[#1a1a1a]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-2.5 bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-2 w-80 focus-within:border-[#CDB49E]/40 transition-colors duration-200">
        <Search className="w-4 h-4 text-[#888888]" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
        />
        <kbd className="text-xs text-[#888888] bg-[#222222] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all duration-200 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#CDB49E] rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#3a3028] flex items-center justify-center">
          <User className="w-4 h-4 text-[#CDB49E]" />
        </div>
      </div>
    </header>
  );
}
