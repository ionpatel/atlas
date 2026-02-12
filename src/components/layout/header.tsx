"use client";

import { Bell, Search, User } from "lucide-react";

export function Header() {
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
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
