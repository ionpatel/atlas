"use client";

import React, { useCallback, useEffect, useRef } from "react";

/**
 * Trap focus within a container for accessibility (modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore focus to previously focused element
      previouslyFocused?.focus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Handle keyboard navigation for lists/grids
 */
export function useArrowNavigation(
  itemsCount: number,
  onSelect: (index: number) => void,
  options: {
    loop?: boolean;
    orientation?: "vertical" | "horizontal" | "both";
    columns?: number;
  } = {}
) {
  const { loop = true, orientation = "vertical", columns = 1 } = options;
  const currentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = currentIndex.current;
      let handled = false;

      switch (e.key) {
        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            newIndex += columns;
            handled = true;
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            newIndex -= columns;
            handled = true;
          }
          break;
        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            newIndex += 1;
            handled = true;
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            newIndex -= 1;
            handled = true;
          }
          break;
        case "Home":
          newIndex = 0;
          handled = true;
          break;
        case "End":
          newIndex = itemsCount - 1;
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();

        if (loop) {
          newIndex = ((newIndex % itemsCount) + itemsCount) % itemsCount;
        } else {
          newIndex = Math.max(0, Math.min(itemsCount - 1, newIndex));
        }

        currentIndex.current = newIndex;
        onSelect(newIndex);
      }
    },
    [itemsCount, onSelect, loop, orientation, columns]
  );

  const setCurrentIndex = useCallback((index: number) => {
    currentIndex.current = index;
  }, []);

  return { handleKeyDown, setCurrentIndex };
}

/**
 * Announce messages to screen readers
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.setAttribute("role", priority === "assertive" ? "alert" : "status");
    announcement.className = "sr-only";
    announcement.style.cssText =
      "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;";

    document.body.appendChild(announcement);

    // Delay to ensure screen readers catch the update
    setTimeout(() => {
      announcement.textContent = message;
    }, 100);

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({ href = "#main-content", children = "Skip to main content" }: { href?: string; children?: React.ReactNode }) {
  return React.createElement(
    "a",
    {
      href,
      className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#DC2626] focus:text-[#111] focus:rounded-lg focus:font-medium focus:text-sm focus:shadow-lg",
    },
    children
  );
}

/**
 * Live region for dynamic content updates
 */
export function useLiveRegion(priority: "polite" | "assertive" = "polite") {
  const regionRef = useRef<HTMLDivElement>(null);

  const setMessage = useCallback((message: string) => {
    if (regionRef.current) {
      // Clear and set to trigger announcement
      regionRef.current.textContent = "";
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 50);
    }
  }, []);

  const LiveRegion = useCallback(
    () =>
      React.createElement("div", {
        ref: regionRef,
        "aria-live": priority,
        "aria-atomic": "true",
        role: priority === "assertive" ? "alert" : "status",
        className: "sr-only",
      }),
    [priority]
  );

  return { LiveRegion, setMessage };
}

/**
 * ARIA description for complex components
 */
export function getAriaDescription(type: string): string {
  const descriptions: Record<string, string> = {
    hero: "Hero section with headline and call to action",
    features: "Features grid showcasing key benefits",
    pricing: "Pricing plans comparison table",
    testimonials: "Customer testimonials and reviews",
    contact: "Contact form and information",
    gallery: "Image gallery with lightbox",
    faq: "Frequently asked questions accordion",
    navbar: "Main navigation menu",
    footer: "Site footer with links and information",
    carousel: "Image carousel with navigation controls",
    modal: "Dialog window, press Escape to close",
    accordion: "Expandable content sections, use Enter or Space to toggle",
    tabs: "Tab panel, use arrow keys to navigate between tabs",
    form: "Interactive form, tab through fields to complete",
  };

  return descriptions[type] || `${type} component`;
}
