"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { PurchaseOrder, PurchaseOrderLine } from "@/types";
import { useContactsStore } from "@/stores/contacts-store";
import { useInventoryStore } from "@/stores/inventory-store";
import { formatCurrency } from "@/lib/utils";

interface PurchaseOrderFormProps {
  onSubmit: (
    order: Omit<PurchaseOrder, "id" | "org_id" | "created_at">,
    lines: Omit<PurchaseOrderLine, "id" | "order_id">[]
  ) => void;
  onCancel: () => void;
}

interface LineItem {
  key: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

const inputClass =
  "w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#6B5B4F]/50 focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200";

const lineInputClass =
  "px-3 py-2 bg-[#E8E3CC] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 transition-all duration-200";

const labelClass = "block text-sm font-medium text-[#6B5B4F] mb-2";

export function PurchaseOrderForm({ onSubmit, onCancel }: PurchaseOrderFormProps) {
  const contacts = useContactsStore((s) => s.contacts);
  const products = useInventoryStore((s) => s.products);

  const [vendorId, setVendorId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { key: crypto.randomUUID(), product_id: "", description: "", quantity: 1, unit_price: 0, tax_rate: 13 },
  ]);

  const addLine = () => {
    setLines([
      ...lines,
      { key: crypto.randomUUID(), product_id: "", description: "", quantity: 1, unit_price: 0, tax_rate: 13 },
    ]);
  };

  const removeLine = (key: string) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((l) => l.key !== key));
  };

  const updateLine = (key: string, field: keyof LineItem, value: string | number) => {
    setLines(
      lines.map((l) => {
        if (l.key !== key) return l;
        const updated = { ...l, [field]: value };

        if (field === "product_id" && typeof value === "string" && value) {
          const product = products.find((p) => p.id === value);
          if (product) {
            updated.description = product.name;
            updated.unit_price = product.cost_price;
          }
        }

        return updated;
      })
    );
  };

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const tax = lines.reduce((sum, l) => sum + l.quantity * l.unit_price * (l.tax_rate / 100), 0);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    const orderCount = Math.floor(Math.random() * 900) + 100;
    const order: Omit<PurchaseOrder, "id" | "org_id" | "created_at"> = {
      vendor_id: vendorId,
      order_number: `PO-2026-${orderCount}`,
      status: "draft",
      order_date: orderDate,
      expected_date: expectedDate || undefined,
      subtotal,
      tax,
      total,
      notes: notes || undefined,
    };

    const items: Omit<PurchaseOrderLine, "id" | "order_id">[] = lines.map((l) => ({
      product_id: l.product_id || undefined,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      tax_rate: l.tax_rate,
      total: l.quantity * l.unit_price * (1 + l.tax_rate / 100),
    }));

    onSubmit(order, items);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Vendor *</label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select vendor</option>
            {contacts
              .filter((c) => c.type === "vendor" || c.type === "both")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Order Date</label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Expected Delivery</label>
          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className={labelClass}>Line Items</label>
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_2fr_70px_90px_70px_80px_40px] gap-2 text-[10px] text-[#6B5B4F] font-semibold uppercase tracking-widest px-1 pb-1">
            <span>Product</span>
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Tax %</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {lines.map((line) => (
            <div
              key={line.key}
              className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_70px_90px_70px_80px_40px] gap-2 items-center"
            >
              <select
                value={line.product_id}
                onChange={(e) => updateLine(line.key, "product_id", e.target.value)}
                className={lineInputClass}
              >
                <option value="">Custom</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={line.description}
                onChange={(e) => updateLine(line.key, "description", e.target.value)}
                className={lineInputClass}
                placeholder="Description"
                required
              />

              <input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => updateLine(line.key, "quantity", parseInt(e.target.value) || 1)}
                className={`${lineInputClass} text-right`}
              />

              <input
                type="number"
                step="0.01"
                min="0"
                value={line.unit_price}
                onChange={(e) => updateLine(line.key, "unit_price", parseFloat(e.target.value) || 0)}
                className={`${lineInputClass} text-right`}
              />

              <input
                type="number"
                step="0.5"
                min="0"
                value={line.tax_rate}
                onChange={(e) => updateLine(line.key, "tax_rate", parseFloat(e.target.value) || 0)}
                className={`${lineInputClass} text-right`}
              />

              <div className="text-sm text-right font-medium text-[#9C4A29] px-1">
                {formatCurrency(line.quantity * line.unit_price)}
              </div>

              <button
                type="button"
                onClick={() => removeLine(line.key)}
                className="p-2 text-[#6B5B4F] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                disabled={lines.length <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="mt-3 flex items-center gap-2 text-sm text-[#9C4A29] hover:text-[#B85A35] transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line
        </button>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-[#6B5B4F]">
            <span>Subtotal</span>
            <span className="text-[#2D1810]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#6B5B4F]">
            <span>Tax</span>
            <span className="text-[#2D1810]">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-[#D4CDB8] pt-2.5 mt-2.5">
            <span className="text-[#2D1810]">Total</span>
            <span className="text-[#9C4A29]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Shipping instructions, payment terms..."
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4CDB8]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-[#6B5B4F] hover:text-[#2D1810] bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg hover:bg-[#D4CDB8] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold bg-[#9C4A29] text-[#E8E3CC] rounded-lg hover:bg-[#B85A35] transition-all duration-200"
        >
          Create Purchase Order
        </button>
      </div>
    </form>
  );
}
