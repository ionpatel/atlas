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
          "border-transparent bg-[#273B3A] text-[#E6D4C7]": variant === "default",
          "border-transparent bg-[#E6D4C7] text-[#273B3A]": variant === "secondary",
          "border-transparent bg-red-500/10 text-red-400": variant === "destructive",
          "border-[#E6D4C7] text-[#273B3A]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
