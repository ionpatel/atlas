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

        // Auto-fill from product
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
  const tax = 0; // Can be extended
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Contact *
          </label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Issue Date
          </label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Line Items
        </label>
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_2fr_80px_100px_80px_40px] gap-2 text-xs text-muted-foreground font-medium uppercase px-1">
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
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
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
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                placeholder="Description"
                required
              />

              <input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => updateLine(line.key, "quantity", parseInt(e.target.value) || 1)}
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              />

              <input
                type="number"
                step="0.01"
                min="0"
                value={line.unit_price}
                onChange={(e) => updateLine(line.key, "unit_price", parseFloat(e.target.value) || 0)}
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              />

              <div className="text-sm text-right font-medium px-1">
                {formatCurrency(line.quantity * line.unit_price)}
              </div>

              <button
                type="button"
                onClick={() => removeLine(line.key)}
                className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
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
          className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line
        </button>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-border pt-1.5">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
          placeholder="Payment terms, special instructions..."
        />
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
          Create Invoice
        </button>
      </div>
    </form>
  );
}
