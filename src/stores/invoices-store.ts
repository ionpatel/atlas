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
  getInvoicesForContact: (contactId: string) => Invoice[];
}

const contactNameMap: Record<string, string> = {
  c1: "MedSupply Co.",
  c2: "HealthFirst Dist.",
  c3: "Sarah Johnson",
  c4: "CarePharm Ltd.",
  c5: "Dr. Michael Chen",
  c_wellbeing: "WellBeing Inc.",
  c_pharmaplus: "PharmaPlus",
};

const mockInvoices: Invoice[] = [
  { id: "inv1", org_id: "org1", contact_id: "c1", invoice_number: "INV-2026-001", status: "paid", issue_date: "2026-02-10", due_date: "2026-03-10", subtotal: 2450.00, tax: 318.50, total: 2768.50, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-02-10T10:00:00Z" },
  { id: "inv2", org_id: "org1", contact_id: "c2", invoice_number: "INV-2026-002", status: "sent", issue_date: "2026-02-08", due_date: "2026-03-08", subtotal: 1890.50, tax: 245.77, total: 2136.27, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-02-08T10:00:00Z" },
  { id: "inv3", org_id: "org1", contact_id: "c4", invoice_number: "INV-2026-003", status: "overdue", issue_date: "2026-01-05", due_date: "2026-02-05", subtotal: 3200.00, tax: 416.00, total: 3616.00, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-01-05T10:00:00Z" },
  { id: "inv4", org_id: "org1", contact_id: "c_wellbeing", invoice_number: "INV-2026-004", status: "draft", issue_date: "2026-02-03", due_date: "2026-03-03", subtotal: 750.25, tax: 97.53, total: 847.78, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-02-03T10:00:00Z" },
  { id: "inv5", org_id: "org1", contact_id: "c_pharmaplus", invoice_number: "INV-2026-005", status: "paid", issue_date: "2026-02-01", due_date: "2026-03-01", subtotal: 4100.00, tax: 533.00, total: 4633.00, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-02-01T10:00:00Z" },
  { id: "inv6", org_id: "org1", contact_id: "c5", invoice_number: "INV-2026-006", status: "sent", issue_date: "2026-02-11", due_date: "2026-03-11", subtotal: 560.00, tax: 72.80, total: 632.80, notes: "", payment_terms: "net30", currency: "CAD", created_at: "2026-02-11T10:00:00Z" },
  { id: "inv7", org_id: "org1", contact_id: "c3", invoice_number: "INV-2026-007", status: "draft", issue_date: "2026-02-12", due_date: "2026-03-12", subtotal: 189.99, tax: 24.70, total: 214.69, notes: "", payment_terms: "due_on_receipt", currency: "CAD", created_at: "2026-02-12T10:00:00Z" },
];

const mockInvoiceItems: Record<string, InvoiceItem[]> = {
  inv1: [
    { id: "ii1", invoice_id: "inv1", product_id: "p1", description: "Amoxicillin 500mg", quantity: 100, unit_price: 12.99, tax_rate: 13, total: 1299.00 },
    { id: "ii2", invoice_id: "inv1", product_id: "p3", description: "Ibuprofen 200mg", quantity: 144, unit_price: 7.99, tax_rate: 13, total: 1151.00 },
  ],
  inv2: [
    { id: "ii3", invoice_id: "inv2", product_id: "p2", description: "Vitamin D3 1000IU", quantity: 200, unit_price: 9.49, tax_rate: 13, total: 1890.50 },
  ],
  inv3: [
    { id: "ii4", invoice_id: "inv3", product_id: "p5", description: "Lisinopril 10mg", quantity: 200, unit_price: 11.29, tax_rate: 13, total: 2258.00 },
    { id: "ii5", invoice_id: "inv3", product_id: "p7", description: "Omeprazole 20mg", quantity: 68, unit_price: 13.79, tax_rate: 13, total: 937.72 },
  ],
};

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: mockInvoices,
  invoiceItems: mockInvoiceItems,
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

  getInvoicesForContact: (contactId) => {
    return get().invoices.filter((inv) => inv.contact_id === contactId);
  },
}));
