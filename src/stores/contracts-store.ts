import { create } from "zustand";
import type { Contract, ContractTemplate, ContractSignature, ContractActivity } from "@/types";

// Mock data
const mockContracts: Contract[] = [
  {
    id: "c1",
    org_id: "org1",
    title: "Software Development Agreement",
    description: "Full-stack development services for e-commerce platform",
    parties: [
      { name: "Atlas Corp", email: "legal@atlas.com", role: "Provider" },
      { name: "Acme Inc", email: "contracts@acme.com", role: "Client" },
    ],
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    value: 150000,
    currency: "CAD",
    payment_terms: "Net 30, monthly milestones",
    status: "active",
    auto_renew: true,
    renewal_days: 30,
    document_url: "/contracts/software-dev.pdf",
    tags: ["software", "development", "priority"],
    notes: "Annual contract with potential for renewal",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "c2",
    org_id: "org1",
    title: "Office Lease Agreement",
    description: "Commercial lease for downtown office space",
    parties: [
      { name: "Atlas Corp", email: "legal@atlas.com", role: "Tenant" },
      { name: "Metro Properties", email: "leasing@metro.com", role: "Landlord" },
    ],
    start_date: "2023-06-01",
    end_date: "2026-05-31",
    value: 72000,
    currency: "CAD",
    payment_terms: "Monthly, due on 1st",
    status: "active",
    auto_renew: false,
    renewal_days: 90,
    tags: ["real-estate", "lease"],
    created_at: "2023-05-15T00:00:00Z",
    updated_at: "2023-05-15T00:00:00Z",
  },
  {
    id: "c3",
    org_id: "org1",
    title: "Marketing Services Contract",
    description: "Digital marketing and SEO services",
    parties: [
      { name: "Atlas Corp", email: "marketing@atlas.com", role: "Client" },
      { name: "Digital Edge Agency", email: "contracts@digitaledge.com", role: "Agency" },
    ],
    start_date: "2024-02-01",
    end_date: "2024-07-31",
    value: 45000,
    currency: "CAD",
    payment_terms: "Quarterly payments",
    status: "pending",
    auto_renew: false,
    renewal_days: 30,
    tags: ["marketing", "digital"],
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "c4",
    org_id: "org1",
    title: "Vendor Supply Agreement",
    description: "Supply of office equipment and supplies",
    parties: [
      { name: "Atlas Corp", email: "procurement@atlas.com", role: "Buyer" },
      { name: "Office Depot Pro", email: "enterprise@officedepot.com", role: "Supplier" },
    ],
    start_date: "2023-01-01",
    end_date: "2024-01-31",
    value: 25000,
    currency: "CAD",
    status: "expired",
    auto_renew: false,
    renewal_days: 30,
    tags: ["vendor", "supplies"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "c5",
    org_id: "org1",
    title: "Consulting Services Agreement",
    description: "Strategic consulting engagement",
    parties: [
      { name: "Atlas Corp", email: "exec@atlas.com", role: "Client" },
      { name: "McKinley Consulting", email: "engagement@mckinley.com", role: "Consultant" },
    ],
    start_date: "2024-03-01",
    end_date: "2024-06-30",
    value: 85000,
    currency: "CAD",
    status: "draft",
    auto_renew: false,
    renewal_days: 14,
    tags: ["consulting", "strategy"],
    created_at: "2024-02-10T00:00:00Z",
    updated_at: "2024-02-10T00:00:00Z",
  },
];

const mockTemplates: ContractTemplate[] = [
  {
    id: "t1",
    org_id: "org1",
    name: "Service Agreement",
    description: "Standard service agreement for professional services",
    content: `<h1>Service Agreement</h1>
<p>This Service Agreement ("Agreement") is entered into as of {{effective_date}} by and between:</p>
<p><strong>Service Provider:</strong> {{provider_name}}</p>
<p><strong>Client:</strong> {{client_name}}</p>
<h2>1. Services</h2>
<p>{{services_description}}</p>
<h2>2. Compensation</h2>
<p>Total Contract Value: {{contract_value}}</p>
<p>Payment Terms: {{payment_terms}}</p>`,
    variables: [
      { name: "effective_date", type: "date", default: "" },
      { name: "provider_name", type: "text", default: "Atlas Corp" },
      { name: "client_name", type: "text", default: "" },
      { name: "services_description", type: "textarea", default: "" },
      { name: "contract_value", type: "number", default: "0" },
      { name: "payment_terms", type: "text", default: "Net 30" },
    ],
    category: "Services",
    is_active: true,
    usage_count: 12,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "t2",
    org_id: "org1",
    name: "Non-Disclosure Agreement",
    description: "Mutual NDA for confidential information sharing",
    content: `<h1>Non-Disclosure Agreement</h1>
<p>This NDA is entered into by {{party_a}} and {{party_b}}.</p>
<h2>Confidential Information</h2>
<p>{{confidential_scope}}</p>
<h2>Term</h2>
<p>This agreement shall remain in effect for {{term_years}} years.</p>`,
    variables: [
      { name: "party_a", type: "text", default: "" },
      { name: "party_b", type: "text", default: "" },
      { name: "confidential_scope", type: "textarea", default: "" },
      { name: "term_years", type: "number", default: "2" },
    ],
    category: "Legal",
    is_active: true,
    usage_count: 8,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "t3",
    org_id: "org1",
    name: "Employment Agreement",
    description: "Standard employment contract",
    content: `<h1>Employment Agreement</h1>
<p>Employee: {{employee_name}}</p>
<p>Position: {{position}}</p>
<p>Start Date: {{start_date}}</p>
<p>Salary: {{salary}}</p>`,
    variables: [
      { name: "employee_name", type: "text", default: "" },
      { name: "position", type: "text", default: "" },
      { name: "start_date", type: "date", default: "" },
      { name: "salary", type: "number", default: "" },
    ],
    category: "HR",
    is_active: true,
    usage_count: 5,
    created_at: "2024-01-01T00:00:00Z",
  },
];

const mockSignatures: Record<string, ContractSignature[]> = {
  c1: [
    {
      id: "s1",
      contract_id: "c1",
      signer_name: "John Smith",
      signer_email: "john@atlas.com",
      signer_role: "CEO",
      status: "signed",
      signed_at: "2024-01-02T14:30:00Z",
      ip_address: "192.168.1.1",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "s2",
      contract_id: "c1",
      signer_name: "Jane Doe",
      signer_email: "jane@acme.com",
      signer_role: "CFO",
      status: "signed",
      signed_at: "2024-01-03T09:15:00Z",
      created_at: "2024-01-01T00:00:00Z",
    },
  ],
  c3: [
    {
      id: "s3",
      contract_id: "c3",
      signer_name: "Sarah Wilson",
      signer_email: "sarah@atlas.com",
      signer_role: "Marketing Director",
      status: "signed",
      signed_at: "2024-01-22T11:00:00Z",
      created_at: "2024-01-20T00:00:00Z",
    },
    {
      id: "s4",
      contract_id: "c3",
      signer_name: "Mike Chen",
      signer_email: "mike@digitaledge.com",
      signer_role: "Account Director",
      status: "pending",
      created_at: "2024-01-20T00:00:00Z",
    },
  ],
};

const mockActivities: Record<string, ContractActivity[]> = {
  c1: [
    { id: "a1", contract_id: "c1", action: "created", actor_name: "System", created_at: "2024-01-01T00:00:00Z" },
    { id: "a2", contract_id: "c1", action: "sent", actor_name: "John Smith", created_at: "2024-01-01T10:00:00Z" },
    { id: "a3", contract_id: "c1", action: "viewed", actor_name: "Jane Doe", created_at: "2024-01-02T08:00:00Z" },
    { id: "a4", contract_id: "c1", action: "signed", actor_name: "John Smith", created_at: "2024-01-02T14:30:00Z" },
    { id: "a5", contract_id: "c1", action: "signed", actor_name: "Jane Doe", created_at: "2024-01-03T09:15:00Z" },
    { id: "a6", contract_id: "c1", action: "activated", actor_name: "System", created_at: "2024-01-03T09:16:00Z" },
  ],
};

interface ContractsState {
  contracts: Contract[];
  templates: ContractTemplate[];
  signatures: Record<string, ContractSignature[]>;
  activities: Record<string, ContractActivity[]>;
  searchQuery: string;
  statusFilter: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  addTemplate: (template: ContractTemplate) => void;
  updateTemplate: (id: string, updates: Partial<ContractTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addSignature: (contractId: string, signature: ContractSignature) => void;
  updateSignature: (contractId: string, signatureId: string, updates: Partial<ContractSignature>) => void;
  
  // Selectors
  filteredContracts: () => Contract[];
  getContractById: (id: string) => Contract | undefined;
  getSignatures: (contractId: string) => ContractSignature[];
  getActivities: (contractId: string) => ContractActivity[];
  getStats: () => {
    totalValue: number;
    activeCount: number;
    expiringSoon: number;
    pendingSignatures: number;
  };
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  contracts: mockContracts,
  templates: mockTemplates,
  signatures: mockSignatures,
  activities: mockActivities,
  searchQuery: "",
  statusFilter: "",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  addContract: (contract) =>
    set((state) => ({
      contracts: [...state.contracts, contract],
    })),

  updateContract: (id, updates) =>
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ),
    })),

  deleteContract: (id) =>
    set((state) => ({
      contracts: state.contracts.filter((c) => c.id !== id),
    })),

  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),

  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),

  addSignature: (contractId, signature) =>
    set((state) => ({
      signatures: {
        ...state.signatures,
        [contractId]: [...(state.signatures[contractId] || []), signature],
      },
    })),

  updateSignature: (contractId, signatureId, updates) =>
    set((state) => ({
      signatures: {
        ...state.signatures,
        [contractId]: (state.signatures[contractId] || []).map((s) =>
          s.id === signatureId ? { ...s, ...updates } : s
        ),
      },
    })),

  filteredContracts: () => {
    const { contracts, searchQuery, statusFilter } = get();
    let filtered = contracts;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.parties.some((p) => p.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getContractById: (id) => get().contracts.find((c) => c.id === id),

  getSignatures: (contractId) => get().signatures[contractId] || [],

  getActivities: (contractId) => get().activities[contractId] || [],

  getStats: () => {
    const { contracts, signatures } = get();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activeContracts = contracts.filter((c) => c.status === "active");
    const expiringSoon = activeContracts.filter((c) => {
      if (!c.end_date) return false;
      const endDate = new Date(c.end_date);
      return endDate <= thirtyDaysFromNow && endDate >= now;
    });

    let pendingSignatures = 0;
    Object.values(signatures).forEach((sigs) => {
      pendingSignatures += sigs.filter((s) => s.status === "pending").length;
    });

    return {
      totalValue: activeContracts.reduce((sum, c) => sum + c.value, 0),
      activeCount: activeContracts.length,
      expiringSoon: expiringSoon.length,
      pendingSignatures,
    };
  },
}));
