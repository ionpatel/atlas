"use client";

import { useState } from "react";
import { Truck, Plus, Search, Filter, Trash2, X } from "lucide-react";
import { usePurchaseStore } from "@/stores/purchase-store";
import { Modal } from "@/components/ui/modal";
import { PurchaseOrderForm } from "@/components/modules/purchase-order-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PurchaseOrder, PurchaseOrderLine } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-[#222222] text-[#888888] border-[#2a2a2a]",
    sent: "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20",
    received: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    billed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-[#222222] text-[#555555] border-[#2a2a2a]",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
}

export default function PurchasePage() {
  const {
    orders,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addOrder,
    deleteOrder,
    filteredOrders,
    getVendorName,
  } = usePurchaseStore();

  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filteredOrders();

  const handleCreate = (
    orderData: Omit<PurchaseOrder, "id" | "org_id" | "created_at">,
    lines: Omit<PurchaseOrderLine, "id" | "order_id">[]
  ) => {
    const id = crypto.randomUUID();
    const order: PurchaseOrder = {
      ...orderData,
      id,
      org_id: "org1",
      created_at: new Date().toISOString(),
    };
    const fullLines: PurchaseOrderLine[] = lines.map((line) => ({
      ...line,
      id: crypto.randomUUID(),
      order_id: id,
    }));
    addOrder(order, fullLines);
    setModalOpen(false);
    addToast("Purchase order created successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteOrder(id);
    addToast("Purchase order deleted", "info");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
            Purchase Orders
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            {filtered.length} of {orders.length} orders
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Purchase Order
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search purchase orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#888888] hover:text-[#f5f0eb]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.status
              ? "border-[#CDB49E]/50 text-[#CDB49E] bg-[#3a3028]/50"
              : "border-[#2a2a2a] text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
            <option value="billed">Billed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">PO #</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Vendor</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Date</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Expected Date</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Amount</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-[#888888] text-sm">
                  <Truck className="w-8 h-8 mx-auto mb-3 text-[#888888]/40" />
                  No purchase orders found
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => (
                <tr
                  key={order.id}
                  className={`hover:bg-[#222222] transition-colors duration-150 cursor-pointer border-b border-[#2a2a2a]/50 last:border-0 ${
                    i % 2 === 1 ? "bg-[#111111]/40" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3a3028] flex items-center justify-center flex-shrink-0">
                        <Truck className="w-3.5 h-3.5 text-[#CDB49E]" />
                      </div>
                      <span className="text-sm font-medium text-[#f5f0eb] font-mono">{order.order_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#f5f0eb]">{getVendorName(order.vendor_id)}</td>
                  <td className="px-6 py-4 text-sm text-[#888888]">{formatDate(order.order_date)}</td>
                  <td className="px-6 py-4 text-sm text-[#888888]">{order.expected_date ? formatDate(order.expected_date) : "—"}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-[#CDB49E]">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDelete(e, order.id)}
                      className="p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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

      {/* New Purchase Order Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order" size="xl">
        <PurchaseOrderForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
