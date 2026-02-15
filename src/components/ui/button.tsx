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
            "bg-[#161616] text-[#0A0A0A] shadow hover:bg-[#161616]": variant === "default",
            "bg-red-500 text-white shadow-sm hover:bg-red-500/90": variant === "destructive",
            "border border-[#262626] bg-transparent shadow-sm hover:bg-[#0A0A0A] hover:text-[#FAFAFA]": variant === "outline",
            "bg-[#0A0A0A] text-[#FAFAFA] shadow-sm hover:bg-[#0A0A0A]": variant === "secondary",
            "hover:bg-[#0A0A0A] hover:text-[#FAFAFA]": variant === "ghost",
            "text-[#FAFAFA] underline-offset-4 hover:underline": variant === "link",
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
