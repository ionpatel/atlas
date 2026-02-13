import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, InvoiceItem } from "@/types";

interface InvoicesFilters {
  status: string;
}

interface InvoicesState {
  invoices: Invoice[];
  invoiceItems: Record<string, InvoiceItem[]>;
  searchQuery: string;
  filters: InvoicesFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof InvoicesFilters, value: string) => void;
  resetFilters: () => void;

  // Async CRUD
  fetchInvoices: (orgId: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, "id" | "created_at">, items: Omit<InvoiceItem, "id" | "invoice_id">[]) => Promise<Invoice | null>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  fetchInvoiceItems: (invoiceId: string) => Promise<InvoiceItem[]>;

  // Computed
  filteredInvoices: () => Invoice[];
  getContactName: (contactId: string) => string;
  getInvoicesForContact: (contactId: string) => Invoice[];
}

// Mock data for demo mode
const mockInvoices: Invoice[] = [
  { id: "inv1", org_id: "org1", contact_id: "c3", invoice_number: "INV-2026-001", status: "paid", issue_date: "2026-01-15", due_date: "2026-01-30", subtotal: 1250.00, tax: 162.50, total: 1412.50, notes: "", payment_terms: "net15", currency: "CAD", created_at: "2026-01-15T10:00:00Z" },
  { id: "inv2", org_id: "org1", contact_id: "c5", invoice_number: "INV-2026-002", status: "sent", issue_date: "2026-01-20", due_date: "2026-02-19", subtotal: 3200.00, tax: 416.00, total: 3616.00, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-01-20T10:00:00Z" },
  { id: "inv3", org_id: "org1", contact_id: "c4", invoice_number: "INV-2026-003", status: "overdue", issue_date: "2026-01-05", due_date: "2026-01-20", subtotal: 850.00, tax: 110.50, total: 960.50, notes: "", payment_terms: "net15", currency: "CAD", created_at: "2026-01-05T10:00:00Z" },
  { id: "inv4", org_id: "org1", contact_id: "c3", invoice_number: "INV-2026-004", status: "draft", issue_date: "2026-02-01", due_date: "2026-03-02", subtotal: 2100.00, tax: 273.00, total: 2373.00, notes: "Pending approval", payment_terms: "net30", currency: "CAD", created_at: "2026-02-01T10:00:00Z" },
  { id: "inv5", org_id: "org1", contact_id: "c5", invoice_number: "INV-2026-005", status: "paid", issue_date: "2026-01-10", due_date: "2026-02-09", subtotal: 4500.00, tax: 585.00, total: 5085.00, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-01-10T10:00:00Z" },
];

const contactNameMap: Record<string, string> = {
  c1: "MedSupply Co.",
  c2: "HealthFirst Dist.",
  c3: "Sarah Johnson",
  c4: "CarePharm Ltd.",
  c5: "Dr. Michael Chen",
};

const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: [],
  invoiceItems: {},
  searchQuery: "",
  filters: { status: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { status: "" }, searchQuery: "" }),

  fetchInvoices: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ invoices: mockInvoices, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ invoices: data || [], loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch invoices";
      set({ error: message, loading: false });
    }
  },

  addInvoice: async (invoice, items) => {
    if (!isSupabaseConfigured()) {
      const newInvoice: Invoice = {
        ...invoice,
        id: `inv${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const newItems = items.map((item, idx) => ({
        ...item,
        id: `item${Date.now()}-${idx}`,
        invoice_id: newInvoice.id,
      }));
      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
        invoiceItems: { ...state.invoiceItems, [newInvoice.id]: newItems },
      }));
      return newInvoice;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      
      // Insert invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoice)
        .select()
        .single();

      if (invoiceError) {
        set({ error: invoiceError.message, loading: false });
        return null;
      }

      // Insert items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map((item) => ({
          ...item,
          invoice_id: invoiceData.id,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsWithInvoiceId);

        if (itemsError) {
          console.error("Error adding invoice items:", itemsError);
        }
      }

      set((state) => ({
        invoices: [invoiceData, ...state.invoices],
        loading: false,
      }));

      return invoiceData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add invoice";
      set({ error: message, loading: false });
      return null;
    }
  },

  updateInvoice: async (id, data) => {
    if (!isSupabaseConfigured()) {
      set((state) => ({
        invoices: state.invoices.map((i) =>
          i.id === id ? { ...i, ...data } : i
        ),
      }));
      return true;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("invoices")
        .update(data)
        .eq("id", id);

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      set((state) => ({
        invoices: state.invoices.map((i) =>
          i.id === id ? { ...i, ...data } : i
        ),
        loading: false,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update invoice";
      set({ error: message, loading: false });
      return false;
    }
  },

  deleteInvoice: async (id) => {
    if (!isSupabaseConfigured()) {
      set((state) => {
        const newItems = { ...state.invoiceItems };
        delete newItems[id];
        return {
          invoices: state.invoices.filter((i) => i.id !== id),
          invoiceItems: newItems,
        };
      });
      return true;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      set((state) => {
        const newItems = { ...state.invoiceItems };
        delete newItems[id];
        return {
          invoices: state.invoices.filter((i) => i.id !== id),
          invoiceItems: newItems,
          loading: false,
        };
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete invoice";
      set({ error: message, loading: false });
      return false;
    }
  },

  fetchInvoiceItems: async (invoiceId: string) => {
    if (!isSupabaseConfigured()) {
      return get().invoiceItems[invoiceId] || [];
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId);

      if (error) {
        console.error("Error fetching invoice items:", error);
        return [];
      }

      set((state) => ({
        invoiceItems: { ...state.invoiceItems, [invoiceId]: data || [] },
      }));

      return data || [];
    } catch (err) {
      console.error("Error fetching invoice items:", err);
      return [];
    }
  },

  filteredInvoices: () => {
    const { invoices, searchQuery, filters } = get();
    return invoices.filter((i) => {
      const cName = get().getContactName(i.contact_id);
      const matchesSearch =
        !searchQuery ||
        i.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || i.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  },

  getContactName: (contactId) => {
    return contactNameMap[contactId] || contactId;
  },

  getInvoicesForContact: (contactId) => {
    const { invoices } = get();
    return invoices.filter((inv) => inv.contact_id === contactId);
  },
}));
