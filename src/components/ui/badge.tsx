import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-[#9C4A29] text-[#E8E3CC]": variant === "default",
          "border-transparent bg-[#F5F2E8] text-[#2D1810]": variant === "secondary",
          "border-transparent bg-red-500/10 text-red-400": variant === "destructive",
          "border-[#D4CDB8] text-[#6B5B4F]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
