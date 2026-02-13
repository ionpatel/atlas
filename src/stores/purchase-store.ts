import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
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

  // Async CRUD
  fetchOrders: (orgId: string) => Promise<void>;
  addOrder: (order: Omit<PurchaseOrder, "id" | "created_at">, lines: Omit<PurchaseOrderLine, "id" | "order_id">[]) => Promise<PurchaseOrder | null>;
  updateOrder: (id: string, data: Partial<PurchaseOrder>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  fetchOrderLines: (orderId: string) => Promise<PurchaseOrderLine[]>;

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

const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
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
        .from("purchase_orders")
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
      const newOrder: PurchaseOrder = {
        ...order,
        id: `po${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const newLines = lines.map((line, idx) => ({
        ...line,
        id: `pol${Date.now()}-${idx}`,
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
        .from("purchase_orders")
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

        await supabase.from("purchase_order_lines").insert(linesWithOrderId);
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
    // Update local state first
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    }));

    if (!isSupabaseConfigured()) {
      return true;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("purchase_orders")
        .update(data)
        .eq("id", id);

      return !error;
    } catch (err) {
      console.error("Error updating order:", err);
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
        .from("purchase_orders")
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
        .from("purchase_order_lines")
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
