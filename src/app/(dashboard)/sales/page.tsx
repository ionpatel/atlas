"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Search, Filter, Trash2, X } from "lucide-react";
import { useSalesStore } from "@/stores/sales-store";
import { Modal } from "@/components/ui/modal";
import { SalesOrderForm } from "@/components/modules/sales-order-form";
import { useToastStore } from "@/components/ui/toast";
import { useSalesInventory } from "@/lib/integrations/use-sales-inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SalesOrder, SalesOrderLine } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-[#0A0A0A] text-[#FAFAFA] border-[#262626]",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    invoiced: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-[#0A0A0A] text-[#FAFAFA] border-[#262626]",
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Sales Orders
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            {filtered.length} of {orders.length} orders
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Sales Order
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#262626]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#FAFAFA]" />
          <input
            type="text"
            placeholder="Search sales orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#FAFAFA] placeholder:text-[#FAFAFA]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#ccc] hover:text-[#FAFAFA]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.status
              ? "border-[#262626]/50 text-[#FAFAFA] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#262626] text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
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
            className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
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
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Order #</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Customer</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Date</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Delivery Date</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Amount</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-[#FAFAFA] text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-[#FAFAFA]/40" />
                  No sales orders found
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => (
                <tr
                  key={order.id}
                  className={`hover:bg-[#0A0A0A] transition-colors duration-150 cursor-pointer border-b border-[#262626]/50 last:border-0 ${
                    i % 2 === 1 ? "bg-[#0A0A0A]/40" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-3.5 h-3.5 text-[#FAFAFA]" />
                      </div>
                      <span className="text-sm font-medium text-[#FAFAFA] font-mono">{order.order_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#FAFAFA]">{getContactName(order.contact_id)}</td>
                  <td className="px-6 py-4 text-sm text-[#FAFAFA]">{formatDate(order.order_date)}</td>
                  <td className="px-6 py-4 text-sm text-[#FAFAFA]">{order.delivery_date ? formatDate(order.delivery_date) : "—"}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-[#FAFAFA]">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDelete(e, order.id)}
                      className="p-2 rounded-lg text-[#FAFAFA] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
