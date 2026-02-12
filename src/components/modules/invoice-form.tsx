"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Invoice, InvoiceItem } from "@/types";
import { useContactsStore } from "@/stores/contacts-store";
import { useInventoryStore } from "@/stores/inventory-store";
import { formatCurrency } from "@/lib/utils";

interface InvoiceFormProps {
  onSubmit: (invoice: Omit<Invoice, "id" | "org_id" | "created_at">, items: Omit<InvoiceItem, "id" | "invoice_id">[]) => void;
  onCancel: () => void;
}

interface LineItem {
  key: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

const inputClass =
  "w-full px-4 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#888888]/50 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200";

const lineInputClass =
  "px-3 py-2 bg-[#111111] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200";

const labelClass = "block text-sm font-medium text-[#888888] mb-2";

export function InvoiceForm({ onSubmit, onCancel }: InvoiceFormProps) {
  const contacts = useContactsStore((s) => s.contacts);
  const products = useInventoryStore((s) => s.products);

  const [contactId, setContactId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { key: crypto.randomUUID(), product_id: "", description: "", quantity: 1, unit_price: 0 },
  ]);

  const addLine = () => {
    setLines([
      ...lines,
      { key: crypto.randomUUID(), product_id: "", description: "", quantity: 1, unit_price: 0 },
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
            updated.unit_price = product.sell_price;
          }
        }

        return updated;
      })
    );
  };

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId) return;

    const invoiceCount = Math.floor(Math.random() * 900) + 100;
    const invoice: Omit<Invoice, "id" | "org_id" | "created_at"> = {
      contact_id: contactId,
      invoice_number: `INV-2026-${invoiceCount}`,
      status: "draft",
      issue_date: issueDate,
      due_date: dueDate,
      subtotal,
      tax,
      total,
      notes: notes || undefined,
    };

    const items: Omit<InvoiceItem, "id" | "invoice_id">[] = lines.map((l) => ({
      product_id: l.product_id || undefined,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      total: l.quantity * l.unit_price,
    }));

    onSubmit(invoice, items);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className={labelClass}>Contact *</label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Issue Date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className={labelClass}>Line Items</label>
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_2fr_80px_100px_80px_40px] gap-2 text-[10px] text-[#888888] font-semibold uppercase tracking-widest px-1 pb-1">
            <span>Product</span>
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {lines.map((line) => (
            <div
              key={line.key}
              className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_80px_100px_80px_40px] gap-2 items-center"
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

              <div className="text-sm text-right font-medium text-[#CDB49E] px-1">
                {formatCurrency(line.quantity * line.unit_price)}
              </div>

              <button
                type="button"
                onClick={() => removeLine(line.key)}
                className="p-2 text-[#888888] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
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
          className="mt-3 flex items-center gap-2 text-sm text-[#CDB49E] hover:text-[#d4c0ad] transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line
        </button>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-[#888888]">
            <span>Subtotal</span>
            <span className="text-[#f5f0eb]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>Tax</span>
            <span className="text-[#f5f0eb]">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-[#2a2a2a] pt-2.5 mt-2.5">
            <span className="text-[#f5f0eb]">Total</span>
            <span className="text-[#CDB49E]">{formatCurrency(total)}</span>
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
          placeholder="Payment terms, special instructions..."
        />
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
          Create Invoice
        </button>
      </div>
    </form>
  );
}
