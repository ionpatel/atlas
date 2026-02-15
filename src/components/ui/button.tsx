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
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDB49E]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#CDB49E] text-[#0A0A0A] shadow-lg shadow-[#CDB49E]/10 hover:bg-[#E8D5B7] active:bg-[#B89B78]": variant === "default",
            "bg-red-500/90 text-white shadow-sm hover:bg-red-500 active:bg-red-600": variant === "destructive",
            "border border-[#333] bg-transparent text-[#ccc] shadow-sm hover:bg-[#1A1A1A] hover:text-[#FAFAFA] hover:border-[#444]": variant === "outline",
            "bg-[#1A1A1A] text-[#ccc] shadow-sm hover:bg-[#262626] hover:text-[#FAFAFA]": variant === "secondary",
            "text-[#999] hover:bg-[#1A1A1A] hover:text-[#FAFAFA]": variant === "ghost",
            "text-[#CDB49E] underline-offset-4 hover:underline hover:text-[#E8D5B7]": variant === "link",
            "bg-gradient-to-r from-[#CDB49E] to-[#B89B78] text-[#0A0A0A] font-semibold shadow-lg shadow-[#CDB49E]/15 hover:shadow-[#CDB49E]/25 hover:from-[#E8D5B7] hover:to-[#CDB49E] active:from-[#B89B78] active:to-[#9A8670]": variant === "gold",
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
