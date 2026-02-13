"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log errors to console in development
        if (process.env.NODE_ENV === "development") {
          console.error("Dashboard Error:", error);
          console.error("Component Stack:", errorInfo.componentStack);
        }
        // In production, you could send to an error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
