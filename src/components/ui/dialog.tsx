"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode; }

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref}
      className={cn("fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[#E5E7EB] bg-white p-6 shadow-float rounded-xl animate-scale-in", className)}
      {...props}>{children}</div>
  )
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)} {...props} />
);
const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-[#111827]", className)} {...props} />
  )
);
const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-[#6B7280]", className)} {...props} />
  )
);
const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref}
      className={cn("absolute right-4 top-4 rounded-lg p-1 opacity-60 hover:opacity-100 hover:bg-[#F1F3F5] transition-all text-[#6B7280] hover:text-[#111827]", className)}
      {...props}><X className="h-4 w-4" /></button>
  )
);

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; children: React.ReactNode; }
const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<any>, { ref, ...props });
    return <button ref={ref} className={className} {...props}>{children}</button>;
  }
);

DialogContent.displayName = "DialogContent";
DialogHeader.displayName = "DialogHeader";
DialogFooter.displayName = "DialogFooter";
DialogTitle.displayName = "DialogTitle";
DialogDescription.displayName = "DialogDescription";
DialogClose.displayName = "DialogClose";
DialogTrigger.displayName = "DialogTrigger";

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogTrigger };
