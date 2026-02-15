"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useInventoryStore, getCategories } from "@/stores/inventory-store";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/modules/product-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { BarcodeScanner } from "@/components/inventory/barcode-scanner";
import { LowStockAlerts, StockBadge, AlertCountBadge, CriticalAlertPulse } from "@/components/inventory/low-stock-alerts";
import { ImportWizard } from "@/components/import";
import { CanCreate, CanEdit, CanDelete } from "@/components/auth";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/* ─── Category color map ─── */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Antibiotics:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  Vitamins:        { bg: "bg-emerald-500/10",  text: "text-emerald-400", border: "border-emerald-500/20" },
  "Pain Relief":   { bg: "bg-amber-500/10",    text: "text-amber-400",   border: "border-amber-500/20" },
  Diabetes:        { bg: "bg-violet-500/10",   text: "text-violet-400",  border: "border-violet-500/20" },
  "Blood Pressure":{ bg: "bg-blue-500/10",     text: "text-blue-400",    border: "border-blue-500/20" },
  Allergy:         { bg: "bg-pink-500/10",     text: "text-pink-400",    border: "border-pink-500/20" },
  Digestive:       { bg: "bg-teal-500/10",     text: "text-teal-400",    border: "border-teal-500/20" },
  Other:           { bg: "bg-[#0A0A0A]",       text: "text-[#FAFAFA]",   border: "border-[#262626]" },
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  Antibiotics: "#f87171",
  Vitamins: "#34d399",
  "Pain Relief": "#fbbf24",
  Diabetes: "#a78bfa",
  "Blood Pressure": "#60a5fa",
  Allergy: "#f472b6",
  Digestive: "#2dd4bf",
  Other: "#CDB49E",
};

