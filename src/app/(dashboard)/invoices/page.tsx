"use client";

import { useState } from "react";
import { FileText, Plus, Search, Filter, Trash2 } from "lucide-react";
import { useInvoicesStore } from "@/stores/invoices-store";
import { Modal } from "@/components/ui/modal";
import { InvoiceForm } from "@/components/modules/invoice-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, InvoiceItem } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-500",
    sent: "bg-blue-500/10 text-blue-500",
    overdue: "bg-red-500/10 text-red-500",
    draft: "bg-zinc-500/10 text-zinc-400",
    cancelled: "bg-zinc-500/10 text-zinc-500",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`}>
      {label}
    </span>
  );
}

export default function InvoicesPage() {
  const {
    invoices,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addInvoice,
    deleteInvoice,
    filteredInvoices,
    getContactName,
  } = useInvoicesStore();

  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filteredInvoices();

  const handleCreate = (
    invoiceData: Omit<Invoice, "id" | "org_id" | "created_at">,
    items: Omit<InvoiceItem, "id" | "invoice_id">[]
  ) => {
    const id = crypto.randomUUID();
    const invoice: Invoice = {
      ...invoiceData,
      id,
      org_id: "org1",
      created_at: new Date().toISOString(),
    };
    const fullItems: InvoiceItem[] = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      invoice_id: id,
    }));
    addInvoice(invoice, fullItems);
    setModalOpen(false);
    addToast("Invoice created successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteInvoice(id);
    addToast("Invoice deleted", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {invoices.length} invoices
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showFilters || filters.status
              ? "border-primary text-primary bg-primary/5"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  No invoices found
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium font-mono">{inv.invoice_number}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm">{getContactName(inv.contact_id)}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(inv.issue_date)}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(inv.due_date)}</td>
                  <td className="px-5 py-3.5 text-sm text-right font-medium">{formatCurrency(inv.total)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => handleDelete(e, inv.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice" size="xl">
        <InvoiceForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
