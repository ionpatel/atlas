import { create } from "zustand";
import type { Lead } from "@/types";

interface CRMFilters {
  stage: string;
  assigned_to: string;
}

interface CRMState {
  leads: Lead[];
  searchQuery: string;
  filters: CRMFilters;
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof CRMFilters, value: string) => void;
  resetFilters: () => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  filteredLeads: () => Lead[];
  getLeadsByStage: (stage: Lead["stage"]) => Lead[];
}

const mockLeads: Lead[] = [
  {
    id: "l1", org_id: "org1", name: "ERP Implementation",
    contact_name: "Sarah Johnson", company: "TechVault Inc.", email: "sarah@techvault.com", phone: "(416) 555-1001",
    amount: 75000, stage: "new", priority: 2, tags: ["Enterprise", "Software"],
    assigned_to: "Alex M.", next_activity: "email", next_activity_date: "2026-02-15",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "l2", org_id: "org1", name: "Cloud Migration Project",
    contact_name: "Michael Chen", company: "DataStream Corp", email: "m.chen@datastream.io",
    amount: 120000, stage: "qualified", priority: 3, tags: ["Cloud", "Enterprise"],
    assigned_to: "Jordan K.", next_activity: "call", next_activity_date: "2026-02-13",
    created_at: "2026-01-18T10:00:00Z",
  },
  {
    id: "l3", org_id: "org1", name: "Website Redesign",
    contact_name: "Emily Davis", company: "BrightLeaf Media", email: "emily@brightleaf.ca", phone: "(905) 555-2002",
    amount: 35000, stage: "new", priority: 1, tags: ["Design", "Web"],
    assigned_to: "Alex M.", next_activity: "meeting", next_activity_date: "2026-02-14",
    created_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "l4", org_id: "org1", name: "Annual Support Contract",
    contact_name: "Robert Kim", company: "NovaPharma Ltd.", email: "r.kim@novapharma.com",
    amount: 48000, stage: "proposition", priority: 2, tags: ["Support", "Healthcare"],
    assigned_to: "Sam T.", next_activity: "email", next_activity_date: "2026-02-16",
    created_at: "2026-01-22T10:00:00Z",
  },
  {
    id: "l5", org_id: "org1", name: "Mobile App Development",
    contact_name: "Lisa Park", company: "UrbanFlow", email: "lisa@urbanflow.co", phone: "(647) 555-3003",
    amount: 95000, stage: "qualified", priority: 3, tags: ["Mobile", "Development"],
    assigned_to: "Jordan K.",
    created_at: "2026-01-25T10:00:00Z",
  },
  {
    id: "l6", org_id: "org1", name: "Data Analytics Platform",
    contact_name: "David Torres", company: "InsightIQ", email: "david@insightiq.com",
    amount: 62000, stage: "proposition", priority: 2, tags: ["Analytics", "SaaS"],
    assigned_to: "Alex M.", next_activity: "call", next_activity_date: "2026-02-18",
    created_at: "2026-01-28T10:00:00Z",
  },
  {
    id: "l7", org_id: "org1", name: "Office 365 Rollout",
    contact_name: "Amanda White", company: "Sterling & Co.", email: "a.white@sterlingco.com",
    amount: 28000, stage: "won", priority: 1, tags: ["Cloud", "Productivity"],
    assigned_to: "Sam T.",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "l8", org_id: "org1", name: "Security Audit & Compliance",
    contact_name: "James Liu", company: "VaultSecure", email: "james@vaultsecure.io", phone: "(416) 555-4004",
    amount: 55000, stage: "new", priority: 2, tags: ["Security", "Compliance"],
    assigned_to: "Jordan K.", next_activity: "meeting", next_activity_date: "2026-02-20",
    created_at: "2026-02-03T10:00:00Z",
  },
  {
    id: "l9", org_id: "org1", name: "HR System Integration",
    contact_name: "Nina Patel", company: "PeopleFirst HR", email: "nina@peoplefirst.ca",
    amount: 42000, stage: "qualified", priority: 1, tags: ["HR", "Integration"],
    assigned_to: "Sam T.", next_activity: "email", next_activity_date: "2026-02-17",
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    id: "l10", org_id: "org1", name: "E-commerce Platform",
    contact_name: "Chris Evans", company: "ShopNest", email: "chris@shopnest.com",
    amount: 88000, stage: "won", priority: 3, tags: ["E-commerce", "Development"],
    assigned_to: "Alex M.",
    created_at: "2026-02-08T10:00:00Z",
  },
];

export const useCRMStore = create<CRMState>((set, get) => ({
  leads: mockLeads,
  searchQuery: "",
  filters: { stage: "", assigned_to: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { stage: "", assigned_to: "" }, searchQuery: "" }),

  addLead: (lead) =>
    set((state) => ({ leads: [lead, ...state.leads] })),

  updateLead: (id, data) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),

  deleteLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== id),
    })),

  filteredLeads: () => {
    const { leads, searchQuery, filters } = get();
    return leads.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = !filters.stage || l.stage === filters.stage;
      const matchesAssigned = !filters.assigned_to || l.assigned_to === filters.assigned_to;
      return matchesSearch && matchesStage && matchesAssigned;
    });
  },

  getLeadsByStage: (stage) => {
    const { leads, searchQuery } = get();
    return leads.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase());
      return l.stage === stage && matchesSearch;
    });
  },
}));
