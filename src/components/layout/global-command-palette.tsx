"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, LayoutGrid, Package, FileText, ShoppingCart,
  Truck, Users, Settings, Calculator, Target, UserCircle, FolderKanban,
  Wallet, Store, Globe, Command, ArrowRight, Plus, LogOut, Moon, Sun,
  HelpCircle, Keyboard, Bell, User, Building2, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL COMMAND PALETTE (Cmd+K / Ctrl+K)
   Spotlight-style command palette for the entire Atlas dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  category: "navigation" | "actions" | "create" | "settings" | "help";
  action: () => void;
  keywords?: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "Navigation",
  actions: "Quick Actions",
  create: "Create New",
  settings: "Settings",
  help: "Help",
};

const CATEGORY_ORDER = ["actions", "navigation", "create", "settings", "help"];

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onShowShortcuts: () => void;
}

export function GlobalCommandPalette({
  isOpen,
  onClose,
  onShowShortcuts,
}: GlobalCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Navigation helper
  const navigateTo = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    return [
      // Quick Actions
      {
        id: "search",
        label: "Search Everything",
        description: "Find anything in Atlas",
        icon: Search,
        category: "actions",
        action: () => {},
        keywords: ["search", "find", "lookup"],
      },

      // Navigation
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        description: "Overview and analytics",
        icon: LayoutDashboard,
        shortcut: "G D",
        category: "navigation",
        action: () => navigateTo("/dashboard"),
        keywords: ["dashboard", "home", "overview"],
      },
      {
        id: "nav-apps",
        label: "Go to Apps",
        description: "All applications",
        icon: LayoutGrid,
        shortcut: "G A",
        category: "navigation",
        action: () => navigateTo("/apps"),
        keywords: ["apps", "applications", "modules"],
      },
      {
        id: "nav-pos",
        label: "Go to Point of Sale",
        description: "POS terminal",
        icon: Store,
        category: "navigation",
        action: () => navigateTo("/pos"),
        keywords: ["pos", "point of sale", "register", "checkout"],
      },
      {
        id: "nav-inventory",
        label: "Go to Inventory",
        description: "Products and stock",
        icon: Package,
        category: "navigation",
        action: () => navigateTo("/inventory"),
        keywords: ["inventory", "stock", "products", "warehouse"],
      },
      {
        id: "nav-invoices",
        label: "Go to Invoices",
        description: "Billing and invoices",
        icon: FileText,
        category: "navigation",
        action: () => navigateTo("/invoices"),
        keywords: ["invoices", "bills", "billing"],
      },
      {
        id: "nav-sales",
        label: "Go to Sales",
        description: "Sales orders",
        icon: ShoppingCart,
        category: "navigation",
        action: () => navigateTo("/sales"),
        keywords: ["sales", "orders", "revenue"],
      },
      {
        id: "nav-purchase",
        label: "Go to Purchase",
        description: "Purchase orders",
        icon: Truck,
        category: "navigation",
        action: () => navigateTo("/purchase"),
        keywords: ["purchase", "orders", "suppliers", "procurement"],
      },
      {
        id: "nav-accounting",
        label: "Go to Accounting",
        description: "Financial records",
        icon: Calculator,
        category: "navigation",
        action: () => navigateTo("/accounting"),
        keywords: ["accounting", "finance", "ledger", "journal"],
      },
      {
        id: "nav-contacts",
        label: "Go to Contacts",
        description: "Customers and vendors",
        icon: Users,
        category: "navigation",
        action: () => navigateTo("/contacts"),
        keywords: ["contacts", "customers", "vendors", "suppliers"],
      },
      {
        id: "nav-crm",
        label: "Go to CRM",
        description: "Customer relationships",
        icon: Target,
        category: "navigation",
        action: () => navigateTo("/crm"),
        keywords: ["crm", "leads", "opportunities", "pipeline"],
      },
      {
        id: "nav-employees",
        label: "Go to Employees",
        description: "Team management",
        icon: UserCircle,
        category: "navigation",
        action: () => navigateTo("/employees"),
        keywords: ["employees", "staff", "team", "hr"],
      },
      {
        id: "nav-payroll",
        label: "Go to Payroll",
        description: "Salaries and payments",
        icon: Wallet,
        category: "navigation",
        action: () => navigateTo("/payroll"),
        keywords: ["payroll", "salaries", "wages", "payments"],
      },
      {
        id: "nav-projects",
        label: "Go to Projects",
        description: "Project management",
        icon: FolderKanban,
        category: "navigation",
        action: () => navigateTo("/projects"),
        keywords: ["projects", "tasks", "kanban", "management"],
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        description: "App configuration",
        icon: Settings,
        category: "navigation",
        action: () => navigateTo("/settings"),
        keywords: ["settings", "preferences", "config"],
      },

      // Create New
      {
        id: "create-invoice",
        label: "Create Invoice",
        description: "New customer invoice",
        icon: Plus,
        shortcut: "C I",
        category: "create",
        action: () => navigateTo("/invoices?action=new"),
        keywords: ["create", "new", "invoice", "bill"],
      },
      {
        id: "create-sales-order",
        label: "Create Sales Order",
        description: "New sales order",
        icon: Plus,
        shortcut: "C S",
        category: "create",
        action: () => navigateTo("/sales?action=new"),
        keywords: ["create", "new", "sales", "order"],
      },
      {
        id: "create-purchase-order",
        label: "Create Purchase Order",
        description: "New purchase order",
        icon: Plus,
        shortcut: "C P",
        category: "create",
        action: () => navigateTo("/purchase?action=new"),
        keywords: ["create", "new", "purchase", "order"],
      },
      {
        id: "create-contact",
        label: "Create Contact",
        description: "New customer or vendor",
        icon: Plus,
        shortcut: "C C",
        category: "create",
        action: () => navigateTo("/contacts?action=new"),
        keywords: ["create", "new", "contact", "customer", "vendor"],
      },
      {
        id: "create-product",
        label: "Create Product",
        description: "New inventory item",
        icon: Plus,
        category: "create",
        action: () => navigateTo("/inventory?action=new"),
        keywords: ["create", "new", "product", "item", "inventory"],
      },
      {
        id: "create-project",
        label: "Create Project",
        description: "New project",
        icon: Plus,
        category: "create",
        action: () => navigateTo("/projects?action=new"),
        keywords: ["create", "new", "project"],
      },

      // Settings
      {
        id: "settings-profile",
        label: "Profile Settings",
        description: "Your account settings",
        icon: User,
        category: "settings",
        action: () => navigateTo("/settings?tab=profile"),
        keywords: ["profile", "account", "user"],
      },
      {
        id: "settings-organization",
        label: "Organization Settings",
        description: "Company settings",
        icon: Building2,
        category: "settings",
        action: () => navigateTo("/settings?tab=organization"),
        keywords: ["organization", "company", "business"],
      },
      {
        id: "settings-billing",
        label: "Billing Settings",
        description: "Subscription and payments",
        icon: CreditCard,
        category: "settings",
        action: () => navigateTo("/settings?tab=billing"),
        keywords: ["billing", "subscription", "payment"],
      },
      {
        id: "settings-notifications",
        label: "Notification Settings",
        description: "Alert preferences",
        icon: Bell,
        category: "settings",
        action: () => navigateTo("/settings?tab=notifications"),
        keywords: ["notifications", "alerts", "email"],
      },

      // Help
      {
        id: "help-shortcuts",
        label: "Keyboard Shortcuts",
        description: "View all shortcuts",
        icon: Keyboard,
        shortcut: "?",
        category: "help",
        action: () => { onClose(); setTimeout(onShowShortcuts, 100); },
        keywords: ["shortcuts", "keyboard", "keys", "hotkeys"],
      },
      {
        id: "help-docs",
        label: "Documentation",
        description: "Help and guides",
        icon: HelpCircle,
        category: "help",
        action: () => window.open("https://docs.atlas-erp.com", "_blank"),
        keywords: ["help", "docs", "documentation", "guide"],
      },
      {
        id: "logout",
        label: "Sign Out",
        description: "Log out of Atlas",
        icon: LogOut,
        category: "help",
        action: () => navigateTo("/login"),
        keywords: ["logout", "sign out", "exit"],
      },
    ];
  }, [navigateTo, onClose, onShowShortcuts]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => {
      const matchLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
      const matchDesc = cmd.description?.toLowerCase().includes(lowerQuery);
      return matchLabel || matchKeywords || matchDesc;
    });
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const items: CommandItem[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (groupedCommands[cat]) items.push(...groupedCommands[cat]);
    }
    return items;
  }, [groupedCommands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatList[selectedIndex]) {
      e.preventDefault();
      flatList[selectedIndex].action();
      onClose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, flatList, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current && flatList[selectedIndex]) {
      const item = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, flatList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#333]">
          <Search className="w-5 h-5 text-[#666]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search commands, pages, actions..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-[#666] outline-none"
          />
          <div className="flex items-center gap-1 text-[10px] text-[#666]">
            <kbd className="px-1.5 py-0.5 rounded bg-[#222] border border-[#333]">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#666] text-sm">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {CATEGORY_ORDER.map(category => {
                const items = groupedCommands[category];
                if (!items || items.length === 0) return null;
                return (
                  <div key={category}>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    {items.map((cmd) => {
                      const idx = flatList.indexOf(cmd);
                      const isSelected = idx === selectedIndex;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          data-index={idx}
                          onClick={() => { cmd.action(); onClose(); }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isSelected ? "bg-[#CDB49E]/10" : "hover:bg-[#222]"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isSelected ? "bg-[#CDB49E]/20 text-[#CDB49E]" : "bg-[#222] text-[#888]"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "text-sm font-medium truncate",
                              isSelected ? "text-[#CDB49E]" : "text-white"
                            )}>
                              {cmd.label}
                            </div>
                            {cmd.description && (
                              <div className="text-xs text-[#666] truncate">{cmd.description}</div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <div className="text-[10px] text-[#555] font-mono shrink-0">
                              {cmd.shortcut}
                            </div>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-[#CDB49E] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#333] flex items-center justify-between text-[10px] text-[#555]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[#222] border border-[#333]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[#222] border border-[#333]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  );
}
