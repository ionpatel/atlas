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
          "border-transparent bg-[#CDB49E] text-[#111111]": variant === "default",
          "border-transparent bg-[#1a1a1a] text-[#f5f0eb]": variant === "secondary",
          "border-transparent bg-red-500/10 text-red-400": variant === "destructive",
          "border-[#2a2a2a] text-[#888888]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
