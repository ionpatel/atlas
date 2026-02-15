"use client";

import { useState } from "react";
import { Plus, Trash2, Type, StickyNote } from "lucide-react";
import type { Invoice, InvoiceItem, InvoiceLineType } from "@/types";
import { useContactsStore } from "@/stores/contacts-store";
import { useInventoryStore } from "@/stores/inventory-store";
import { formatCurrency } from "@/lib/utils";

interface InvoiceFormProps {
  onSubmit: (invoice: Omit<Invoice, "id" | "org_id" | "created_at">, items: Omit<InvoiceItem, "id" | "invoice_id">[]) => void;
  onCancel: () => void;
}

interface LineItem {
  key: string;
  type: InvoiceLineType;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

const inputClass =
  "w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200";

const lineInputClass =
  "px-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200";

const labelClass = "block text-sm font-medium text-[#FAFAFA] mb-2";

const PAYMENT_TERMS: Record<string, { label: string; days: number }> = {
  due_on_receipt: { label: "Due on Receipt", days: 0 },
  net15: { label: "Net 15", days: 15 },
  net30: { label: "Net 30", days: 30 },
  net60: { label: "Net 60", days: 60 },
};

export function InvoiceForm({ onSubmit, onCancel }: InvoiceFormProps) {
  const contacts = useContactsStore((s) => s.contacts);
  const products = useInventoryStore((s) => s.products);

  const [contactId, setContactId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentTerms, setPaymentTerms] = useState<string>("net30");
  const [currency, setCurrency] = useState<"CAD" | "USD" | "EUR">("CAD");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { key: crypto.randomUUID(), type: "line", product_id: "", description: "", quantity: 1, unit_price: 0, tax_rate: 13 },
  ]);

  const handlePaymentTermsChange = (terms: string) => {
    setPaymentTerms(terms);
    const days = PAYMENT_TERMS[terms]?.days ?? 30;
    const issue = new Date(issueDate);
    const due = new Date(issue.getTime() + days * 86400000);
    setDueDate(due.toISOString().split("T")[0]);
  };

  const handleIssueDateChange = (date: string) => {
    setIssueDate(date);
    const days = PAYMENT_TERMS[paymentTerms]?.days ?? 30;
    const issue = new Date(date);
    const due = new Date(issue.getTime() + days * 86400000);
    setDueDate(due.toISOString().split("T")[0]);
  };

  const addLine = (type: InvoiceLineType = "line") => {
    setLines([
      ...lines,
      { key: crypto.randomUUID(), type, product_id: "", description: "", quantity: type === "line" ? 1 : 0, unit_price: 0, tax_rate: 13 },
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

  const lineItems = lines.filter((l) => l.type === "line");
  const subtotal = lineItems.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
  const totalTax = lineItems.reduce((sum, l) => {
    const lineTotal = l.quantity * l.unit_price;
    return sum + lineTotal * (l.tax_rate / 100);
  }, 0);
  const total = subtotal + totalTax;

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
      tax: totalTax,
      total,
      notes: notes || undefined,
      payment_terms: paymentTerms as Invoice["payment_terms"],
      currency,
    };

    const items: Omit<InvoiceItem, "id" | "invoice_id">[] = lineItems.map((l) => ({
      product_id: l.product_id || undefined,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      tax_rate: l.tax_rate,
      total: l.quantity * l.unit_price,
    }));

    onSubmit(invoice, items);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="sm:col-span-2 lg:col-span-1">
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
          <label className={labelClass}>Payment Terms</label>
          <select
            value={paymentTerms}
            onChange={(e) => handlePaymentTermsChange(e.target.value)}
            className={inputClass}
          >
            {Object.entries(PAYMENT_TERMS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "CAD" | "USD" | "EUR")}
            className={inputClass}
          >
            <option value="CAD">🇨🇦 CAD</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="EUR">🇪🇺 EUR</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Issue Date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => handleIssueDateChange(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          <div className="hidden sm:grid grid-cols-[1fr_2fr_70px_90px_70px_80px_40px] gap-2 text-[10px] text-[#FAFAFA] font-semibold uppercase tracking-widest px-1 pb-1">
            <span>Product</span>
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Tax %</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {lines.map((line) => {
            if (line.type === "section") {
              return (
                <div key={line.key} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Type className="w-3.5 h-3.5 text-[#FAFAFA] flex-shrink-0" />
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.key, "description", e.target.value)}
                      className={`${lineInputClass} flex-1 font-semibold`}
                      placeholder="Section title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="p-2 text-[#FAFAFA] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            if (line.type === "note") {
              return (
                <div key={line.key} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <StickyNote className="w-3.5 h-3.5 text-[#FAFAFA] flex-shrink-0" />
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.key, "description", e.target.value)}
                      className={`${lineInputClass} flex-1 italic text-[#FAFAFA]`}
                      placeholder="Add a note..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="p-2 text-[#FAFAFA] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            const lineTotal = line.quantity * line.unit_price;
            const lineTax = lineTotal * (line.tax_rate / 100);

            return (
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
                  max="100"
                  value={line.tax_rate}
                  onChange={(e) => updateLine(line.key, "tax_rate", parseFloat(e.target.value) || 0)}
                  className={`${lineInputClass} text-right`}
                />

                <div className="text-sm text-right font-medium text-[#FAFAFA] px-1" title={`Tax: ${formatCurrency(lineTax, currency)}`}>
                  {formatCurrency(lineTotal + lineTax, currency)}
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  className="p-2 text-[#FAFAFA] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  disabled={lines.length <= 1}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add buttons row */}
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => addLine("line")}
            className="flex items-center gap-2 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add a line
          </button>
          <button
            type="button"
            onClick={() => addLine("section")}
            className="flex items-center gap-2 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors font-medium"
          >
            <Type className="w-3.5 h-3.5" />
            Add a section
          </button>
          <button
            type="button"
            onClick={() => addLine("note")}
            className="flex items-center gap-2 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors font-medium"
          >
            <StickyNote className="w-3.5 h-3.5" />
            Add a note
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2.5 text-sm bg-[#0A0A0A] border border-[#262626] rounded-xl p-5">
          <div className="flex justify-between text-[#FAFAFA]">
            <span>Subtotal</span>
            <span className="text-[#FAFAFA] font-medium">{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-[#FAFAFA]">
            <span>Tax (HST 13%)</span>
            <span className="text-[#FAFAFA] font-medium">{formatCurrency(totalTax, currency)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-[#262626] pt-3 mt-3">
            <span className="text-[#FAFAFA]">Total ({currency})</span>
            <span className="text-[#FAFAFA]">{formatCurrency(total, currency)}</span>
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

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-[#FAFAFA] hover:text-[#FAFAFA] bg-[#0A0A0A] border border-[#262626] rounded-lg hover:bg-[#0A0A0A] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold bg-[#161616] text-[#0A0A0A] rounded-lg hover:bg-[#161616] transition-all duration-200"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
}
