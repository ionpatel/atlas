import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "gold" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-[#CDB49E]/20 bg-[#CDB49E]/10 text-[#CDB49E]": variant === "default",
          "border-[#333] bg-[#1A1A1A] text-[#ccc]": variant === "secondary",
          "border-red-500/20 bg-red-500/10 text-red-400": variant === "destructive",
          "border-[#333] text-[#999]": variant === "outline",
          "border-[#CDB49E]/30 bg-[#CDB49E]/15 text-[#CDB49E]": variant === "gold",
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400": variant === "success",
          "border-amber-500/20 bg-amber-500/10 text-amber-400": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
