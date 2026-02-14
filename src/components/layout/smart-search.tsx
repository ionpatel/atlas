"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Package,
  Users,
  FileText,
  User,
  ShoppingCart,
  FolderKanban,
  Settings,
  ArrowRight,
  Sparkles,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  smartSearch,
  getSearchSuggestions,
  type SearchResult,
} from "@/lib/smart-search";

const TYPE_ICONS: Record<string, typeof Package> = {
  product: Package,
  contact: Users,
  invoice: FileText,
  employee: User,
  order: ShoppingCart,
  project: FolderKanban,
  setting: Settings,
  action: ArrowRight,
  report: FileText,
};

function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = TYPE_ICONS[result.type] || Sparkles;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
        isSelected ? "bg-[#DDD7C0]" : "hover:bg-[#F5F2E8]"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          result.type === "action"
            ? "bg-[#9C4A29]/10"
            : "bg-[#DDD7C0]"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4",
            result.type === "action" ? "text-[#9C4A29]" : "text-[#6B5B4F]"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2D1810] truncate">
          {result.title}
        </p>
        {(result.subtitle || result.description) && (
          <p className="text-xs text-[#6B5B4F] truncate">
            {result.subtitle}
            {result.subtitle && result.description && " • "}
            {result.description}
          </p>
        )}
      </div>
      {result.type === "action" && (
        <ArrowRight className="w-4 h-4 text-[#8B7B6F]" />
      )}
    </button>
  );
}

export function SmartSearch({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("atlas-recent-searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search as user types
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setSuggestions(getSearchSuggestions(""));
        return;
      }

      setLoading(true);
      setSuggestions(getSearchSuggestions(query));

      try {
        const searchResults = await smartSearch(query);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle navigation
  const handleSelect = useCallback(
    (result: SearchResult) => {
      // Save to recent searches
      const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("atlas-recent-searches", JSON.stringify(newRecent));

      setIsOpen(false);
      setQuery("");
      router.push(result.href);
    },
    [query, recentSearches, router]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length || suggestions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case "Enter":
        e.preventDefault();
        if (results.length > 0) {
          handleSelect(results[selectedIndex]);
        } else if (suggestions.length > 0) {
          setQuery(suggestions[selectedIndex]);
        }
        break;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg hover:border-[#3a3a3a] transition-all",
          className
        )}
      >
        <Search className="w-4 h-4 text-[#6B5B4F]" />
        <span className="text-sm text-[#6B5B4F]">Search...</span>
        <div className="flex items-center gap-0.5 ml-2">
          <kbd className="px-1.5 py-0.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded text-[10px] text-[#8B7B6F]">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded text-[10px] text-[#8B7B6F]">
            K
          </kbd>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-[#E8E3CC] border border-[#D4CDB8] rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#D4CDB8]">
            {loading ? (
              <Loader2 className="w-5 h-5 text-[#9C4A29] animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#9C4A29]" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search anything... try 'overdue invoices' or 'low stock'"
              className="flex-1 bg-transparent text-[#2D1810] text-sm placeholder-[#8B7B6F] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 text-[#8B7B6F] hover:text-[#6B5B4F] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="px-2 py-1 bg-[#DDD7C0] border border-[#D4CDB8] rounded text-xs text-[#8B7B6F]">
              ESC
            </kbd>
          </div>

          {/* Results or Suggestions */}
          <div className="max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                <p className="px-4 py-2 text-[10px] font-medium text-[#8B7B6F] uppercase tracking-wider">
                  Results
                </p>
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelect(result)}
                  />
                ))}
              </div>
            ) : query ? (
              <div className="py-8 text-center">
                <Search className="w-10 h-10 text-[#8B7B6F] mx-auto mb-3" />
                <p className="text-sm text-[#6B5B4F]">No results found</p>
                <p className="text-xs text-[#8B7B6F] mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="py-2 border-b border-[#D4CDB8]">
                    <p className="px-4 py-2 text-[10px] font-medium text-[#8B7B6F] uppercase tracking-wider">
                      Recent
                    </p>
                    {recentSearches.map((search, index) => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                          "hover:bg-[#F5F2E8]"
                        )}
                      >
                        <Clock className="w-4 h-4 text-[#8B7B6F]" />
                        <span className="text-sm text-[#6B5B4F]">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                <div className="py-2">
                  <p className="px-4 py-2 text-[10px] font-medium text-[#8B7B6F] uppercase tracking-wider">
                    Try searching for
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => setQuery(suggestion)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                        index === selectedIndex ? "bg-[#DDD7C0]" : "hover:bg-[#F5F2E8]"
                      )}
                    >
                      <Search className="w-4 h-4 text-[#8B7B6F]" />
                      <span className="text-sm text-[#6B5B4F]">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#D4CDB8] bg-[#0d0d0d]">
            <div className="flex items-center gap-4 text-[10px] text-[#8B7B6F]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[#DDD7C0] rounded">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[#DDD7C0] rounded">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[#DDD7C0] rounded">esc</kbd> close
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#8B7B6F]">
              <Sparkles className="w-3 h-3 text-[#9C4A29]" />
              AI-powered search
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Mini search for header
export function MiniSearch({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isOpen) {
    return <SmartSearch />;
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg hover:border-[#3a3a3a] transition-all",
        className
      )}
    >
      <Search className="w-3.5 h-3.5 text-[#6B5B4F]" />
      <span className="text-xs text-[#8B7B6F] hidden sm:inline">⌘K</span>
    </button>
  );
}
