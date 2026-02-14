import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#9C4A29] text-[#E8E3CC] shadow hover:bg-[#B85A35]": variant === "default",
            "bg-red-500 text-white shadow-sm hover:bg-red-500/90": variant === "destructive",
            "border border-[#D4CDB8] bg-transparent shadow-sm hover:bg-[#F5F2E8] hover:text-[#2D1810]": variant === "outline",
            "bg-[#F5F2E8] text-[#2D1810] shadow-sm hover:bg-[#D4CDB8]": variant === "secondary",
            "hover:bg-[#F5F2E8] hover:text-[#2D1810]": variant === "ghost",
            "text-[#9C4A29] underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
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
