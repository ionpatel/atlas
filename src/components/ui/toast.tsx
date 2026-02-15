"use client";

import { create } from "zustand";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (messageOrOptions: string | { message: string; type?: ToastType }, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (messageOrOptions, typeArg = "success") => {
    const message = typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message;
    const type = typeof messageOrOptions === 'string' ? typeArg : (messageOrOptions.type || "success");
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorClasses = {
  success: "border-emerald-500/20 bg-white text-emerald-400",
  error: "border-red-500/20 bg-white text-red-400",
  info: "border-[#D1D5DB]/20 bg-white text-[#DC2626]",
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl shadow-black/30 animate-in slide-in-from-right-full duration-300",
        colorClasses[toast.type]
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium flex-1 text-[#111827]">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded-lg hover:bg-[#F1F3F5] transition-colors text-[#9CA3AF] hover:text-[#111827]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
