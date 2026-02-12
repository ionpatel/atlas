import { create } from "zustand";
import type { Contact } from "@/types";

interface ContactsFilters {
  type: string;
}

interface ContactsState {
  contacts: Contact[];
  searchQuery: string;
  filters: ContactsFilters;
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof ContactsFilters, value: string) => void;
  resetFilters: () => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  filteredContacts: () => Contact[];
}

const mockContacts: Contact[] = [
  { id: "c1", org_id: "org1", name: "MedSupply Co.", type: "vendor", email: "orders@medsupply.com", phone: "(416) 555-0101", company: "MedSupply Corp", address: "123 Pharma Ave, Toronto", notes: "", created_at: "2026-01-10T10:00:00Z" },
  { id: "c2", org_id: "org1", name: "HealthFirst Dist.", type: "vendor", email: "sales@healthfirst.ca", phone: "(905) 555-0202", company: "HealthFirst", address: "456 Health Blvd, Mississauga", notes: "", created_at: "2026-01-11T10:00:00Z" },
  { id: "c3", org_id: "org1", name: "Sarah Johnson", type: "customer", email: "sarah.j@email.com", phone: "(647) 555-0303", company: "Walk-in", address: "", notes: "Regular customer", created_at: "2026-01-12T10:00:00Z" },
  { id: "c4", org_id: "org1", name: "CarePharm Ltd.", type: "both", email: "info@carepharm.com", phone: "(416) 555-0404", company: "CarePharm", address: "789 Care St, Toronto", notes: "", created_at: "2026-01-13T10:00:00Z" },
  { id: "c5", org_id: "org1", name: "Dr. Michael Chen", type: "customer", email: "m.chen@clinic.ca", phone: "(905) 555-0505", company: "Chen Medical", address: "321 Clinic Rd, Brampton", notes: "Prescribes regularly", created_at: "2026-01-14T10:00:00Z" },
];

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: mockContacts,
  searchQuery: "",
  filters: { type: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { type: "" }, searchQuery: "" }),

  addContact: (contact) =>
    set((state) => ({ contacts: [contact, ...state.contacts] })),

  updateContact: (id, data) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),

  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),

  filteredContacts: () => {
    const { contacts, searchQuery, filters } = get();
    return contacts.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = !filters.type || c.type === filters.type;

      return matchesSearch && matchesType;
    });
  },
}));
