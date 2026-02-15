"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  X,
  Package,
  TrendingDown,
  Bell,
  BellOff,
  ChevronRight,
  PackageX,
  RefreshCcw,
  Send,
  Filter,
  Clock,
  ShoppingCart,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useInventoryStore } from "@/stores/inventory-store";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface LowStockAlertsProps {
  onClose: () => void;
  onReorder?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

type AlertSeverity = "critical" | "warning" | "all";

/* ─── Inline Badge Components (exported for use elsewhere) ─── */

interface StockBadgeProps {
  stock: number;
  min: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function StockBadge({ stock, min, showLabel = true, size = "sm" }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide",
          size === "sm" 
            ? "px-1.5 py-0.5 text-[9px]" 
            : "px-2 py-1 text-[10px]",
          "bg-red-500/15 text-red-400 border border-red-500/20"
        )}
      >
        <PackageX className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
        {showLabel && "Out"}
      </span>
    );
  }
  
  if (stock < min) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide",
          size === "sm" 
            ? "px-1.5 py-0.5 text-[9px]" 
            : "px-2 py-1 text-[10px]",
          "bg-amber-500/15 text-amber-400 border border-amber-500/20"
        )}
      >
        <TrendingDown className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
        {showLabel && "Low"}
      </span>
    );
  }
  
  return null;
}

interface AlertCountBadgeProps {
  lowStock: number;
  outOfStock: number;
  onClick?: () => void;
  showZero?: boolean;
}

export function AlertCountBadge({ lowStock, outOfStock, onClick, showZero = false }: AlertCountBadgeProps) {
  const total = lowStock + outOfStock;
  
  if (total === 0 && !showZero) return null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
        total > 0
          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      )}
    >
      {total > 0 ? (
        <>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="font-semibold">{total}</span>
          <span className="text-[10px] opacity-70">alert{total !== 1 ? "s" : ""}</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All good</span>
        </>
      )}
    </button>
  );
}

/* ─── Pulse Badge for Critical Alerts ─── */
export function CriticalAlertPulse({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="relative flex h-5 w-5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
        {count > 9 ? "9+" : count}
      </span>
    </span>
  );
}

/* ─── Main Component ─── */

