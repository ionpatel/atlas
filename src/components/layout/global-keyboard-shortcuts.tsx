"use client";

import { useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL KEYBOARD SHORTCUTS MODAL
   Shows all available keyboard shortcuts across the Atlas dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close modal / Cancel" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "A"], description: "Go to Apps" },
      { keys: ["G", "I"], description: "Go to Inventory" },
      { keys: ["G", "S"], description: "Go to Sales" },
      { keys: ["G", "P"], description: "Go to Purchase" },
      { keys: ["G", "C"], description: "Go to Contacts" },
      { keys: ["G", "T"], description: "Go to Settings" },
    ],
  },
  {
    title: "Create New",
    shortcuts: [
      { keys: ["C", "I"], description: "Create Invoice" },
      { keys: ["C", "S"], description: "Create Sales Order" },
      { keys: ["C", "P"], description: "Create Purchase Order" },
      { keys: ["C", "C"], description: "Create Contact" },
    ],
  },
  {
    title: "Tables & Lists",
    shortcuts: [
      { keys: ["↑", "↓"], description: "Navigate rows" },
      { keys: ["Enter"], description: "Open selected item" },
      { keys: ["⌘", "F"], description: "Search / Filter" },
      { keys: ["/"], description: "Focus search" },
    ],
  },
  {
    title: "Forms & Editing",
    shortcuts: [
      { keys: ["⌘", "S"], description: "Save changes" },
      { keys: ["⌘", "Enter"], description: "Submit form" },
      { keys: ["Tab"], description: "Next field" },
      { keys: ["⇧", "Tab"], description: "Previous field" },
    ],
  },
  {
    title: "Website Builder",
    shortcuts: [
      { keys: ["⌘", "P"], description: "Toggle preview" },
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⇧", "⌘", "Z"], description: "Redo" },
      { keys: ["⌘", "D"], description: "Duplicate element" },
      { keys: ["⌫"], description: "Delete element" },
      { keys: ["⌘", "J"], description: "AI Assistant" },
    ],
  },
];

interface GlobalKeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalKeyboardShortcuts({ isOpen, onClose }: GlobalKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-[#E6D4C7] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#273B3A]/10 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-[#273B3A]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-[#666]">Navigate Atlas faster with keyboard shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-white hover:bg-[#333] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#111] border border-[#222]"
                    >
                      <span className="text-sm text-[#ccc]">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd
                            key={i}
                            className={cn(
                              "px-2 py-1 rounded text-xs font-mono",
                              "bg-[#222] border border-[#333] text-[#888]",
                              "min-w-[24px] text-center"
                            )}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#333] bg-[#111]">
          <div className="flex items-center justify-between text-xs text-[#666]">
            <span>Pro tip: Press <kbd className="px-1.5 py-0.5 mx-1 rounded bg-[#222] border border-[#333]">⌘</kbd><kbd className="px-1.5 py-0.5 rounded bg-[#222] border border-[#333]">K</kbd> to quickly access any command</span>
            <span className="flex items-center gap-2">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#222] border border-[#333]">ESC</kbd>
              <span>to close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
