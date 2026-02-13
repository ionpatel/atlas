import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { logAuditEvent } from "@/lib/audit";
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

  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof ContactsFilters, value: string) => void;
  resetFilters: () => void;

  // Async CRUD
  fetchContacts: (orgId: string) => Promise<void>;
  addContact: (contact: Omit<Contact, "id" | "created_at">) => Promise<Contact | null>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;

  // Computed
  filteredContacts: () => Contact[];
}

// Mock data for demo mode (no Supabase configured)
const mockContacts: Contact[] = [
  { id: "c1", org_id: "org1", name: "MedSupply Co.", type: "vendor", email: "orders@medsupply.com", phone: "(416) 555-0101", company: "MedSupply Corp", address: "123 Pharma Ave, Toronto", notes: "", created_at: "2026-01-10T10:00:00Z" },
  { id: "c2", org_id: "org1", name: "HealthFirst Dist.", type: "vendor", email: "sales@healthfirst.ca", phone: "(905) 555-0202", company: "HealthFirst", address: "456 Health Blvd, Mississauga", notes: "", created_at: "2026-01-11T10:00:00Z" },
  { id: "c3", org_id: "org1", name: "Sarah Johnson", type: "customer", email: "sarah.j@email.com", phone: "(647) 555-0303", company: "Walk-in", address: "", notes: "Regular customer", created_at: "2026-01-12T10:00:00Z" },
  { id: "c4", org_id: "org1", name: "CarePharm Ltd.", type: "both", email: "info@carepharm.com", phone: "(416) 555-0404", company: "CarePharm", address: "789 Care St, Toronto", notes: "", created_at: "2026-01-13T10:00:00Z" },
  { id: "c5", org_id: "org1", name: "Dr. Michael Chen", type: "customer", email: "m.chen@clinic.ca", phone: "(905) 555-0505", company: "Chen Medical", address: "321 Clinic Rd, Brampton", notes: "Prescribes regularly", created_at: "2026-01-14T10:00:00Z" },
];

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  searchQuery: "",
  filters: { type: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { type: "" }, searchQuery: "" }),

  fetchContacts: async (orgId: string) => {
    // Demo mode: use mock data
    if (!isSupabaseConfigured()) {
      set({ contacts: mockContacts, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error);
        set({ error: error.message, loading: false });
        return;
      }

      set({ contacts: data || [], loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch contacts";
      console.error("Error fetching contacts:", err);
      set({ error: message, loading: false });
    }
  },

  addContact: async (contact) => {
    // Demo mode: add to local state only
    if (!isSupabaseConfigured()) {
      const newContact: Contact = {
        ...contact,
        id: `c${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      set((state) => ({ contacts: [newContact, ...state.contacts] }));
      return newContact;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contacts")
        .insert(contact)
        .select()
        .single();

      if (error) {
        console.error("Error adding contact:", error);
        set({ error: error.message, loading: false });
        return null;
      }

      // Add to local state
      set((state) => ({
        contacts: [data, ...state.contacts],
        loading: false,
      }));

      // Log audit event
      logAuditEvent({
        orgId: data.org_id,
        action: "create",
        tableName: "contacts",
        recordId: data.id,
        newValues: data,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add contact";
      console.error("Error adding contact:", err);
      set({ error: message, loading: false });
      return null;
    }
  },

  updateContact: async (id, data) => {
    // Demo mode: update local state only
    if (!isSupabaseConfigured()) {
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === id ? { ...c, ...data } : c
        ),
      }));
      return true;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      
      // Get current values for audit log
      const { data: oldContact } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("contacts")
        .update(data)
        .eq("id", id);

      if (error) {
        console.error("Error updating contact:", error);
        set({ error: error.message, loading: false });
        return false;
      }

      // Update local state
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === id ? { ...c, ...data } : c
        ),
        loading: false,
      }));

      // Log audit event
      if (oldContact) {
        logAuditEvent({
          orgId: oldContact.org_id,
          action: "update",
          tableName: "contacts",
          recordId: id,
          oldValues: oldContact,
          newValues: { ...oldContact, ...data },
        });
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update contact";
      console.error("Error updating contact:", err);
      set({ error: message, loading: false });
      return false;
    }
  },

  deleteContact: async (id) => {
    // Demo mode: delete from local state only
    if (!isSupabaseConfigured()) {
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
      }));
      return true;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      
      // Get current values for audit log
      const { data: oldContact } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting contact:", error);
        set({ error: error.message, loading: false });
        return false;
      }

      // Remove from local state
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        loading: false,
      }));

      // Log audit event
      if (oldContact) {
        logAuditEvent({
          orgId: oldContact.org_id,
          action: "delete",
          tableName: "contacts",
          recordId: id,
          oldValues: oldContact,
        });
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete contact";
      console.error("Error deleting contact:", err);
      set({ error: message, loading: false });
      return false;
    }
  },

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
