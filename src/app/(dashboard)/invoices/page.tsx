"use client";

import { useState, useMemo } from "react";
import {
  FileText, Plus, Search, Filter, Trash2, X, List, LayoutGrid,
  Send, CreditCard, Bell, Eye, DollarSign, Clock, CheckCircle, AlertTriangle,
} from "lucide-react";
import { useInvoicesStore } from "@/stores/invoices-store";
import { Modal } from "@/components/ui/modal";
import { InvoiceForm } from "@/components/modules/invoice-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useInvoiceAccounting } from "@/lib/integrations";
import type { Invoice, InvoiceItem } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    sent: "bg-[rgba(156,74,41,0.15)] text-[#111827] border-[#E5E7EB]/20",
    overdue: "bg-red-500/10 text-red-400 border-red-500/20",
    draft: "bg-[#F8F9FA] text-[#111827] border-[#E5E7EB]",
    cancelled: "bg-[#F8F9FA] text-[#111827]/60 border-[#E5E7EB]",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
}

function SummaryCard({
  label,
  amount,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  amount: number;
  count: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    accent: { bg: "bg-[rgba(156,74,41,0.15)]/50", text: "text-[#111827]", iconBg: "bg-[rgba(156,74,41,0.15)]" },
    green: { bg: "bg-emerald-500/5", text: "text-emerald-400", iconBg: "bg-emerald-500/10" },
    red: { bg: "bg-red-500/5", text: "text-red-400", iconBg: "bg-red-500/10" },
    blue: { bg: "bg-blue-500/5", text: "text-blue-400", iconBg: "bg-blue-500/10" },
  };
  const c = colorMap[color] || colorMap.accent;
  return (
    <div className={`${c.bg} border border-[#E5E7EB] rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#111827] uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{formatCurrency(amount)}</div>
      <div className="text-xs text-[#111827] mt-1">{count} invoice{count !== 1 ? "s" : ""}</div>
    </div>
  );
}

function InvoicePreviewModal({
  invoice,
  contactName,
  items,
  open,
  onClose,
}: {
  invoice: Invoice;
  contactName: string;
  items: InvoiceItem[];
  open: boolean;
  onClose: () => void;
}) {
  const cur = invoice.currency || "CAD";
  return (
    <Modal open={open} onClose={onClose} title="Invoice Preview" size="xl">
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">INVOICE</h2>
            <p className="text-sm text-[#111827] mt-1">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-[#111827]">Atlas Pharmacy</h3>
            <p className="text-xs text-[#111827] mt-1">123 Main Street, Suite 100</p>
            <p className="text-xs text-[#111827]">Toronto, ON M5V 1A1</p>
            <p className="text-xs text-[#111827]">info@atlaspharmacy.ca</p>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB]" />

        {/* Bill To + Dates */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-semibold text-[#111827] uppercase tracking-widest mb-2">Bill To</p>
            <p className="text-sm font-semibold text-[#111827]">{contactName}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex justify-end gap-6 text-sm">
              <span className="text-[#111827]">Issue Date:</span>
              <span className="text-[#111827]">{formatDate(invoice.issue_date)}</span>
            </div>
            <div className="flex justify-end gap-6 text-sm">
              <span className="text-[#111827]">Due Date:</span>
              <span className="text-[#111827]">{formatDate(invoice.due_date)}</span>
            </div>
            <div className="flex justify-end gap-6 text-sm">
              <span className="text-[#111827]">Status:</span>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Description</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Qty</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Unit Price</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#111827] text-sm italic">No line items</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-[#E5E7EB]/50 last:border-0">
                    <td className="px-4 py-3 text-sm text-[#111827]">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-[#111827] text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-[#111827] text-right">{formatCurrency(item.unit_price, cur)}</td>
                    <td className="px-4 py-3 text-sm text-[#111827] text-right font-medium">{formatCurrency(item.total, cur)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-[#111827]">
              <span>Subtotal</span>
              <span className="text-[#111827]">{formatCurrency(invoice.subtotal, cur)}</span>
            </div>
            <div className="flex justify-between text-[#111827]">
              <span>Tax</span>
              <span className="text-[#111827]">{formatCurrency(invoice.tax, cur)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-[#E5E7EB] pt-3 mt-3">
              <span className="text-[#111827]">Total</span>
              <span className="text-[#111827]">{formatCurrency(invoice.total, cur)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-[#E5E7EB] pt-4">
            <p className="text-[10px] font-semibold text-[#111827] uppercase tracking-widest mb-2">Notes</p>
            <p className="text-sm text-[#111827]">{invoice.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function KanbanColumn({
  title,
  invoices,
  color,
  getContactName,
  onAction,
  onPreview,
}: {
  title: string;
  invoices: Invoice[];
  color: string;
  getContactName: (id: string) => string;
  onAction: (inv: Invoice) => void;
  onPreview: (inv: Invoice) => void;
}) {
  const colorMap: Record<string, { border: string; dot: string }> = {
    gray: { border: "border-[#E5E7EB]/30", dot: "bg-white" },
    accent: { border: "border-[#E5E7EB]/30", dot: "bg-white" },
    green: { border: "border-emerald-500/30", dot: "bg-emerald-400" },
    red: { border: "border-red-500/30", dot: "bg-red-400" },
  };
  const c = colorMap[color] || colorMap.gray;

  return (
    <div className={`flex-1 min-w-[250px] bg-[#F8F9FA] border ${c.border} rounded-xl overflow-hidden`}>
      <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
        <span className="ml-auto text-xs text-[#111827] bg-[#F8F9FA] px-2 py-0.5 rounded-full">{invoices.length}</span>
      </div>
      <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
        {invoices.length === 0 ? (
          <p className="text-xs text-[#111827] text-center py-6">No invoices</p>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-4 hover:border-[#E5E7EB]/25 transition-all duration-200 cursor-pointer group"
              onClick={() => onPreview(inv)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#111827] font-medium">{inv.invoice_number}</span>
                <StatusBadge status={inv.status} />
              </div>
              <p className="text-sm text-[#111827] font-medium">{getContactName(inv.contact_id)}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-[#111827]">{formatCurrency(inv.total)}</span>
                <span className="text-xs text-[#111827]">{formatDate(inv.due_date)}</span>
              </div>
              {inv.status !== "paid" && inv.status !== "cancelled" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(inv);
                  }}
                  className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] text-[#374151] hover:text-[#111827] hover:border-[#E5E7EB]/30 hover:bg-[rgba(156,74,41,0.15)]/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  {inv.status === "draft" && "Send Invoice"}
                  {inv.status === "sent" && "Register Payment"}
                  {inv.status === "overdue" && "Send Reminder"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const {
    invoices,
    invoiceItems,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    filteredInvoices,
    getContactName,
  } = useInvoicesStore();

  const addToast = useToastStore((s) => s.addToast);
  const { markAsPaid } = useInvoiceAccounting();

  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const filtered = filteredInvoices();

  // Summary stats
  const stats = useMemo(() => {
    const all = invoices;
    const paid = all.filter((i) => i.status === "paid");
    const outstanding = all.filter((i) => i.status === "sent" || i.status === "draft");
    const overdue = all.filter((i) => i.status === "overdue");
    return {
      total: { amount: all.reduce((s, i) => s + i.total, 0), count: all.length },
      paid: { amount: paid.reduce((s, i) => s + i.total, 0), count: paid.length },
      outstanding: { amount: outstanding.reduce((s, i) => s + i.total, 0), count: outstanding.length },
      overdue: { amount: overdue.reduce((s, i) => s + i.total, 0), count: overdue.length },
    };
  }, [invoices]);

  // Kanban grouped
  const kanbanGroups = useMemo(() => {
    return {
      draft: filtered.filter((i) => i.status === "draft"),
      sent: filtered.filter((i) => i.status === "sent"),
      paid: filtered.filter((i) => i.status === "paid"),
      overdue: filtered.filter((i) => i.status === "overdue"),
    };
  }, [filtered]);

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

  const handleStatusAction = async (inv: Invoice) => {
    if (inv.status === "draft") {
      updateInvoice(inv.id, { status: "sent" });
      addToast(`${inv.invoice_number} marked as sent`);
    } else if (inv.status === "sent" || inv.status === "overdue") {
      // Use integration hook to mark as paid AND create journal entry
      const result = await markAsPaid(inv.id);
      if (result) {
        addToast(
          `Payment registered for ${inv.invoice_number} → Journal entry ${result.journalEntry.entry_number} created`,
          "success"
        );
      } else {
        addToast(`Failed to register payment for ${inv.invoice_number}`, "error");
      }
    }
  };

  const handlePreview = (inv: Invoice) => {
    setPreviewInvoice(inv);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Invoices
          </h1>
          <p className="text-[#111827] text-sm mt-1">
            {filtered.length} of {invoices.length} invoices
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Invoiced" amount={stats.total.amount} count={stats.total.count} icon={DollarSign} color="blue" />
        <SummaryCard label="Paid" amount={stats.paid.amount} count={stats.paid.count} icon={CheckCircle} color="green" />
        <SummaryCard label="Outstanding" amount={stats.outstanding.amount} count={stats.outstanding.count} icon={Clock} color="accent" />
        <SummaryCard label="Overdue" amount={stats.overdue.amount} count={stats.overdue.count} icon={AlertTriangle} color="red" />
      </div>

      {/* Search, Filters & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#E5E7EB]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#111827]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#111827] placeholder:text-[#111827]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#374151] hover:text-[#111827]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.status
              ? "border-[#E5E7EB]/50 text-[#111827] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#E5E7EB] text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>

        {/* View toggle */}
        <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[rgba(156,74,41,0.15)] text-[#111827]"
                : "text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "kanban"
                ? "bg-[rgba(156,74,41,0.15)] text-[#111827]"
                : "text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="px-4 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#E5E7EB]/50 transition-all duration-200"
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

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn title="Draft" invoices={kanbanGroups.draft} color="gray" getContactName={getContactName} onAction={handleStatusAction} onPreview={handlePreview} />
          <KanbanColumn title="Sent" invoices={kanbanGroups.sent} color="accent" getContactName={getContactName} onAction={handleStatusAction} onPreview={handlePreview} />
          <KanbanColumn title="Paid" invoices={kanbanGroups.paid} color="green" getContactName={getContactName} onAction={handleStatusAction} onPreview={handlePreview} />
          <KanbanColumn title="Overdue" invoices={kanbanGroups.overdue} color="red" getContactName={getContactName} onAction={handleStatusAction} onPreview={handlePreview} />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Invoice</th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Customer</th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Date</th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Due Date</th>
                <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Amount</th>
                <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Status</th>
                <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#111827] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#111827] text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-3 text-[#111827]/40" />
                    No invoices found
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`hover:bg-[#F8F9FA] transition-colors duration-150 cursor-pointer border-b border-[#E5E7EB]/50 last:border-0 ${
                      i % 2 === 1 ? "bg-[#F8F9FA]/40" : ""
                    }`}
                    onClick={() => handlePreview(inv)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-[#111827]" />
                        </div>
                        <span className="text-sm font-medium text-[#111827] font-mono">{inv.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{getContactName(inv.contact_id)}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{formatDate(inv.issue_date)}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{formatDate(inv.due_date)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-[#111827]">{formatCurrency(inv.total)}</td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Status action buttons */}
                        {inv.status === "draft" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusAction(inv);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[#111827] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                            title="Send"
                          >
                            <Send className="w-3 h-3" />
                            Send
                          </button>
                        )}
                        {inv.status === "sent" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusAction(inv);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
                            title="Register Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                        {inv.status === "overdue" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusAction(inv);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
                            title="Send Reminder"
                          >
                            <Bell className="w-3 h-3" />
                            Remind
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(inv);
                          }}
                          className="p-2 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, inv.id)}
                          className="p-2 rounded-lg text-[#111827] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                          title="Delete"
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
      )}

      {/* New Invoice Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice" size="xl">
        <InvoiceForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          contactName={getContactName(previewInvoice.contact_id)}
          items={invoiceItems[previewInvoice.id] || []}
          open={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
    </div>
  );
}
