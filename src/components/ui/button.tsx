import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#DC2626] text-white shadow-sm hover:bg-[#B91C1C] active:bg-[#991B1B]": variant === "default",
            "bg-red-50 text-[#DC2626] shadow-sm hover:bg-red-100 active:bg-red-200": variant === "destructive",
            "border border-[#D1D5DB] bg-white text-[#374151] shadow-sm hover:bg-[#F1F3F5] hover:text-[#111827] hover:border-[#9CA3AF]": variant === "outline",
            "bg-[#F1F3F5] text-[#374151] shadow-sm hover:bg-[#E5E7EB] hover:text-[#111827]": variant === "secondary",
            "text-[#6B7280] hover:bg-[#F1F3F5] hover:text-[#111827]": variant === "ghost",
            "text-[#DC2626] underline-offset-4 hover:underline hover:text-[#B91C1C]": variant === "link",
            "bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white font-semibold shadow-md hover:from-[#B91C1C] hover:to-[#991B1B]": variant === "gold",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-lg px-8 text-base": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
