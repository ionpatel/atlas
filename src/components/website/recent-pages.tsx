"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Clock, FileText, Trash2, ExternalLink, MoreVertical, 
  FolderOpen, Calendar, Edit3, X
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   RECENT PAGES
   Shows recently edited pages with quick actions
   ═══════════════════════════════════════════════════════════════════════════ */

interface RecentPage {
  id: string;
  name: string;
  lastEdited: string; // ISO date string
  thumbnail?: string;
  template?: string;
  published?: boolean;
}

interface RecentPagesProps {
  pages: RecentPage[];
  currentPageId?: string;
  onOpenPage?: (page: RecentPage) => void;
  onDeletePage?: (pageId: string) => void;
  onRenamePage?: (pageId: string, newName: string) => void;
  maxItems?: number;
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentPages({
  pages,
  currentPageId,
  onOpenPage,
  onDeletePage,
  onRenamePage,
  maxItems = 5,
}: RecentPagesProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Sort by most recent and limit
  const sortedPages = useMemo(() => {
    return [...pages]
      .sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime())
      .slice(0, maxItems);
  }, [pages, maxItems]);

  const handleStartRename = useCallback((page: RecentPage) => {
    setEditingId(page.id);
    setEditName(page.name);
    setMenuOpen(null);
  }, []);

  const handleSaveRename = useCallback((pageId: string) => {
    if (editName.trim()) {
      onRenamePage?.(pageId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  }, [editName, onRenamePage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, pageId: string) => {
    if (e.key === "Enter") {
      handleSaveRename(pageId);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditName("");
    }
  }, [handleSaveRename]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setMenuOpen(null);
    if (menuOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [menuOpen]);

  if (sortedPages.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-xl bg-[#222] flex items-center justify-center mx-auto mb-3">
          <Clock className="w-5 h-5 text-[#555]" />
        </div>
        <p className="text-sm text-[#666]">No recent pages</p>
        <p className="text-xs text-[#444] mt-1">Your recently edited pages will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-[#888]">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">Recent Pages</span>
        </div>
        <span className="text-[10px] text-[#555]">{sortedPages.length} pages</span>
      </div>

      {/* Page List */}
      <div className="space-y-0.5">
        {sortedPages.map((page) => {
          const isCurrent = page.id === currentPageId;
          const isEditing = editingId === page.id;

          return (
            <div
              key={page.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                isCurrent 
                  ? "bg-[#CDB49E]/10 border border-[#CDB49E]/20" 
                  : "hover:bg-[#222] border border-transparent"
              )}
              onClick={() => !isEditing && onOpenPage?.(page)}
            >
              {/* Icon/Thumbnail */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                isCurrent ? "bg-[#CDB49E]/20" : "bg-[#222]"
              )}>
                {page.thumbnail ? (
                  <img 
                    src={page.thumbnail} 
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className={cn(
                    "w-4 h-4",
                    isCurrent ? "text-[#CDB49E]" : "text-[#666]"
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, page.id)}
                    onBlur={() => handleSaveRename(page.id)}
                    autoFocus
                    className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-sm text-white outline-none focus:border-[#CDB49E]"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className={cn(
                      "text-sm font-medium truncate",
                      isCurrent ? "text-[#CDB49E]" : "text-white"
                    )}>
                      {page.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#555]">
                      <span>{formatRelativeTime(page.lastEdited)}</span>
                      {page.template && (
                        <>
                          <span>•</span>
                          <span>{page.template}</span>
                        </>
                      )}
                      {page.published && (
                        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                          Live
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {!isEditing && (
                <div 
                  className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === page.id ? null : page.id);
                    }}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-[#333] transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpen === page.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-lg bg-[#1a1a1a] border border-[#333] shadow-xl z-50">
                      <button
                        onClick={() => {
                          onOpenPage?.(page);
                          setMenuOpen(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#222] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </button>
                      <button
                        onClick={() => handleStartRename(page)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#222] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Rename
                      </button>
                      <div className="h-px bg-[#333] my-1" />
                      <button
                        onClick={() => {
                          onDeletePage?.(page.id);
                          setMenuOpen(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {pages.length > maxItems && (
        <button className="w-full flex items-center justify-center gap-1 py-2 text-xs text-[#666] hover:text-[#CDB49E] transition-colors">
          <FolderOpen className="w-3 h-3" />
          View all {pages.length} pages
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RECENT PAGES HOOK
   Manages recent pages in localStorage
   ═══════════════════════════════════════════════════════════════════════════ */

const RECENT_PAGES_KEY = "atlas-recent-pages";
const MAX_RECENT_PAGES = 10;

export function useRecentPages() {
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_PAGES_KEY);
      if (stored) {
        setRecentPages(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent pages:", e);
    }
  }, []);

  // Save to localStorage
  const savePages = useCallback((pages: RecentPage[]) => {
    try {
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(pages));
    } catch (e) {
      console.error("Failed to save recent pages:", e);
    }
  }, []);

  // Add or update a page
  const addRecentPage = useCallback((page: Omit<RecentPage, "lastEdited"> & { lastEdited?: string }) => {
    setRecentPages(prev => {
      const updated: RecentPage = {
        ...page,
        lastEdited: page.lastEdited || new Date().toISOString(),
      };
      
      // Remove if exists, add to front
      const filtered = prev.filter(p => p.id !== page.id);
      const newList = [updated, ...filtered].slice(0, MAX_RECENT_PAGES);
      savePages(newList);
      return newList;
    });
  }, [savePages]);

  // Remove a page
  const removeRecentPage = useCallback((pageId: string) => {
    setRecentPages(prev => {
      const filtered = prev.filter(p => p.id !== pageId);
      savePages(filtered);
      return filtered;
    });
  }, [savePages]);

  // Rename a page
  const renameRecentPage = useCallback((pageId: string, newName: string) => {
    setRecentPages(prev => {
      const updated = prev.map(p => 
        p.id === pageId ? { ...p, name: newName } : p
      );
      savePages(updated);
      return updated;
    });
  }, [savePages]);

  // Clear all
  const clearRecentPages = useCallback(() => {
    setRecentPages([]);
    localStorage.removeItem(RECENT_PAGES_KEY);
  }, []);

  return {
    recentPages,
    addRecentPage,
    removeRecentPage,
    renameRecentPage,
    clearRecentPages,
  };
}
