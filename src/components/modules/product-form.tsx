"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, "id" | "org_id" | "created_at">) => void;
  onCancel: () => void;
}

const categories = [
  "Antibiotics",
  "Vitamins",
  "Pain Relief",
  "Diabetes",
  "Blood Pressure",
  "Allergy",
  "Digestive",
  "Other",
];

const units = ["box", "bottle", "strip", "tablet", "capsule", "tube", "pack"];

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    description: "",
    cost_price: 0,
    sell_price: 0,
    unit: "box",
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || "",
        category: product.category || "",
        description: product.description || "",
        cost_price: product.cost_price,
        sell_price: product.sell_price,
        unit: product.unit,
        is_active: product.is_active,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const update = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="e.g. Amoxicillin 500mg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            SKU *
          </label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="e.g. AMX-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Barcode
          </label>
          <input
            type="text"
            value={form.barcode}
            onChange={(e) => update("barcode", e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Unit
          </label>
          <select
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Cost Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.cost_price}
            onChange={(e) => update("cost_price", parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Sell Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.sell_price}
            onChange={(e) => update("sell_price", parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-muted-foreground">Active product</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          {product ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
