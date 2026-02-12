"use client";

import { useState } from "react";
import { Package, Plus, Search, Filter, Download, Pencil, Trash2, X } from "lucide-react";
import { useInventoryStore, getCategories } from "@/stores/inventory-store";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/modules/product-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

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
    filteredProducts,
  } = useInventoryStore();

  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = getCategories(products);
  const filtered = filteredProducts();

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
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search & Filters */}
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

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Product</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">SKU</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Category</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Cost</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Price</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-[#888888] text-sm">
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
                    i % 2 === 1 ? "bg-[#111111]/40" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3a3028] flex items-center justify-center flex-shrink-0">
                        <Package className="w-3.5 h-3.5 text-[#CDB49E]" />
                      </div>
                      <span className="text-sm font-medium text-[#f5f0eb]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#888888] font-mono text-[13px]">{p.sku}</td>
                  <td className="px-6 py-4 text-sm text-[#888888]">{p.category || "—"}</td>
                  <td className="px-6 py-4 text-sm text-right text-[#888888]">{formatCurrency(p.cost_price)}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-[#f5f0eb]">{formatCurrency(p.sell_price)}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge active={p.is_active} />
                  </td>
                  <td className="px-6 py-4 text-right">
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

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Product">
        <ProductForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleEdit}
          onCancel={() => setEditingProduct(null)}
        />
      </Modal>
    </div>
  );
}
