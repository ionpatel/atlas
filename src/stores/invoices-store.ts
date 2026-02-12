import { create } from "zustand";
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

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof InvoicesFilters, value: string) => void;
  resetFilters: () => void;
  addInvoice: (invoice: Invoice, items: InvoiceItem[]) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  filteredInvoices: () => Invoice[];
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

const mockInvoices: Invoice[] = [
  { id: "inv1", org_id: "org1", contact_id: "c1", invoice_number: "INV-2026-001", status: "paid", issue_date: "2026-02-10", due_date: "2026-03-10", subtotal: 2450.00, tax: 0, total: 2450.00, notes: "", created_at: "2026-02-10T10:00:00Z" },
  { id: "inv2", org_id: "org1", contact_id: "c2", invoice_number: "INV-2026-002", status: "sent", issue_date: "2026-02-08", due_date: "2026-03-08", subtotal: 1890.50, tax: 0, total: 1890.50, notes: "", created_at: "2026-02-08T10:00:00Z" },
  { id: "inv3", org_id: "org1", contact_id: "c4", invoice_number: "INV-2026-003", status: "overdue", issue_date: "2026-02-05", due_date: "2026-03-05", subtotal: 3200.00, tax: 0, total: 3200.00, notes: "", created_at: "2026-02-05T10:00:00Z" },
  { id: "inv4", org_id: "org1", contact_id: "c_wellbeing", invoice_number: "INV-2026-004", status: "draft", issue_date: "2026-02-03", due_date: "2026-03-03", subtotal: 750.25, tax: 0, total: 750.25, notes: "", created_at: "2026-02-03T10:00:00Z" },
  { id: "inv5", org_id: "org1", contact_id: "c_pharmaplus", invoice_number: "INV-2026-005", status: "paid", issue_date: "2026-02-01", due_date: "2026-03-01", subtotal: 4100.00, tax: 0, total: 4100.00, notes: "", created_at: "2026-02-01T10:00:00Z" },
];

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: mockInvoices,
  invoiceItems: {},
  searchQuery: "",
  filters: { status: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { status: "" }, searchQuery: "" }),

  addInvoice: (invoice, items) =>
    set((state) => ({
      invoices: [invoice, ...state.invoices],
      invoiceItems: { ...state.invoiceItems, [invoice.id]: items },
    })),

  updateInvoice: (id, data) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...data } : inv
      ),
    })),

  deleteInvoice: (id) =>
    set((state) => {
      const newItems = { ...state.invoiceItems };
      delete newItems[id];
      return {
        invoices: state.invoices.filter((inv) => inv.id !== id),
        invoiceItems: newItems,
      };
    }),

  filteredInvoices: () => {
    const { invoices, searchQuery, filters } = get();
    return invoices.filter((inv) => {
      const cName = get().getContactName(inv.contact_id);
      const matchesSearch =
        !searchQuery ||
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || inv.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  },

  getContactName: (contactId) => {
    return contactNameMap[contactId] || contactId;
  },
}));
