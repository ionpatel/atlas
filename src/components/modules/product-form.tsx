"use client";

import { useState, useEffect } from "react";
import { Camera, Package, DollarSign, Boxes, Truck, FileText } from "lucide-react";
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
  "w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#111827]/50 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#E5E7EB]/50 transition-all duration-200";

const labelClass = "block text-sm font-medium text-[#111827] mb-2";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-[#E5E7EB]">
      <div className="p-1.5 rounded-md bg-[#F8F9FA]">
        <Icon className="w-3.5 h-3.5 text-[#111827]" />
      </div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#111827]">{title}</h3>
    </div>
  );
}

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
    stock_quantity: 0,
    min_quantity: 0,
    weight: 0,
    dimensions: "",
    internal_notes: "",
    image_url: "",
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
        stock_quantity: product.stock_quantity,
        min_quantity: product.min_quantity,
        weight: product.weight || 0,
        dimensions: product.dimensions || "",
        internal_notes: product.internal_notes || "",
        image_url: product.image_url || "",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Placeholder */}
      <div className="flex justify-center">
        <div className="w-full max-w-[200px] h-[140px] border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#E5E7EB]/40 hover:bg-[#F8F9FA]/30 transition-all duration-200 group">
          <div className="p-3 rounded-xl bg-[#F8F9FA] group-hover:bg-[rgba(156,74,41,0.15)] transition-colors">
            <Camera className="w-5 h-5 text-[#111827] group-hover:text-[#111827] transition-colors" />
          </div>
          <span className="text-[11px] text-[#111827] group-hover:text-[#111827] transition-colors">Upload Image</span>
        </div>
      </div>

      {/* General Info Section */}
      <div>
        <SectionHeader icon={Package} title="General Info" />
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
              className={`${inputClass} font-mono tracking-wider`}
              placeholder="e.g. 8901234560001"
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

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputClass}
              placeholder="Short product description"
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
                <div className="w-9 h-5 bg-[#F8F9FA] rounded-full peer-checked:bg-white transition-colors duration-200" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#F8F9FA] rounded-full peer-checked:translate-x-4 transition-transform duration-200" />
              </div>
              <span className="text-[#111827] group-hover:text-[#111827] transition-colors">
                Active product
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div>
        <SectionHeader icon={DollarSign} title="Pricing" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {form.cost_price > 0 && form.sell_price > 0 && (
            <div className="sm:col-span-2">
              <div className="px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-2">
                <span className="text-xs text-[#111827]">Margin:</span>
                <span className="text-xs font-semibold text-emerald-400">
                  ${(form.sell_price - form.cost_price).toFixed(2)} ({((form.sell_price - form.cost_price) / form.cost_price * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Section */}
      <div>
        <SectionHeader icon={Boxes} title="Stock" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={form.stock_quantity}
              onChange={(e) => update("stock_quantity", parseInt(e.target.value) || 0)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          <div>
            <label className={labelClass}>Minimum Quantity</label>
            <input
              type="number"
              min="0"
              value={form.min_quantity}
              onChange={(e) => update("min_quantity", parseInt(e.target.value) || 0)}
              className={inputClass}
              placeholder="0"
            />
            <p className="text-[11px] text-[#111827] mt-1.5">Alert when stock falls below this</p>
          </div>
        </div>
      </div>

      {/* Shipping Section */}
      <div>
        <SectionHeader icon={Truck} title="Shipping" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.weight}
              onChange={(e) => update("weight", parseFloat(e.target.value) || 0)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Dimensions</label>
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) => update("dimensions", e.target.value)}
              className={inputClass}
              placeholder="e.g. 10x5x3 cm"
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <SectionHeader icon={FileText} title="Notes" />
        <div>
          <label className={labelClass}>Internal Notes</label>
          <textarea
            value={form.internal_notes}
            onChange={(e) => update("internal_notes", e.target.value)}
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="Internal notes about this product..."
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-[#374151] hover:text-[#111827] bg-[#F1F3F5] border border-[#D1D5DB] rounded-lg hover:bg-[#E5E7EB] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold bg-white text-white rounded-lg hover:bg-white transition-all duration-200"
        >
          {product ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
