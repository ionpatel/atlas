import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
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

  // Async CRUD
  fetchOrders: (orgId: string) => Promise<void>;
  addOrder: (order: Omit<SalesOrder, "id" | "created_at">, lines: Omit<SalesOrderLine, "id" | "order_id">[]) => Promise<SalesOrder | null>;
  updateOrder: (id: string, data: Partial<SalesOrder>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  fetchOrderLines: (orderId: string) => Promise<SalesOrderLine[]>;

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

const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const useSalesStore = create<SalesState>((set, get) => ({
  orders: [],
  orderLines: {},
  searchQuery: "",
  filters: { status: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { status: "" }, searchQuery: "" }),

  fetchOrders: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ orders: mockOrders, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sales_orders")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ orders: data || [], loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch orders";
      set({ error: message, loading: false });
    }
  },

  addOrder: async (order, lines) => {
    if (!isSupabaseConfigured()) {
      const newOrder: SalesOrder = {
        ...order,
        id: `so${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const newLines = lines.map((line, idx) => ({
        ...line,
        id: `sol${Date.now()}-${idx}`,
        order_id: newOrder.id,
      }));
      set((state) => ({
        orders: [newOrder, ...state.orders],
        orderLines: { ...state.orderLines, [newOrder.id]: newLines },
      }));
      return newOrder;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();

      const { data: orderData, error: orderError } = await supabase
        .from("sales_orders")
        .insert(order)
        .select()
        .single();

      if (orderError) {
        set({ error: orderError.message, loading: false });
        return null;
      }

      if (lines.length > 0) {
        const linesWithOrderId = lines.map((line) => ({
          ...line,
          order_id: orderData.id,
        }));

        await supabase.from("sales_order_lines").insert(linesWithOrderId);
      }

      set((state) => ({
        orders: [orderData, ...state.orders],
        loading: false,
      }));

      return orderData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add order";
      set({ error: message, loading: false });
      return null;
    }
  },

  updateOrder: async (id, data) => {
    if (!isSupabaseConfigured()) {
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, ...data } : o
        ),
      }));
      return true;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sales_orders")
        .update(data)
        .eq("id", id);

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, ...data } : o
        ),
        loading: false,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update order";
      set({ error: message, loading: false });
      return false;
    }
  },

  deleteOrder: async (id) => {
    if (!isSupabaseConfigured()) {
      set((state) => {
        const newLines = { ...state.orderLines };
        delete newLines[id];
        return {
          orders: state.orders.filter((o) => o.id !== id),
          orderLines: newLines,
        };
      });
      return true;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sales_orders")
        .delete()
        .eq("id", id);

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      set((state) => {
        const newLines = { ...state.orderLines };
        delete newLines[id];
        return {
          orders: state.orders.filter((o) => o.id !== id),
          orderLines: newLines,
          loading: false,
        };
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete order";
      set({ error: message, loading: false });
      return false;
    }
  },

  fetchOrderLines: async (orderId: string) => {
    if (!isSupabaseConfigured()) {
      return get().orderLines[orderId] || [];
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sales_order_lines")
        .select("*")
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching order lines:", error);
        return [];
      }

      set((state) => ({
        orderLines: { ...state.orderLines, [orderId]: data || [] },
      }));

      return data || [];
    } catch (err) {
      console.error("Error fetching order lines:", err);
      return [];
    }
  },

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
