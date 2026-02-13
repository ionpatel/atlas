"use client";

import { useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS MODAL
   Shows all available keyboard shortcuts in the website builder
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
      { keys: ["⌘", "S"], description: "Save changes" },
      { keys: ["⌘", "P"], description: "Toggle preview mode" },
      { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Deselect element / Close modal" },
    ],
  },
  {
    title: "History",
    shortcuts: [
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⇧", "⌘", "Z"], description: "Redo" },
    ],
  },
  {
    title: "Elements",
    shortcuts: [
      { keys: ["⌘", "D"], description: "Duplicate selected element" },
      { keys: ["⌫"], description: "Delete selected element" },
      { keys: ["⌘", "C"], description: "Copy element" },
      { keys: ["⌘", "V"], description: "Paste element" },
    ],
  },
  {
    title: "Viewport",
    shortcuts: [
      { keys: ["⌘", "1"], description: "Desktop view" },
      { keys: ["⌘", "2"], description: "Tablet view" },
      { keys: ["⌘", "3"], description: "Mobile view" },
    ],
  },
  {
    title: "Panels",
    shortcuts: [
      { keys: ["⌘", "J"], description: "Open AI panel" },
      { keys: ["⌘", "["], description: "Toggle left panel" },
      { keys: ["⌘", "]"], description: "Toggle right panel" },
    ],
  },
  {
    title: "Import / Export",
    shortcuts: [
      { keys: ["⇧", "⌘", "E"], description: "Export project as JSON" },
      { keys: ["⇧", "⌘", "I"], description: "Import project from JSON" },
    ],
  },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
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
      <div className="relative w-full max-w-2xl bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-[#CDB49E]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-[#666]">Speed up your workflow</p>
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
            <span>Pro tip: Use ⌘K to quickly access any command</span>
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