function getCategoryStyle(category?: string) {
  if (!category) return CATEGORY_COLORS.Other;
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

function getCategoryIconColor(category?: string) {
  if (!category) return "#CDB49E";
  return CATEGORY_ICON_COLORS[category] || "#CDB49E";
}

/* ─── Sort configuration ─── */
type SortField = "name" | "sku" | "stock" | "price" | "created";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "sku", label: "SKU" },
  { field: "stock", label: "Stock Level" },
  { field: "price", label: "Price" },
  { field: "created", label: "Date Added" },
];

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
    color = "bg-amber-400";
    pct = min > 0 ? 50 + ((stock - min) / min) * 50 : 75;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-[60px]">
        <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all duration-500`}
            style={{ width: `${Math.max(pct, stock > 0 ? 4 : 0)}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-[#FAFAFA] tabular-nums w-8 text-right">{stock}</span>
      {label && (
        <StockBadge stock={stock} min={min} showLabel />
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
  if (!category) return <span className="text-sm text-[#FAFAFA]">—</span>;
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
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < product.min_quantity;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div
      className={cn(
        "bg-[#0A0A0A] border rounded-xl p-5 cursor-pointer hover:border-[#262626]/20 transition-all duration-200 relative group",
        selected ? "border-[#262626]/50 bg-[rgba(156,74,41,0.15)]/20" : "border-[#262626]",
        isOutOfStock && "border-red-500/20",
        isLowStock && !isOutOfStock && "border-amber-500/20"
      )}
      onClick={onClick}
    >
      {/* Stock Alert Badge */}
      {(isLowStock || isOutOfStock) && (
        <div className="absolute top-3 right-3">
          <StockBadge stock={product.stock_quantity} min={product.min_quantity} size="md" />
        </div>
      )}

      {/* Checkbox */}
      <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="w-4 h-4 rounded border border-[#262626] bg-[#0A0A0A] peer-checked:bg-[#161616] peer-checked:border-[#262626] flex items-center justify-center transition-all">
            {selected && (
              <svg className="w-2.5 h-2.5 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4 mt-2">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center",
          isOutOfStock ? "bg-red-500/10" : isLowStock ? "bg-amber-500/10" : "bg-[#0A0A0A]"
        )}>
          <span style={{ color: isOutOfStock ? "#f87171" : isLowStock ? "#fbbf24" : iconColor }}><Package className="w-6 h-6" /></span>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold text-[#FAFAFA] text-center truncate mb-1">{product.name}</h3>
      <p className="text-xs text-[#FAFAFA] text-center font-mono mb-3">{product.sku}</p>

      {/* Category */}
      <div className="flex justify-center mb-3">
        <CategoryBadge category={product.category} />
      </div>

      {/* Price */}
      <p className="text-center text-sm font-semibold text-[#FAFAFA] mb-3">{formatCurrency(product.sell_price)}</p>

      {/* Stock bar */}
      <StockBar stock={product.stock_quantity} min={product.min_quantity} />
    </div>
  );
}

/* ─── Filter Section Component ─── */
function FilterSection({
  categories,
  filters,
  priceRange,
  sort,
  onFilterChange,
  onPriceRangeChange,
  onSortChange,
  onReset,
}: {
  categories: string[];
  filters: {
    category: string;
    status: string;
    stockLevel: string;
  };
  priceRange: { min: string; max: string };
  sort: SortConfig;
  onFilterChange: (key: string, value: string) => void;
  onPriceRangeChange: (key: "min" | "max", value: string) => void;
  onSortChange: (config: SortConfig) => void;
  onReset: () => void;
}) {
  const hasFilters = filters.category || filters.status || filters.stockLevel || priceRange.min || priceRange.max;

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#FAFAFA]" />
          <span className="text-sm font-medium text-[#FAFAFA]">Filters & Sorting</span>
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[#ccc] hover:text-[#FAFAFA] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-medium text-[#FAFAFA] uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-medium text-[#FAFAFA] uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Stock Level Filter */}
        <div>
          <label className="block text-[10px] font-medium text-[#FAFAFA] uppercase tracking-wider mb-1.5">
            Stock Level
          </label>
          <select
            value={filters.stockLevel}
            onChange={(e) => onFilterChange("stockLevel", e.target.value)}
            className={cn(
              "w-full px-3 py-2 bg-[#0A0A0A] border rounded-lg text-xs focus:outline-none focus:border-[#262626]/40 transition-colors",
              filters.stockLevel === "out" && "border-red-500/40 text-red-400",
              filters.stockLevel === "low" && "border-amber-500/40 text-amber-400",
              filters.stockLevel === "healthy" && "border-emerald-500/40 text-emerald-400",
              !filters.stockLevel && "border-[#262626] text-[#FAFAFA]"
            )}
          >
            <option value="">All Stock Levels</option>
            <option value="healthy">✓ In Stock</option>
            <option value="low">⚠ Low Stock</option>
            <option value="out">✗ Out of Stock</option>
          </select>
        </div>

        {/* Price Range Min */}
        <div>
          <label className="block text-[10px] font-medium text-[#FAFAFA] uppercase tracking-wider mb-1.5">
            Min Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#FAFAFA]">$</span>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange("min", e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full pl-6 pr-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 transition-colors"
            />
          </div>
        </div>

        {/* Price Range Max */}
        <div>
          <label className="block text-[10px] font-medium text-[#FAFAFA] uppercase tracking-wider mb-1.5">
            Max Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#FAFAFA]">$</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => onPriceRangeChange("max", e.target.value)}
              placeholder="∞"
              min="0"
              step="0.01"
              className="w-full pl-6 pr-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 transition-colors"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[10px] font-medium text-[#FAFAFA] uppercase tracking-wider mb-1.5">
            Sort By
          </label>
          <div className="flex items-center gap-1">
            <select
              value={sort.field}
              onChange={(e) => onSortChange({ ...sort, field: e.target.value as SortField })}
              className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.field} value={opt.field}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => onSortChange({ ...sort, direction: sort.direction === "asc" ? "desc" : "asc" })}
              className="p-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#ccc] hover:text-[#FAFAFA] transition-colors"
              title={sort.direction === "asc" ? "Ascending" : "Descending"}
            >
              {sort.direction === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
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
  const [showImport, setShowImport] = useState(false);
  
  // Enhanced filter states
  const [stockLevelFilter, setStockLevelFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [sort, setSort] = useState<SortConfig>({ field: "name", direction: "asc" });

  const categories = getCategories(products);
  
  // Enhanced filtered products with stock level, price range, and sorting
  const filtered = useMemo(() => {
    let result = filteredProducts();
    
    // Stock level filter
    if (stockLevelFilter === "out") {
      result = result.filter((p) => p.stock_quantity === 0);
    } else if (stockLevelFilter === "low") {
      result = result.filter((p) => p.stock_quantity > 0 && p.stock_quantity < p.min_quantity);
    } else if (stockLevelFilter === "healthy") {
      result = result.filter((p) => p.stock_quantity >= p.min_quantity);
    }
    
    // Price range filter
    if (priceRange.min) {
      const minPrice = parseFloat(priceRange.min);
      result = result.filter((p) => p.sell_price >= minPrice);
    }
    if (priceRange.max) {
      const maxPrice = parseFloat(priceRange.max);
      result = result.filter((p) => p.sell_price <= maxPrice);
    }
    
    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "sku":
          comparison = a.sku.localeCompare(b.sku);
          break;
        case "stock":
          comparison = a.stock_quantity - b.stock_quantity;
          break;
        case "price":
          comparison = a.sell_price - b.sell_price;
          break;
        case "created":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [filteredProducts, stockLevelFilter, priceRange, sort]);

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
      addToast(`Found: ${product.name}`);
    } else {
      addToast(`No product found for: ${barcode}`, "error");
    }
  };

  const handleStockAdjust = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock_quantity + delta);
    updateProduct(product.id, { stock_quantity: newStock });
    addToast(`Stock ${delta > 0 ? "added" : "removed"}: ${product.name} (${newStock})`);
  };

  const resetFilters = () => {
    setFilter("category", "");
    setFilter("status", "");
    setStockLevelFilter("");
    setPriceRange({ min: "", max: "" });
    setSort({ field: "name", direction: "asc" });
  };

  // Existing SKUs for duplicate detection during import
  const existingSkus = useMemo(
    () => new Set(products.map((p) => p.sku.toLowerCase())),
    [products]
  );

  const handleImportComplete = async (data: Record<string, any>[]) => {
    let successCount = 0;
    for (const item of data) {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        org_id: "org1",
        name: item.name || "",
        sku: item.sku || "",
        barcode: item.barcode || undefined,
        category: item.category || undefined,
        description: item.description || undefined,
        cost_price: item.cost_price || 0,
        sell_price: item.sell_price || 0,
        unit: item.unit || "each",
        is_active: true,
        stock_quantity: item.stock_quantity || 0,
        min_quantity: item.min_quantity || 10,
        created_at: new Date().toISOString(),
      };
      addProduct(newProduct);
      successCount++;
    }
    setShowImport(false);
    addToast(`Successfully imported ${successCount} product(s)`);
  };

  const activeFilterCount = [
    filters.category,
    filters.status,
    stockLevelFilter,
    priceRange.min,
    priceRange.max,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Inventory
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Low Stock Alerts Button with Pulse */}
          <button
            onClick={() => setShowAlerts(true)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200",
              summary.lowStock + summary.outOfStock > 0
                ? "border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                : "border-[#262626] text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            )}
          >
            <Bell className="w-4 h-4" />
            Alerts
            {summary.outOfStock > 0 ? (
              <CriticalAlertPulse count={summary.outOfStock} />
            ) : summary.lowStock > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-[10px] font-bold text-[#0A0A0A] flex items-center justify-center">
                {summary.lowStock}
              </span>
            ) : null}
          </button>

          {/* Barcode Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#262626] rounded-lg text-sm font-medium text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
          >
            <Scan className="w-4 h-4" />
            Scan
          </button>

          <CanCreate module="inventory">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </CanCreate>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 hover:border-[#262626]/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Package className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#FAFAFA]">{summary.totalProducts}</p>
          <p className="text-xs text-[#FAFAFA] uppercase tracking-wider mt-1">Total Products</p>
        </div>
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 hover:border-[#262626]/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#FAFAFA]">{formatCurrency(summary.totalStockValue)}</p>
          <p className="text-xs text-[#FAFAFA] uppercase tracking-wider mt-1">Stock Value</p>
        </div>
        <button
          onClick={() => {
            setStockLevelFilter("low");
            setShowFilters(true);
          }}
          className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 hover:border-amber-500/30 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            {summary.lowStock > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400">
                View
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-amber-400">{summary.lowStock}</p>
          <p className="text-xs text-[#FAFAFA] uppercase tracking-wider mt-1">Low Stock Alerts</p>
        </button>
        <button
          onClick={() => {
            setStockLevelFilter("out");
            setShowFilters(true);
          }}
          className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 hover:border-red-500/30 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <PackageX className="w-4 h-4 text-red-400" />
            </div>
            {summary.outOfStock > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400">
                View
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-red-400">{summary.outOfStock}</p>
          <p className="text-xs text-[#FAFAFA] uppercase tracking-wider mt-1">Out of Stock</p>
        </button>
      </div>

      {/* Search & Filter Toggle & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#262626]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#FAFAFA]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#FAFAFA] placeholder:text-[#FAFAFA]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#ccc] hover:text-[#FAFAFA]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 relative",
            showFilters || activeFilterCount > 0
              ? "border-[#262626]/50 text-[#FAFAFA] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#262626] text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
          )}
        >
          <Filter className="w-4 h-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#161616] text-[10px] font-bold text-[#0A0A0A] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        {/* Import/Export buttons */}
        <div className="flex items-center border border-[#262626] rounded-lg overflow-hidden">
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200">
            <Download className="w-4 h-4" />
            Export
          </button>
          <div className="w-px h-6 bg-[#0A0A0A]" />
          <CanCreate module="inventory">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </CanCreate>
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-[#262626] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[#0A0A0A] text-[#FAFAFA]"
                : "text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            }`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-[#0A0A0A] text-[#FAFAFA]"
                : "text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      {showFilters && (
        <FilterSection
          categories={categories}
          filters={{
            category: filters.category,
            status: filters.status,
            stockLevel: stockLevelFilter,
          }}
          priceRange={priceRange}
          sort={sort}
          onFilterChange={(key, value) => {
            if (key === "stockLevel") {
              setStockLevelFilter(value);
            } else {
              setFilter(key as "category" | "status", value);
            }
          }}
          onPriceRangeChange={(key, value) => {
            setPriceRange((prev) => ({ ...prev, [key]: value }));
          }}
          onSortChange={setSort}
          onReset={resetFilters}
        />
      )}

      {/* ═══ LIST VIEW ═══ */}
      {viewMode === "list" && (
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left px-4 py-4 w-10">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={toggleSelectAll}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-[#262626] bg-[#0A0A0A] peer-checked:bg-[#161616] peer-checked:border-[#262626] flex items-center justify-center transition-all">
                      {selectedIds.size === filtered.length && filtered.length > 0 && (
                        <svg className="w-2.5 h-2.5 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Product</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">SKU</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Barcode</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Category</th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest min-w-[140px]">Stock</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Cost</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Price</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Status</th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-[#FAFAFA] text-sm">
                    <Package className="w-8 h-8 mx-auto mb-3 text-[#FAFAFA]/40" />
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const isLowStock = p.stock_quantity > 0 && p.stock_quantity < p.min_quantity;
                  const isOutOfStock = p.stock_quantity === 0;
                  
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setEditingProduct(p)}
                      className={cn(
                        "hover:bg-[#0A0A0A] transition-colors duration-150 cursor-pointer border-b border-[#262626]/50 last:border-0",
                        selectedIds.has(p.id) ? "bg-[rgba(156,74,41,0.15)]/20" : i % 2 === 1 ? "bg-[#0A0A0A]/40" : "",
                        isOutOfStock && "bg-red-500/5",
                        isLowStock && !isOutOfStock && "bg-amber-500/5"
                      )}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <label className="cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="sr-only peer"
                          />
                          <div className="w-4 h-4 rounded border border-[#262626] bg-[#0A0A0A] peer-checked:bg-[#161616] peer-checked:border-[#262626] flex items-center justify-center transition-all">
                            {selectedIds.has(p.id) && (
                              <svg className="w-2.5 h-2.5 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            isOutOfStock ? "bg-red-500/10" : isLowStock ? "bg-amber-500/10" : "bg-[rgba(156,74,41,0.15)]"
                          )}>
                            <Package className={cn(
                              "w-3.5 h-3.5",
                              isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-[#FAFAFA]"
                            )} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#FAFAFA]">{p.name}</span>
                            {(isLowStock || isOutOfStock) && (
                              <StockBadge stock={p.stock_quantity} min={p.min_quantity} showLabel={false} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#FAFAFA] font-mono text-[13px]">{p.sku}</td>
                      <td className="px-4 py-4">
                        {p.barcode ? (
                          <div className="flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-[#FAFAFA]" />
                            <span className="text-[13px] text-[#FAFAFA] font-mono tracking-wide">{p.barcode}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#FAFAFA]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <CategoryBadge category={p.category} />
                      </td>
                      <td className="px-4 py-4">
                        <StockBar stock={p.stock_quantity} min={p.min_quantity} />
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-[#FAFAFA]">{formatCurrency(p.cost_price)}</td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-[#FAFAFA]">{formatCurrency(p.sell_price)}</td>
                      <td className="px-4 py-4 text-right">
                        <StatusBadge active={p.is_active} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CanEdit module="inventory">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProduct(p);
                              }}
                              className="p-2 rounded-lg text-[#ccc] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </CanEdit>
                          <CanDelete module="inventory">
                            <button
                              onClick={(e) => handleDelete(e, p.id)}
                              className="p-2 rounded-lg text-[#FAFAFA] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </CanDelete>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ GRID VIEW ═══ */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#FAFAFA]">
              <Package className="w-8 h-8 mb-3 text-[#FAFAFA]/40" />
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl shadow-black/50">
          <span className="text-sm font-medium text-[#FAFAFA] mr-2">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-5 bg-[#0A0A0A]" />
          <CanDelete module="inventory">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </CanDelete>
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] rounded-lg transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => addToast("Category change coming soon", "info")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FAFAFA] hover:bg-[#0A0A0A] rounded-lg transition-all duration-200"
          >
            <Tags className="w-3.5 h-3.5" />
            Category
          </button>
          <div className="w-px h-5 bg-[#0A0A0A]" />
          <button
            onClick={clearSelection}
            className="p-2 text-[#ccc] hover:text-[#FAFAFA] rounded-lg hover:bg-[#0A0A0A] transition-all duration-200"
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
          onEditProduct={(product) => {
            setShowScanner(false);
            setEditingProduct(product);
          }}
          onViewProduct={(product) => {
            setShowScanner(false);
            setEditingProduct(product);
          }}
          onAdjustStock={handleStockAdjust}
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
          onViewProduct={(product) => {
            setShowAlerts(false);
            setEditingProduct(product);
          }}
        />
      )}

      {/* Import Wizard */}
      {showImport && (
        <ImportWizard
          target="products"
          onClose={() => setShowImport(false)}
          onComplete={handleImportComplete}
          existingKeys={existingSkus}
        />
      )}
    </div>
  );
}
