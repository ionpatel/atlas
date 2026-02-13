"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Pencil,
  Trash2,
  X,
  LayoutGrid,
  LayoutList,
  AlertTriangle,
  Boxes,
  DollarSign,
  PackageX,
  Barcode,
  Tags,
  Scan,
  Bell,
} from "lucide-react";
import { useInventoryStore, getCategories } from "@/stores/inventory-store";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/modules/product-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { BarcodeScanner } from "@/components/inventory/barcode-scanner";
import { LowStockAlerts } from "@/components/inventory/low-stock-alerts";
import type { Product } from "@/types";

/* ─── Category color map ─── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Antibiotics:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  Vitamins:        { bg: "bg-emerald-500/10",  text: "text-emerald-400", border: "border-emerald-500/20" },
  "Pain Relief":   { bg: "bg-amber-500/10",    text: "text-amber-400",   border: "border-amber-500/20" },
  Diabetes:        { bg: "bg-violet-500/10",   text: "text-violet-400",  border: "border-violet-500/20" },
  "Blood Pressure":{ bg: "bg-blue-500/10",     text: "text-blue-400",    border: "border-blue-500/20" },
  Allergy:         { bg: "bg-pink-500/10",     text: "text-pink-400",    border: "border-pink-500/20" },
  Digestive:       { bg: "bg-teal-500/10",     text: "text-teal-400",    border: "border-teal-500/20" },
  Other:           { bg: "bg-[#222222]",       text: "text-[#888888]",   border: "border-[#2a2a2a]" },
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  Antibiotics: "#f87171",
  Vitamins: "#34d399",
  "Pain Relief": "#fbbf24",
  Diabetes: "#a78bfa",
  "Blood Pressure": "#60a5fa",
  Allergy: "#f472b6",
  Digestive: "#2dd4bf",
  Other: "#888888",
};

function getCategoryStyle(category?: string) {
  if (!category) return CATEGORY_COLORS.Other;
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

function getCategoryIconColor(category?: string) {
  if (!category) return "#888888";
  return CATEGORY_ICON_COLORS[category] || "#888888";
}

/* ─── Stock level bar + badge ─── */
function StockBar({ stock, min }: { stock: number; min: number }) {
  let color = "bg-emerald-400";
  let label = "";
  let pct = min > 0 ? Math.min((stock / (min * 2)) * 100, 100) : (stock > 0 ? 100 : 0);

  if (stock === 0) {
    color = "bg-red-400";
    label = "Out of Stock";
    pct = 0;
  } else if (stock < min) {
    color = "bg-red-400";
    label = "Low Stock";
    pct = min > 0 ? (stock / min) * 50 : 10;
  } else if (stock <= min * 2) {
    // between min and 2*min — amber zone (50-100% of scale)
    color = "bg-amber-400";
    pct = min > 0 ? 50 + ((stock - min) / min) * 50 : 75;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-[60px]">
        <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all duration-500`}
            style={{ width: `${Math.max(pct, stock > 0 ? 4 : 0)}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-[#888888] tabular-nums w-8 text-right">{stock}</span>
      {label && (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
          label === "Out of Stock"
            ? "bg-red-500/10 text-red-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {label === "Out of Stock" ? "OOS" : "Low"}
        </span>
      )}
    </div>
  );
}

/* ─── Status badge ─── */
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      Active
    </span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      Inactive
    </span>
  );
}

/* ─── Category badge ─── */
function CategoryBadge({ category }: { category?: string }) {
  if (!category) return <span className="text-sm text-[#555555]">—</span>;
  const style = getCategoryStyle(category);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {category}
    </span>
  );
}

