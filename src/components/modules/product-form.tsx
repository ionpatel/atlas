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

const inputClass =
  "w-full px-4 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#888888]/50 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200";

const labelClass = "block text-sm font-medium text-[#888888] mb-2";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className={labelClass}>Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className={inputClass}
            placeholder="e.g. Amoxicillin 500mg"
          />
        </div>

        <div>
          <label className={labelClass}>SKU *</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            required
            className={inputClass}
            placeholder="e.g. AMX-500"
          />
        </div>

        <div>
          <label className={labelClass}>Barcode</label>
          <input
            type="text"
            value={form.barcode}
            onChange={(e) => update("barcode", e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
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
          <label className={labelClass}>Unit</label>
          <select
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
            className={inputClass}
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Cost Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.cost_price}
            onChange={(e) => update("cost_price", parseFloat(e.target.value) || 0)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Sell Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.sell_price}
            onChange={(e) => update("sell_price", parseFloat(e.target.value) || 0)}
            required
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#2a2a2a] rounded-full peer-checked:bg-[#CDB49E] transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#111111] rounded-full peer-checked:translate-x-4 transition-transform duration-200" />
            </div>
            <span className="text-[#888888] group-hover:text-[#f5f0eb] transition-colors">
              Active product
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-[#888888] hover:text-[#f5f0eb] bg-[#222222] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold bg-[#CDB49E] text-[#111111] rounded-lg hover:bg-[#d4c0ad] transition-all duration-200"
        >
          {product ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