export function LowStockAlerts({ onClose, onReorder, onViewProduct }: LowStockAlertsProps) {
  const { products, updateProduct } = useInventoryStore();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity>("all");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [selectedForReorder, setSelectedForReorder] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    return products
      .filter((p) => {
        const isLow = p.stock_quantity > 0 && p.stock_quantity < p.min_quantity;
        const isOut = p.stock_quantity === 0;
        const isDismissed = dismissedIds.has(p.id);

        if (isDismissed) return false;

        if (severityFilter === "critical") return isOut;
        if (severityFilter === "warning") return isLow;
        return isLow || isOut;
      })
      .map((p) => ({
        ...p,
        severity: p.stock_quantity === 0 ? "critical" : "warning" as "critical" | "warning",
        daysUntilOut: p.stock_quantity > 0 ? Math.ceil(p.stock_quantity / 2) : 0,
        suggestedReorder: Math.max(p.min_quantity * 2 - p.stock_quantity, p.min_quantity),
        urgency: p.stock_quantity === 0 ? 3 : p.stock_quantity <= p.min_quantity * 0.5 ? 2 : 1,
      }))
      .sort((a, b) => {
        if (a.urgency !== b.urgency) return b.urgency - a.urgency;
        return a.stock_quantity - b.stock_quantity;
      });
  }, [products, severityFilter, dismissedIds]);

  const stats = useMemo(() => {
    const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
    const lowStock = products.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity < p.min_quantity
    ).length;
    const totalValue = products
      .filter((p) => p.stock_quantity < p.min_quantity)
      .reduce((sum, p) => sum + p.cost_price * p.min_quantity, 0);
    const criticalCount = products.filter((p) => p.stock_quantity === 0 || p.stock_quantity <= p.min_quantity * 0.5).length;
    return { outOfStock, lowStock, totalValue, criticalCount };
  }, [products]);

  const dismissAlert = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleReorder = (product: Product) => {
    if (onReorder) {
      onReorder(product);
    }
  };

  const toggleReorderSelection = (id: string) => {
    setSelectedForReorder((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkReorder = () => {
    const selectedProducts = alerts.filter((a) => selectedForReorder.has(a.id));
    selectedProducts.forEach((p) => {
      if (onReorder) onReorder(p);
    });
    setSelectedForReorder(new Set());
  };

  const selectAllCritical = () => {
    const criticalIds = alerts.filter((a) => a.severity === "critical").map((a) => a.id);
    setSelectedForReorder(new Set(criticalIds));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 relative">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              {stats.criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {stats.criticalCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111827]">
                Stock Alerts
              </h2>
              <p className="text-xs text-[#111827]">
                {alerts.length} item{alerts.length !== 1 ? "s" : ""} need attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSeverityFilter("critical")}
              className={cn(
                "rounded-xl p-3 transition-all text-left",
                severityFilter === "critical"
                  ? "bg-red-500/20 border-2 border-red-500/40"
                  : "bg-red-500/10 border border-red-500/20 hover:bg-red-500/15"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <PackageX className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Out of Stock</span>
              </div>
              <p className="text-xl font-bold text-red-400">{stats.outOfStock}</p>
            </button>
            <button
              onClick={() => setSeverityFilter("warning")}
              className={cn(
                "rounded-xl p-3 transition-all text-left",
                severityFilter === "warning"
                  ? "bg-amber-500/20 border-2 border-amber-500/40"
                  : "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">Low Stock</span>
              </div>
              <p className="text-xl font-bold text-amber-400">{stats.lowStock}</p>
            </button>
            <button
              onClick={() => setSeverityFilter("all")}
              className={cn(
                "rounded-xl p-3 transition-all text-left",
                severityFilter === "all"
                  ? "bg-[rgba(156,74,41,0.15)] border-2 border-[#E5E7EB]/40"
                  : "bg-[rgba(156,74,41,0.15)]/50 border border-[#E5E7EB]/20 hover:bg-[rgba(156,74,41,0.15)]"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <RefreshCcw className="w-4 h-4 text-[#111827]" />
                <span className="text-xs text-[#111827] font-medium">Reorder Value</span>
              </div>
              <p className="text-xl font-bold text-[#111827]">
                {formatCurrency(stats.totalValue)}
              </p>
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedForReorder.size > 0 && (
          <div className="px-6 py-3 border-b border-[#E5E7EB] bg-[rgba(156,74,41,0.15)]/30 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-[#111827]">
              {selectedForReorder.size} item{selectedForReorder.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForReorder(new Set())}
                className="text-xs text-[#374151] hover:text-[#111827] px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={handleBulkReorder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-white rounded-lg text-xs font-semibold hover:bg-white transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Reorder Selected
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#111827]" />
            <div className="flex items-center gap-1">
              {(["all", "critical", "warning"] as AlertSeverity[]).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    severityFilter === sev
                      ? "bg-white text-white"
                      : "text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA]"
                  )}
                >
                  {sev === "all" && "All"}
                  {sev === "critical" && "Out of Stock"}
                  {sev === "warning" && "Low Stock"}
                </button>
              ))}
            </div>
          </div>
          {alerts.some((a) => a.severity === "critical") && (
            <button
              onClick={selectAllCritical}
              className="text-[10px] text-red-400 hover:underline"
            >
              Select all critical
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
                <Package className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-[#111827] mb-1">
                All stock levels healthy!
              </p>
              <p className="text-xs text-[#111827] text-center">
                No products are below their minimum stock levels.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#0A0A0A]/50">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "px-6 py-4 hover:bg-[#F8F9FA]/50 transition-colors",
                    selectedForReorder.has(alert.id) && "bg-[rgba(156,74,41,0.15)]/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedForReorder.has(alert.id)}
                          onChange={() => toggleReorderSelection(alert.id)}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border border-[#E5E7EB] bg-[#F8F9FA] peer-checked:bg-white peer-checked:border-[#E5E7EB] flex items-center justify-center transition-all">
                          {selectedForReorder.has(alert.id) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Severity indicator */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative",
                        alert.severity === "critical"
                          ? "bg-red-500/10"
                          : "bg-amber-500/10"
                      )}
                    >
                      {alert.severity === "critical" ? (
                        <PackageX className="w-5 h-5 text-red-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-amber-400" />
                      )}
                      {alert.urgency >= 2 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-[#111827] truncate">
                          {alert.name}
                        </h4>
                        <StockBadge stock={alert.stock_quantity} min={alert.min_quantity} />
                      </div>
                      <p className="text-xs text-[#111827] mb-2">
                        SKU: {alert.sku} · {alert.category || "Uncategorized"}
                      </p>

                      {/* Stock info */}
                      <div className="flex items-center gap-4 text-xs flex-wrap">
                        <span className="text-[#111827]">
                          Current:{" "}
                          <span
                            className={
                              alert.severity === "critical"
                                ? "text-red-400 font-semibold"
                                : "text-amber-400 font-semibold"
                            }
                          >
                            {alert.stock_quantity}
                          </span>
                        </span>
                        <span className="text-[#111827]">|</span>
                        <span className="text-[#111827]">
                          Min: <span className="text-[#111827]">{alert.min_quantity}</span>
                        </span>
                        {alert.daysUntilOut > 0 && (
                          <>
                            <span className="text-[#111827]">|</span>
                            <span className="text-[#111827] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{alert.daysUntilOut}d remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {onViewProduct && (
                        <button
                          onClick={() => onViewProduct(alert)}
                          className="p-2 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
                          title="View product"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-white rounded-lg text-xs font-medium hover:bg-white transition-all"
                      >
                        <Send className="w-3 h-3" />
                        +{alert.suggestedReorder}
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
                        title="Dismiss"
                      >
                        <BellOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setDismissedIds(new Set())}
              className="text-xs text-[#374151] hover:text-[#111827] transition-colors"
            >
              Reset dismissed alerts
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#374151] hover:text-[#111827] transition-all">
              <Bell className="w-3.5 h-3.5" />
              Configure Alert Rules
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
