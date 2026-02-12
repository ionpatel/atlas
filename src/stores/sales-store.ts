import { create } from "zustand";
import type { SalesOrder, SalesOrderLine } from "@/types";

interface SalesFilters {
  status: string;
}

interface SalesState {
  orders: SalesOrder[];
  orderLines: Record<string, SalesOrderLine[]>;
  searchQuery: string;
  filters: SalesFilters;
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof SalesFilters, value: string) => void;
  resetFilters: () => void;
  addOrder: (order: SalesOrder, lines: SalesOrderLine[]) => void;
  updateOrder: (id: string, data: Partial<SalesOrder>) => void;
  deleteOrder: (id: string) => void;
  filteredOrders: () => SalesOrder[];
  getContactName: (contactId: string) => string;
}

const contactNameMap: Record<string, string> = {
  c1: "MedSupply Co.",
  c2: "HealthFirst Dist.",
  c4: "CarePharm Ltd.",
  c5: "Dr. Michael Chen",
  c_wellbeing: "WellBeing Inc.",
  c_pharmaplus: "PharmaPlus",
};

const mockOrders: SalesOrder[] = [
  { id: "so1", org_id: "org1", contact_id: "c1", order_number: "SO-2026-001", status: "confirmed", order_date: "2026-02-10", delivery_date: "2026-02-17", subtotal: 3200.00, tax: 416.00, total: 3616.00, notes: "", created_at: "2026-02-10T10:00:00Z" },
  { id: "so2", org_id: "org1", contact_id: "c2", order_number: "SO-2026-002", status: "draft", order_date: "2026-02-09", delivery_date: "2026-02-20", subtotal: 1450.00, tax: 188.50, total: 1638.50, notes: "", created_at: "2026-02-09T10:00:00Z" },
  { id: "so3", org_id: "org1", contact_id: "c4", order_number: "SO-2026-003", status: "invoiced", order_date: "2026-02-07", delivery_date: "2026-02-14", subtotal: 5600.00, tax: 728.00, total: 6328.00, notes: "", created_at: "2026-02-07T10:00:00Z" },
  { id: "so4", org_id: "org1", contact_id: "c_wellbeing", order_number: "SO-2026-004", status: "cancelled", order_date: "2026-02-05", subtotal: 890.00, tax: 115.70, total: 1005.70, notes: "Cancelled by customer", created_at: "2026-02-05T10:00:00Z" },
  { id: "so5", org_id: "org1", contact_id: "c_pharmaplus", order_number: "SO-2026-005", status: "confirmed", order_date: "2026-02-03", delivery_date: "2026-02-12", subtotal: 2750.00, tax: 357.50, total: 3107.50, notes: "", created_at: "2026-02-03T10:00:00Z" },
];

export const useSalesStore = create<SalesState>((set, get) => ({
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
      const cName = get().getContactName(o.contact_id);
      const matchesSearch =
        !searchQuery ||
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || o.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  },

  getContactName: (contactId) => {
    return contactNameMap[contactId] || contactId;
  },
}));
