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
} from "lucide-react";
import { useInventoryStore } from "@/stores/inventory-store";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface LowStockAlertsProps {
  onClose: () => void;
  onReorder?: (product: Product) => void;
}

type AlertSeverity = "critical" | "warning" | "all";

export function LowStockAlerts({ onClose, onReorder }: LowStockAlertsProps) {
  const { products, updateProduct } = useInventoryStore();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity>("all");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    return products
      .filter((p) => {
        // Out of stock or below minimum
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
        daysUntilOut: p.stock_quantity > 0 ? Math.ceil(p.stock_quantity / 2) : 0, // Mock calculation
        suggestedReorder: Math.max(p.min_quantity * 2 - p.stock_quantity, p.min_quantity),
      }))
      .sort((a, b) => {
        // Sort by severity (critical first), then by stock level
        if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
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
    return { outOfStock, lowStock, totalValue };
  }, [products]);

  const dismissAlert = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleReorder = (product: Product) => {
    if (onReorder) {
      onReorder(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f0eb]">
                Stock Alerts
              </h2>
              <p className="text-xs text-[#888888]">
                {alerts.length} item{alerts.length !== 1 ? "s" : ""} need attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <PackageX className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Out of Stock</span>
              </div>
              <p className="text-xl font-bold text-red-400">{stats.outOfStock}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">Low Stock</span>
              </div>
              <p className="text-xl font-bold text-amber-400">{stats.lowStock}</p>
            </div>
            <div className="bg-[#3a3028] border border-[#CDB49E]/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCcw className="w-4 h-4 text-[#CDB49E]" />
                <span className="text-xs text-[#CDB49E] font-medium">Reorder Value</span>
              </div>
              <p className="text-xl font-bold text-[#CDB49E]">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#555555]" />
            <div className="flex items-center gap-1">
              {(["all", "critical", "warning"] as AlertSeverity[]).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    severityFilter === sev
                      ? "bg-[#CDB49E] text-[#111111]"
                      : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222]"
                  )}
                >
                  {sev === "all" && "All"}
                  {sev === "critical" && "Out of Stock"}
                  {sev === "warning" && "Low Stock"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
                <Package className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-[#f5f0eb] mb-1">
                All stock levels healthy!
              </p>
              <p className="text-xs text-[#888888] text-center">
                No products are below their minimum stock levels.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]/50">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-6 py-4 hover:bg-[#222222]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Severity indicator */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
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
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-[#f5f0eb] truncate">
                          {alert.name}
                        </h4>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                            alert.severity === "critical"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                          )}
                        >
                          {alert.severity === "critical" ? "Out" : "Low"}
                        </span>
                      </div>
                      <p className="text-xs text-[#888888] mb-2">
                        SKU: {alert.sku} · {alert.category || "Uncategorized"}
                      </p>

                      {/* Stock info */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-[#888888]">
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
                        <span className="text-[#555555]">|</span>
                        <span className="text-[#888888]">
                          Minimum: <span className="text-[#f5f0eb]">{alert.min_quantity}</span>
                        </span>
                        {alert.daysUntilOut > 0 && (
                          <>
                            <span className="text-[#555555]">|</span>
                            <span className="text-[#888888]">
                              ~{alert.daysUntilOut} days until depleted
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReorder(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CDB49E] text-[#111111] rounded-lg text-xs font-medium hover:bg-[#d4c0ad] transition-all"
                      >
                        <Send className="w-3 h-3" />
                        Reorder ({alert.suggestedReorder})
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 rounded-lg text-[#555555] hover:text-[#888888] hover:bg-[#222222] transition-all"
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
          <div className="px-6 py-4 bg-[#111111] border-t border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setDismissedIds(new Set())}
              className="text-xs text-[#555555] hover:text-[#888888] transition-colors"
            >
              Reset dismissed alerts
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-xs font-medium text-[#888888] hover:text-[#f5f0eb] transition-all">
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
