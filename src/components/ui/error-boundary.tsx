"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    // Reset error state when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, i) => prevProps.resetKeys?.[i] !== key)
    ) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-[#111] rounded-2xl border border-[#262626] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-[#888] text-sm mb-6">
              We encountered an unexpected error. Don&apos;t worry, your work is safe.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left mb-6 bg-[#0a0a0a] rounded-lg p-4 border border-[#222]">
                <summary className="text-xs text-[#666] cursor-pointer hover:text-[#888]">
                  Technical details
                </summary>
                <pre className="mt-3 text-xs text-red-400 whitespace-pre-wrap overflow-auto max-h-48">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack && (
                    <span className="text-[#555] block mt-2">
                      {this.state.errorInfo.componentStack}
                    </span>
                  )}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#161616] text-[#111] rounded-lg font-medium text-sm hover:bg-[#161616] transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 bg-[#0A0A0A] text-white rounded-lg font-medium text-sm hover:bg-[#222] transition-colors border border-[#333] flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error handling for functional components
interface UseErrorHandlerResult {
  error: Error | null;
  handleError: (error: Error) => void;
  clearError: () => void;
}

export function useErrorHandler(): UseErrorHandlerResult {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    console.error("Error handled:", err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Toast-style error notification
interface ErrorToastProps {
  error: Error | null;
  onDismiss: () => void;
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onDismiss]);

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 max-w-sm backdrop-blur-lg">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">Error</p>
          <p className="text-xs text-[#888] mt-1">{error.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#666] hover:text-white text-lg leading-none"
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    </div>
  );
}
