"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Search, Filter, Trash2, X } from "lucide-react";
import { useSalesStore } from "@/stores/sales-store";
import { Modal } from "@/components/ui/modal";
import { SalesOrderForm } from "@/components/modules/sales-order-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SalesOrder, SalesOrderLine } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-[#D8CAC0] text-[#4A5654] border-[#C9BAB0]",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    invoiced: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-[#D8CAC0] text-[#6B7876] border-[#C9BAB0]",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
}

export default function SalesPage() {
  const {
    orders,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addOrder,
    deleteOrder,
    filteredOrders,
    getContactName,
  } = useSalesStore();

  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filteredOrders();

  const handleCreate = (
    orderData: Omit<SalesOrder, "id" | "org_id" | "created_at">,
    lines: Omit<SalesOrderLine, "id" | "order_id">[]
  ) => {
    const id = crypto.randomUUID();
    const order: SalesOrder = {
      ...orderData,
      id,
      org_id: "org1",
      created_at: new Date().toISOString(),
    };
    const fullLines: SalesOrderLine[] = lines.map((line) => ({
      ...line,
      id: crypto.randomUUID(),
      order_id: id,
    }));
    addOrder(order, fullLines);
    setModalOpen(false);
    addToast("Sales order created successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteOrder(id);
    addToast("Sales order deleted", "info");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A2726]">
            Sales Orders
          </h1>
          <p className="text-[#4A5654] text-sm mt-1">
            {filtered.length} of {orders.length} orders
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-semibold hover:bg-[#344948] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Sales Order
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#273B3A]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#4A5654]" />
          <input
            type="text"
            placeholder="Search sales orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#1A2726] placeholder:text-[#4A5654]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#4A5654] hover:text-[#1A2726]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.status
              ? "border-[#273B3A]/50 text-[#273B3A] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#C9BAB0] text-[#4A5654] hover:text-[#1A2726] hover:bg-[#F0E6E0]"
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
            className="px-4 py-2.5 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="invoiced">Invoiced</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#C9BAB0]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest">Order #</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest">Customer</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest">Date</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest">Delivery Date</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest">Amount</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#4A5654] uppercase tracking-widest w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-[#4A5654] text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-[#4A5654]/40" />
                  No sales orders found
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => (
                <tr
                  key={order.id}
                  className={`hover:bg-[#D8CAC0] transition-colors duration-150 cursor-pointer border-b border-[#C9BAB0]/50 last:border-0 ${
                    i % 2 === 1 ? "bg-[#E6D4C7]/40" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5 text-[#273B3A]" />
                      </div>
                      <span className="text-sm font-medium text-[#1A2726] font-mono">{order.order_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1A2726]">{getContactName(order.contact_id)}</td>
                  <td className="px-6 py-4 text-sm text-[#4A5654]">{formatDate(order.order_date)}</td>
                  <td className="px-6 py-4 text-sm text-[#4A5654]">{order.delivery_date ? formatDate(order.delivery_date) : "—"}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-[#273B3A]">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDelete(e, order.id)}
                      className="p-2 rounded-lg text-[#4A5654] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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

      {/* New Sales Order Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Sales Order" size="xl">
        <SalesOrderForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
