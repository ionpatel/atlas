"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { GlobalCommandPalette } from "./global-command-palette";
import { GlobalKeyboardShortcuts } from "./global-keyboard-shortcuts";

/* ═══════════════════════════════════════════════════════════════════════════
   KEYBOARD PROVIDER
   Handles global keyboard shortcuts for the Atlas dashboard
   - Cmd/Ctrl+K: Open command palette
   - ?: Open keyboard shortcuts modal
   ═══════════════════════════════════════════════════════════════════════════ */

interface KeyboardContextType {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  isCommandPaletteOpen: boolean;
  isShortcutsOpen: boolean;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("useKeyboard must be used within a KeyboardProvider");
  }
  return context;
}

interface KeyboardProviderProps {
  children: ReactNode;
}

export function KeyboardProvider({ children }: KeyboardProviderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);
  const openShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setIsShortcutsOpen(false), []);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || 
                       target.tagName === "TEXTAREA" || 
                       target.isContentEditable;

      // Cmd/Ctrl + K: Open command palette (works everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // Don't handle other shortcuts if typing
      if (isTyping) return;

      // ?: Open keyboard shortcuts (only when not typing)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = {
    openCommandPalette,
    closeCommandPalette,
    openShortcuts,
    closeShortcuts,
    isCommandPaletteOpen,
    isShortcutsOpen,
  };

  return (
    <KeyboardContext.Provider value={value}>
      {children}
      <GlobalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        onShowShortcuts={openShortcuts}
      />
      <GlobalKeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={closeShortcuts}
      />
    </KeyboardContext.Provider>
  );
}