/* ─── Grid card for product ─── */
function ProductGridCard({
  product,
  selected,
  onToggle,
  onClick,
}: {
  product: Product;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  const iconColor = getCategoryIconColor(product.category);

  return (
    <div
      className={`bg-[#1a1a1a] border rounded-xl p-5 cursor-pointer hover:border-[#CDB49E]/20 transition-all duration-200 relative group ${
        selected ? "border-[#CDB49E]/50 bg-[#3a3028]/20" : "border-[#2a2a2a]"
      }`}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="w-4 h-4 rounded border border-[#2a2a2a] bg-[#111111] peer-checked:bg-[#CDB49E] peer-checked:border-[#CDB49E] flex items-center justify-center transition-all">
            {selected && (
              <svg className="w-2.5 h-2.5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4 mt-2">
        <div className="w-14 h-14 rounded-xl bg-[#222222] flex items-center justify-center">
          <Package className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold text-[#f5f0eb] text-center truncate mb-1">{product.name}</h3>
      <p className="text-xs text-[#555555] text-center font-mono mb-3">{product.sku}</p>

      {/* Category */}
      <div className="flex justify-center mb-3">
        <CategoryBadge category={product.category} />
      </div>

      {/* Price */}
      <p className="text-center text-sm font-semibold text-[#f5f0eb] mb-3">{formatCurrency(product.sell_price)}</p>

      {/* Stock bar */}
      <StockBar stock={product.stock_quantity} min={product.min_quantity} />
    </div>
  );
}

/* ════════════════════════ MAIN ════════════════════════ */

export default function InventoryPage() {
  const {
    products,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    filteredProducts,
  } = useInventoryStore();

  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showScanner, setShowScanner] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const categories = getCategories(products);
  const filtered = filteredProducts();

  /* ── Summary stats ── */
  const summary = useMemo(() => {
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + p.cost_price * p.stock_quantity, 0);
    const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < p.min_quantity).length;
    const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
    return { totalProducts, totalStockValue, lowStock, outOfStock };
  }, [products]);

  /* ── Selection helpers ── */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    deleteProducts(Array.from(selectedIds));
    addToast(`${selectedIds.size} product(s) deleted`, "info");
    clearSelection();
  };

  const handleBulkExport = () => {
    addToast(`Exported ${selectedIds.size} product(s)`, "success");
    clearSelection();
  };

  /* ── CRUD ── */
  const handleAdd = (data: Omit<Product, "id" | "org_id" | "created_at">) => {
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      org_id: "org1",
      created_at: new Date().toISOString(),
    };
    addProduct(newProduct);
    setModalOpen(false);
    addToast("Product added successfully");
  };

  const handleEdit = (data: Omit<Product, "id" | "org_id" | "created_at">) => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    addToast("Product updated successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteProduct(id);
    addToast("Product deleted", "info");
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode || p.sku === barcode);
    if (product) {
      setEditingProduct(product);
      setShowScanner(false);
      addToast(`Found: ${product.name}`);
    } else {
      addToast(`No product found for: ${barcode}`, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
            Inventory
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Low Stock Alerts Button */}
          <button
            onClick={() => setShowAlerts(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
              summary.lowStock + summary.outOfStock > 0
                ? "border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                : "border-[#2a2a2a] text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
            }`}
          >
            <Bell className="w-4 h-4" />
            Alerts
            {summary.lowStock + summary.outOfStock > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-[10px] font-bold text-[#111111] flex items-center justify-center">
                {summary.lowStock + summary.outOfStock}
              </span>
            )}
          </button>

          {/* Barcode Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm font-medium text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200"
          >
            <Scan className="w-4 h-4" />
            Scan
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#CDB49E]/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Package className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#f5f0eb]">{summary.totalProducts}</p>
          <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Total Products</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#CDB49E]/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#f5f0eb]">{formatCurrency(summary.totalStockValue)}</p>
          <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Stock Value</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#CDB49E]/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-400">{summary.lowStock}</p>
          <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Low Stock Alerts</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#CDB49E]/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <PackageX className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-400">{summary.outOfStock}</p>
          <p className="text-xs text-[#888888] uppercase tracking-wider mt-1">Out of Stock</p>
        </div>
      </div>

      {/* Search & Filters & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#888888] hover:text-[#f5f0eb]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.category || filters.status
              ? "border-[#CDB49E]/50 text-[#CDB49E] bg-[#3a3028]/50"
              : "border-[#2a2a2a] text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200">
          <Download className="w-4 h-4" />
          Export
        </button>

        {/* View toggle */}
        <div className="flex items-center border border-[#2a2a2a] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[#222222] text-[#f5f0eb]"
                : "text-[#555555] hover:text-[#888888] hover:bg-[#1a1a1a]"
            }`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-[#222222] text-[#f5f0eb]"
                : "text-[#555555] hover:text-[#888888] hover:bg-[#1a1a1a]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.category}
            onChange={(e) => setFilter("category", e.target.value)}
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {viewMode === "list" && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-4 py-4 w-10">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={toggleSelectAll}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-[#2a2a2a] bg-[#111111] peer-checked:bg-[#CDB49E] peer-checked:border-[#CDB49E] flex items-center justify-center transition-all">
                      {selectedIds.size === filtered.length && filtered.length > 0 && (
                        <svg className="w-2.5 h-2.5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Product</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">SKU</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Barcode</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Category</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest min-w-[140px]">Stock</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Cost</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Price</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Status</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-[#888888] text-sm">
                    <Package className="w-8 h-8 mx-auto mb-3 text-[#888888]/40" />
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => setEditingProduct(p)}
                    className={`hover:bg-[#222222] transition-colors duration-150 cursor-pointer border-b border-[#2a2a2a]/50 last:border-0 ${
                      selectedIds.has(p.id) ? "bg-[#3a3028]/20" : i % 2 === 1 ? "bg-[#111111]/40" : ""
                    }`}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <label className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border border-[#2a2a2a] bg-[#111111] peer-checked:bg-[#CDB49E] peer-checked:border-[#CDB49E] flex items-center justify-center transition-all">
                          {selectedIds.has(p.id) && (
                            <svg className="w-2.5 h-2.5 text-[#111111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3a3028] flex items-center justify-center flex-shrink-0">
                          <Package className="w-3.5 h-3.5 text-[#CDB49E]" />
                        </div>
                        <span className="text-sm font-medium text-[#f5f0eb]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#888888] font-mono text-[13px]">{p.sku}</td>
                    <td className="px-4 py-4">
                      {p.barcode ? (
                        <div className="flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-[#555555]" />
                          <span className="text-[13px] text-[#888888] font-mono tracking-wide">{p.barcode}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <CategoryBadge category={p.category} />
                    </td>
                    <td className="px-4 py-4">
                      <StockBar stock={p.stock_quantity} min={p.min_quantity} />
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-[#888888]">{formatCurrency(p.cost_price)}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-[#f5f0eb]">{formatCurrency(p.sell_price)}</td>
                    <td className="px-4 py-4 text-right">
                      <StatusBadge active={p.is_active} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(p);
                          }}
                          className="p-2 rounded-lg text-[#888888] hover:text-[#CDB49E] hover:bg-[#3a3028] transition-all duration-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          className="p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ GRID VIEW ═══ */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#888888]">
              <Package className="w-8 h-8 mb-3 text-[#888888]/40" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProductGridCard
                key={p.id}
                product={p}
                selected={selectedIds.has(p.id)}
                onToggle={() => toggleSelect(p.id)}
                onClick={() => setEditingProduct(p)}
              />
            ))
          )}
        </div>
      )}

      {/* ═══ FLOATING BULK ACTION BAR ═══ */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl shadow-black/50">
          <span className="text-sm font-medium text-[#f5f0eb] mr-2">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-5 bg-[#2a2a2a]" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#CDB49E] hover:bg-[#3a3028] rounded-lg transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => addToast("Category change coming soon", "info")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#888888] hover:bg-[#222222] rounded-lg transition-all duration-200"
          >
            <Tags className="w-3.5 h-3.5" />
            Category
          </button>
          <div className="w-px h-5 bg-[#2a2a2a]" />
          <button
            onClick={clearSelection}
            className="p-2 text-[#888888] hover:text-[#f5f0eb] rounded-lg hover:bg-[#222222] transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Product" size="lg">
        <ProductForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleEdit}
          onCancel={() => setEditingProduct(null)}
        />
      </Modal>

      {/* Barcode Scanner */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Low Stock Alerts */}
      {showAlerts && (
        <LowStockAlerts
          onClose={() => setShowAlerts(false)}
          onReorder={(product) => {
            addToast(`Creating purchase order for ${product.name}...`, "info");
            setShowAlerts(false);
          }}
        />
      )}
    </div>
  );
}
