"use client";

import { useState } from "react";
import { Package, Plus, Search, Filter, Download, Pencil, Trash2 } from "lucide-react";
import { useInventoryStore, getCategories } from "@/stores/inventory-store";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/modules/product-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
      Active
    </span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showFilters || filters.category || filters.status
              ? "border-primary text-primary bg-primary/5"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
          <select
            value={filters.category}
            onChange={(e) => setFilter("category", e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setEditingProduct(p)}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground font-mono">{p.sku}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.category || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-right text-muted-foreground">{formatCurrency(p.cost_price)}</td>
                  <td className="px-5 py-3.5 text-sm text-right font-medium">{formatCurrency(p.sell_price)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusBadge active={p.is_active} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(p);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, p.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
