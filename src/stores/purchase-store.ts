import { create } from "zustand";
import type { PurchaseOrder, PurchaseOrderLine } from "@/types";

interface PurchaseFilters {
  status: string;
}

interface PurchaseState {
  orders: PurchaseOrder[];
  orderLines: Record<string, PurchaseOrderLine[]>;
  searchQuery: string;
  filters: PurchaseFilters;
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof PurchaseFilters, value: string) => void;
  resetFilters: () => void;
  addOrder: (order: PurchaseOrder, lines: PurchaseOrderLine[]) => void;
  updateOrder: (id: string, data: Partial<PurchaseOrder>) => void;
  deleteOrder: (id: string) => void;
  filteredOrders: () => PurchaseOrder[];
  getVendorName: (vendorId: string) => string;
}

const vendorNameMap: Record<string, string> = {
  v1: "GlobalPharma Inc.",
  v2: "MedEquip Solutions",
  v3: "BioSupply Labs",
  v4: "PharmaDirect",
  v5: "LabTech Supplies",
};

const mockOrders: PurchaseOrder[] = [
  { id: "po1", org_id: "org1", vendor_id: "v1", order_number: "PO-2026-001", status: "received", order_date: "2026-02-10", expected_date: "2026-02-18", subtotal: 8500.00, tax: 1105.00, total: 9605.00, notes: "", created_at: "2026-02-10T10:00:00Z" },
  { id: "po2", org_id: "org1", vendor_id: "v2", order_number: "PO-2026-002", status: "sent", order_date: "2026-02-09", expected_date: "2026-02-22", subtotal: 3200.00, tax: 416.00, total: 3616.00, notes: "", created_at: "2026-02-09T10:00:00Z" },
  { id: "po3", org_id: "org1", vendor_id: "v3", order_number: "PO-2026-003", status: "draft", order_date: "2026-02-07", expected_date: "2026-02-25", subtotal: 1750.00, tax: 227.50, total: 1977.50, notes: "", created_at: "2026-02-07T10:00:00Z" },
  { id: "po4", org_id: "org1", vendor_id: "v4", order_number: "PO-2026-004", status: "billed", order_date: "2026-02-04", expected_date: "2026-02-12", subtotal: 6400.00, tax: 832.00, total: 7232.00, notes: "", created_at: "2026-02-04T10:00:00Z" },
  { id: "po5", org_id: "org1", vendor_id: "v5", order_number: "PO-2026-005", status: "cancelled", order_date: "2026-02-02", expected_date: "2026-02-15", subtotal: 950.00, tax: 123.50, total: 1073.50, notes: "Vendor out of stock", created_at: "2026-02-02T10:00:00Z" },
];

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  orders: mockOrders,
  orderLines: {},
  searchQuery: "",
  filters: { status: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { status: "" }, searchQuery: "" }),

  addOrder: (order, lines) =>
    set((state) => ({
      orders: [order, ...state.orders],
      orderLines: { ...state.orderLines, [order.id]: lines },
    })),

  updateOrder: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    })),

  deleteOrder: (id) =>
    set((state) => {
      const newLines = { ...state.orderLines };
      delete newLines[id];
      return {
        orders: state.orders.filter((o) => o.id !== id),
        orderLines: newLines,
      };
    }),

  filteredOrders: () => {
    const { orders, searchQuery, filters } = get();
    return orders.filter((o) => {
      const vName = get().getVendorName(o.vendor_id);
      const matchesSearch =
        !searchQuery ||
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || o.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  },

  getVendorName: (vendorId) => {
    return vendorNameMap[vendorId] || vendorId;
  },
}));
