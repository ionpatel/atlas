"use client";

import { useState, useEffect } from "react";
import {
  TrendingDown,
  Calendar,
  Package,
  AlertTriangle,
  ShoppingCart,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  Clock,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type InventoryForecast,
  getMockInventoryForecasts,
} from "@/lib/ai-insights";

function ForecastCard({ forecast }: { forecast: InventoryForecast }) {
  const urgency = forecast.daysUntilStockout <= 7 
    ? "critical" 
    : forecast.daysUntilStockout <= 14 
    ? "warning" 
    : "normal";

  const urgencyStyles = {
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      badge: "bg-red-500/20 text-red-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-400",
    },
    normal: {
      bg: "bg-[#222222]",
      border: "border-[#2a2a2a]",
      text: "text-[#888888]",
      badge: "bg-[#222222] text-[#888888]",
    },
  };

  const styles = urgencyStyles[urgency];

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all hover:scale-[1.01]",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#888888]" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#f5f0eb]">
              {forecast.productName}
            </h4>
            <p className="text-xs text-[#888888]">{forecast.sku}</p>
          </div>
        </div>
        <span className={cn("px-2 py-1 text-xs font-medium rounded", styles.badge)}>
          {forecast.daysUntilStockout}d left
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-[#555555] uppercase tracking-wider">Current</p>
          <p className="text-sm font-semibold text-[#f5f0eb]">
            {forecast.currentStock}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#555555] uppercase tracking-wider">Daily Sales</p>
          <p className="text-sm font-semibold text-[#f5f0eb]">
            {forecast.avgDailySales}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#555555] uppercase tracking-wider">Confidence</p>
          <p className="text-sm font-semibold text-[#f5f0eb]">
            {Math.round(forecast.confidence * 100)}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#CDB49E]" />
          <div>
            <p className="text-[10px] text-[#888888]">Reorder by</p>
            <p className="text-xs font-medium text-[#f5f0eb]">
              {new Date(forecast.recommendedReorderDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#CDB49E]" />
          <div className="text-right">
            <p className="text-[10px] text-[#888888]">Order qty</p>
            <p className="text-xs font-medium text-[#f5f0eb]">
              {forecast.recommendedQuantity} units
            </p>
          </div>
        </div>
      </div>

      <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs text-[#CDB49E] hover:text-[#d4c0ad] transition-colors">
        Create Purchase Order
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export function InventoryForecastingPanel({ className }: { className?: string }) {
  const [forecasts, setForecasts] = useState<InventoryForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setForecasts(getMockInventoryForecasts());
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setForecasts(getMockInventoryForecasts());
    setRefreshing(false);
  };

  const criticalCount = forecasts.filter((f) => f.daysUntilStockout <= 7).length;
  const warningCount = forecasts.filter(
    (f) => f.daysUntilStockout > 7 && f.daysUntilStockout <= 14
  ).length;

  if (loading) {
    return (
      <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f5f0eb]">Inventory Forecast</h3>
            <p className="text-[10px] text-[#888888]">Analyzing sales velocity...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#222222] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f5f0eb]">Inventory Forecast</h3>
            <p className="text-[10px] text-[#888888]">
              {forecasts.length} products need attention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
              {warningCount} warning
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {forecasts.length > 0 ? (
        <div className="space-y-3">
          {forecasts.map((forecast) => (
            <ForecastCard key={forecast.productId} forecast={forecast} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Package className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-[#f5f0eb]">Stock levels healthy</p>
          <p className="text-xs text-[#888888] mt-1">
            No products at risk of stockout in the next 60 days
          </p>
        </div>
      )}
    </div>
  );
}

// Summary card for dashboard
export function ForecastSummaryCard({ className }: { className?: string }) {
  const [forecasts, setForecasts] = useState<InventoryForecast[]>([]);

  useEffect(() => {
    setForecasts(getMockInventoryForecasts());
  }, []);

  const criticalCount = forecasts.filter((f) => f.daysUntilStockout <= 7).length;
  const warningCount = forecasts.filter(
    (f) => f.daysUntilStockout > 7 && f.daysUntilStockout <= 14
  ).length;

  const mostUrgent = forecasts[0];

  return (
    <div
      className={cn(
        "p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-[#f5f0eb]">
            Reorder Forecast
          </span>
        </div>
        <div className="flex items-center gap-1">
          {criticalCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          )}
          {warningCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </div>
      </div>

      {mostUrgent ? (
        <div>
          <p className="text-sm text-[#f5f0eb] truncate">{mostUrgent.productName}</p>
          <p className="text-xs text-[#888888] mt-1">
            {mostUrgent.daysUntilStockout} days until stockout
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-[#222222] rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  mostUrgent.daysUntilStockout <= 7
                    ? "bg-red-400"
                    : mostUrgent.daysUntilStockout <= 14
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                )}
                style={{
                  width: `${Math.min(100, (mostUrgent.daysUntilStockout / 30) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-[#888888]">
              {mostUrgent.currentStock} left
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#888888]">All stock levels healthy</p>
      )}
    </div>
  );
}
