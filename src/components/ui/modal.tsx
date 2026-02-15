"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, children, className, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#262626] flex-shrink-0">
            <h2 className="text-base font-semibold text-[#FAFAFA]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
