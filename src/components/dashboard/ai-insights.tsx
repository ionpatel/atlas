"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  FileText,
  DollarSign,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  X,
  Zap,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Insight,
  getMockInsights,
} from "@/lib/ai-insights";

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
  },
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400",
  },
};

const TYPE_ICONS: Record<string, typeof TrendingUp> = {
  sales_trend: TrendingUp,
  inventory_alert: Package,
  revenue_change: DollarSign,
  payment_overdue: FileText,
  expense_spike: DollarSign,
  product_performance: Zap,
  seasonal_pattern: Sparkles,
  anomaly_detected: AlertTriangle,
  goal_progress: CheckCircle,
};

function InsightCard({
  insight,
  onDismiss,
}: {
  insight: Insight;
  onDismiss: (id: string) => void;
}) {
  const styles = SEVERITY_STYLES[insight.severity];
  const Icon = TYPE_ICONS[insight.type] || Sparkles;

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all hover:scale-[1.01]",
        styles.bg,
        styles.border
      )}
    >
      <button
        onClick={() => onDismiss(insight.id)}
        className="absolute top-3 right-3 p-1 text-[#555555] hover:text-[#888888] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", styles.bg)}>
          <Icon className={cn("w-4 h-4", styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-[#f5f0eb]">{insight.title}</h4>
            {insight.metric && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  insight.metric.changePercent > 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {insight.metric.changePercent > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(insight.metric.changePercent).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-xs text-[#888888] leading-relaxed">
            {insight.description}
          </p>
          {insight.action && (
            <Link
              href={insight.action.href}
              className="inline-flex items-center gap-1 mt-2 text-xs text-[#CDB49E] hover:text-[#d4c0ad] transition-colors"
            >
              {insight.action.label}
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function AIInsightsPanel({ className }: { className?: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    // In real app, fetch from API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setInsights(getMockInsights());
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setInsights(getMockInsights());
    setRefreshing(false);
  };

  const handleDismiss = (id: string) => {
    setInsights(insights.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CDB49E] to-[#a08c75] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#111111]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f5f0eb]">AI Insights</h3>
            <p className="text-[10px] text-[#888888]">Analyzing your data...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#222222] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#CDB49E] to-[#a08c75] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#111111]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f5f0eb]">AI Insights</h3>
            <p className="text-[10px] text-[#888888]">
              {insights.length} insights found
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        </button>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-[#f5f0eb]">All clear!</p>
          <p className="text-xs text-[#888888] mt-1">
            No issues detected. Keep up the good work!
          </p>
        </div>
      )}

      {insights.length > 5 && (
        <Link
          href="/reports/insights"
          className="flex items-center justify-center gap-1 mt-4 py-2 text-xs text-[#CDB49E] hover:text-[#d4c0ad] transition-colors"
        >
          View all {insights.length} insights
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

// Compact version for sidebar
export function AIInsightsCompact({ className }: { className?: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    setInsights(getMockInsights().slice(0, 3));
  }, []);

  const criticalCount = insights.filter((i) => i.severity === "critical").length;
  const warningCount = insights.filter((i) => i.severity === "warning").length;

  return (
    <Link
      href="/reports/insights"
      className={cn(
        "block p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#CDB49E]" />
          <span className="text-xs font-medium text-[#f5f0eb]">AI Insights</span>
        </div>
        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-medium rounded">
              {criticalCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded">
              {warningCount}
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
        </div>
      </div>
    </Link>
  );
}
