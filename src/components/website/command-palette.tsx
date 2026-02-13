"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search, File, Plus, Settings, Eye, Save, Undo2, Redo2, Copy, Trash2,
  Layout, Image, Type, Zap, Palette, Globe, Code, FileText, Command,
  Keyboard, HelpCircle, Moon, Sun, Monitor, Smartphone, Tablet, X,
  Upload, Download, Users, MessageSquare, ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   COMMAND PALETTE (Cmd+K / Ctrl+K)
   Quick actions for the website builder - Spotlight-style command palette
   ═══════════════════════════════════════════════════════════════════════════ */

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  category: "navigation" | "actions" | "components" | "settings" | "help";
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent?: (type: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onOpenSettings?: (panel: string) => void;
  onSetDevice?: (device: "desktop" | "tablet" | "mobile") => void;
  onToggleTheme?: () => void;
  onShowShortcuts?: () => void;
  onShowOnboarding?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onOpenAI?: () => void;
  currentTheme?: "dark" | "light";
  selectedElementId?: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "Navigation",
  actions: "Actions",
  components: "Add Component",
  settings: "Settings",
  help: "Help",
};

const CATEGORY_ORDER = ["actions", "navigation", "components", "settings", "help"];

export function CommandPalette({
  isOpen,
  onClose,
  onAddComponent,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onDuplicate,
  onDelete,
  onOpenSettings,
  onSetDevice,
  onToggleTheme,
  onShowShortcuts,
  onShowOnboarding,
  onExport,
  onImport,
  onOpenAI,
  currentTheme = "dark",
  selectedElementId,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Actions
      { id: "save", label: "Save", description: "Save your changes", icon: Save, shortcut: "⌘S", category: "actions", action: () => onSave?.(), keywords: ["save", "store"] },
      { id: "undo", label: "Undo", description: "Undo last action", icon: Undo2, shortcut: "⌘Z", category: "actions", action: () => onUndo?.(), keywords: ["undo", "revert"] },
      { id: "redo", label: "Redo", description: "Redo last action", icon: Redo2, shortcut: "⇧⌘Z", category: "actions", action: () => onRedo?.(), keywords: ["redo", "restore"] },
      { id: "preview", label: "Toggle Preview", description: "Preview your website", icon: Eye, shortcut: "⌘P", category: "actions", action: () => onPreview?.(), keywords: ["preview", "view"] },
      { id: "export", label: "Export Project", description: "Export as JSON", icon: Download, shortcut: "⇧⌘E", category: "actions", action: () => onExport?.(), keywords: ["export", "download", "json"] },
      { id: "import", label: "Import Project", description: "Import from JSON", icon: Upload, shortcut: "⇧⌘I", category: "actions", action: () => onImport?.(), keywords: ["import", "upload", "load"] },
      { id: "ai", label: "AI Assistant", description: "Generate content with AI", icon: Sparkles, shortcut: "⌘J", category: "actions", action: () => onOpenAI?.(), keywords: ["ai", "generate", "assistant"] },

      // Element actions (conditional)
      ...(selectedElementId ? [
        { id: "duplicate", label: "Duplicate Element", description: "Copy selected element", icon: Copy, shortcut: "⌘D", category: "actions" as const, action: () => onDuplicate?.(), keywords: ["duplicate", "copy", "clone"] },
        { id: "delete", label: "Delete Element", description: "Remove selected element", icon: Trash2, shortcut: "⌫", category: "actions" as const, action: () => onDelete?.(), keywords: ["delete", "remove", "trash"] },
      ] : []),

      // Navigation / Device
      { id: "desktop", label: "Desktop View", description: "Switch to desktop preview", icon: Monitor, category: "navigation", action: () => onSetDevice?.("desktop"), keywords: ["desktop", "large", "screen"] },
      { id: "tablet", label: "Tablet View", description: "Switch to tablet preview", icon: Tablet, category: "navigation", action: () => onSetDevice?.("tablet"), keywords: ["tablet", "ipad", "medium"] },
      { id: "mobile", label: "Mobile View", description: "Switch to mobile preview", icon: Smartphone, category: "navigation", action: () => onSetDevice?.("mobile"), keywords: ["mobile", "phone", "small"] },

      // Components
      { id: "add-hero", label: "Add Hero Section", icon: Zap, category: "components", action: () => onAddComponent?.("hero"), keywords: ["hero", "banner", "header"] },
      { id: "add-navbar", label: "Add Navbar", icon: Layout, category: "components", action: () => onAddComponent?.("navbar"), keywords: ["nav", "menu", "navigation"] },
      { id: "add-footer", label: "Add Footer", icon: Layout, category: "components", action: () => onAddComponent?.("footer"), keywords: ["footer", "bottom"] },
      { id: "add-heading", label: "Add Heading", icon: Type, category: "components", action: () => onAddComponent?.("heading"), keywords: ["heading", "title", "h1"] },
      { id: "add-text", label: "Add Text", icon: FileText, category: "components", action: () => onAddComponent?.("text"), keywords: ["text", "paragraph", "content"] },
      { id: "add-image", label: "Add Image", icon: Image, category: "components", action: () => onAddComponent?.("image"), keywords: ["image", "photo", "picture"] },
      { id: "add-button", label: "Add Button", icon: Zap, category: "components", action: () => onAddComponent?.("button"), keywords: ["button", "cta", "click"] },
      { id: "add-features", label: "Add Features Grid", icon: Layout, category: "components", action: () => onAddComponent?.("features3"), keywords: ["features", "grid", "cards"] },
      { id: "add-testimonials", label: "Add Testimonials", icon: MessageSquare, category: "components", action: () => onAddComponent?.("testimonials"), keywords: ["testimonials", "reviews", "quotes"] },
      { id: "add-pricing", label: "Add Pricing Table", icon: Layout, category: "components", action: () => onAddComponent?.("pricing3"), keywords: ["pricing", "plans", "money"] },
      { id: "add-cta", label: "Add Call to Action", icon: Zap, category: "components", action: () => onAddComponent?.("cta"), keywords: ["cta", "action", "convert"] },
      { id: "add-contact", label: "Add Contact Form", icon: MessageSquare, category: "components", action: () => onAddComponent?.("contactForm"), keywords: ["contact", "form", "email"] },

      // Settings
      { id: "seo", label: "SEO Settings", description: "Meta tags & social sharing", icon: Globe, category: "settings", action: () => onOpenSettings?.("seo"), keywords: ["seo", "meta", "search"] },
      { id: "styles", label: "Style Presets", description: "Global styling options", icon: Palette, category: "settings", action: () => onOpenSettings?.("styles"), keywords: ["style", "design", "preset"] },
      { id: "code", label: "Code Injection", description: "Add custom scripts", icon: Code, category: "settings", action: () => onOpenSettings?.("code"), keywords: ["code", "script", "custom"] },
      { id: "integrations", label: "Integrations", description: "Connect external services", icon: Settings, category: "settings", action: () => onOpenSettings?.("integrations"), keywords: ["integrations", "connect", "api"] },
      { id: "domain", label: "Domain Settings", description: "Custom domain setup", icon: Globe, category: "settings", action: () => onOpenSettings?.("domain"), keywords: ["domain", "url", "dns"] },
      { id: "toggle-theme", label: currentTheme === "dark" ? "Light Mode" : "Dark Mode", description: "Toggle theme", icon: currentTheme === "dark" ? Sun : Moon, category: "settings", action: () => onToggleTheme?.(), keywords: ["theme", "dark", "light", "mode"] },

      // Help
      { id: "shortcuts", label: "Keyboard Shortcuts", description: "View all shortcuts", icon: Keyboard, shortcut: "⌘/", category: "help", action: () => onShowShortcuts?.(), keywords: ["shortcuts", "keyboard", "keys"] },
      { id: "tour", label: "Getting Started Tour", description: "Take the onboarding tour", icon: HelpCircle, category: "help", action: () => onShowOnboarding?.(), keywords: ["tour", "help", "onboarding", "guide"] },
    ];
    return items;
  }, [selectedElementId, currentTheme, onSave, onUndo, onRedo, onPreview, onExport, onImport, onOpenAI, onDuplicate, onDelete, onSetDevice, onAddComponent, onOpenSettings, onToggleTheme, onShowShortcuts, onShowOnboarding]);

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
            placeholder="Search commands..."
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
              No commands found for "{query}"
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
