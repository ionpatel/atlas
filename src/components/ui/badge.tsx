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
          "border-red-200 bg-red-50 text-[#DC2626]": variant === "default",
          "border-[#E5E7EB] bg-[#F1F3F5] text-[#374151]": variant === "secondary",
          "border-red-200 bg-red-50 text-red-600": variant === "destructive",
          "border-[#E5E7EB] text-[#6B7280]": variant === "outline",
          "border-red-200 bg-red-50 text-[#DC2626]": variant === "gold",
          "border-emerald-200 bg-emerald-50 text-emerald-700": variant === "success",
          "border-amber-200 bg-amber-50 text-amber-700": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
