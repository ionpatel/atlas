import { create } from "zustand";
import type { ApprovalWorkflow, ApprovalStep, ApprovalRequest, ApprovalAction } from "@/types";

// Mock workflows
const mockWorkflows: ApprovalWorkflow[] = [
  {
    id: "w1",
    org_id: "org1",
    name: "Expense Approval",
    description: "Standard expense approval workflow based on amount thresholds",
    applies_to: "expenses",
    rules: { amount_min: 0 },
    is_active: true,
    priority: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "s1",
        workflow_id: "w1",
        step_order: 1,
        name: "Manager Approval",
        approver_type: "manager",
        approver_name: "Direct Manager",
        can_delegate: true,
        auto_approve_after_days: 7,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "w2",
    org_id: "org1",
    name: "High-Value Expense Approval",
    description: "Multi-level approval for expenses over $1,000",
    applies_to: "expenses",
    rules: { amount_min: 1000 },
    is_active: true,
    priority: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "s2",
        workflow_id: "w2",
        step_order: 1,
        name: "Manager Approval",
        approver_type: "manager",
        approver_name: "Direct Manager",
        can_delegate: true,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "s3",
        workflow_id: "w2",
        step_order: 2,
        name: "Finance Review",
        approver_type: "department",
        approver_id: "finance",
        approver_name: "Finance Department",
        can_delegate: false,
        auto_approve_after_days: 5,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "w3",
    org_id: "org1",
    name: "Executive Expense Approval",
    description: "Requires executive approval for expenses over $5,000",
    applies_to: "expenses",
    rules: { amount_min: 5000 },
    is_active: true,
    priority: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "s4",
        workflow_id: "w3",
        step_order: 1,
        name: "Manager Approval",
        approver_type: "manager",
        approver_name: "Direct Manager",
        can_delegate: true,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "s5",
        workflow_id: "w3",
        step_order: 2,
        name: "Finance Review",
        approver_type: "department",
        approver_id: "finance",
        approver_name: "Finance Department",
        can_delegate: false,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "s6",
        workflow_id: "w3",
        step_order: 3,
        name: "Executive Approval",
        approver_type: "role",
        approver_id: "executive",
        approver_name: "Executive Team",
        can_delegate: false,
        auto_approve_after_days: 3,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "w4",
    org_id: "org1",
    name: "Purchase Order Approval",
    description: "Approval workflow for purchase orders",
    applies_to: "purchase_orders",
    rules: { amount_min: 500 },
    is_active: true,
    priority: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "s7",
        workflow_id: "w4",
        step_order: 1,
        name: "Department Head",
        approver_type: "manager",
        approver_name: "Department Head",
        can_delegate: true,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "s8",
        workflow_id: "w4",
        step_order: 2,
        name: "Procurement Review",
        approver_type: "department",
        approver_id: "procurement",
        approver_name: "Procurement Team",
        can_delegate: false,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "w5",
    org_id: "org1",
    name: "Contract Approval",
    description: "Legal review for all contracts",
    applies_to: "contracts",
    rules: {},
    is_active: true,
    priority: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "s9",
        workflow_id: "w5",
        step_order: 1,
        name: "Legal Review",
        approver_type: "department",
        approver_id: "legal",
        approver_name: "Legal Department",
        can_delegate: false,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "s10",
        workflow_id: "w5",
        step_order: 2,
        name: "Executive Sign-off",
        approver_type: "role",
        approver_id: "executive",
        approver_name: "Executive Team",
        can_delegate: true,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  },
  {
    id: "w6",
    org_id: "org1",
    name: "Leave Request",
    description: "Manager approval for time off requests",
    applies_to: "leave",
    rules: {},
    is_active: true,
    priority: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "s11",
        workflow_id: "w6",
        step_order: 1,
        name: "Manager Approval",
        approver_type: "manager",
        approver_name: "Direct Manager",
        can_delegate: true,
        auto_approve_after_days: 3,
        notify_on_pending: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  },
];

// Mock approval requests
const mockRequests: ApprovalRequest[] = [
  {
    id: "r1",
    org_id: "org1",
    workflow_id: "w2",
    workflow_name: "High-Value Expense Approval",
    record_type: "expenses",
    record_id: "exp1",
    record_title: "Conference Travel - Las Vegas",
    record_amount: 2500,
    status: "in_progress",
    current_step: 2,
    total_steps: 2,
    submitted_by: "user1",
    submitted_by_name: "John Smith",
    submitted_at: "2024-02-10T09:00:00Z",
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-02-11T14:30:00Z",
  },
  {
    id: "r2",
    org_id: "org1",
    workflow_id: "w1",
    workflow_name: "Expense Approval",
    record_type: "expenses",
    record_id: "exp2",
    record_title: "Office Supplies",
    record_amount: 450,
    status: "pending",
    current_step: 1,
    total_steps: 1,
    submitted_by: "user2",
    submitted_by_name: "Sarah Wilson",
    submitted_at: "2024-02-12T10:30:00Z",
    created_at: "2024-02-12T10:30:00Z",
    updated_at: "2024-02-12T10:30:00Z",
  },
  {
    id: "r3",
    org_id: "org1",
    workflow_id: "w4",
    workflow_name: "Purchase Order Approval",
    record_type: "purchase_orders",
    record_id: "po1",
    record_title: "PO-2024-001 - Office Furniture",
    record_amount: 8500,
    status: "pending",
    current_step: 1,
    total_steps: 2,
    submitted_by: "user3",
    submitted_by_name: "Mike Chen",
    submitted_at: "2024-02-11T14:00:00Z",
    created_at: "2024-02-11T14:00:00Z",
    updated_at: "2024-02-11T14:00:00Z",
  },
  {
    id: "r4",
    org_id: "org1",
    workflow_id: "w6",
    workflow_name: "Leave Request",
    record_type: "leave",
    record_id: "leave1",
    record_title: "Vacation - Feb 20-24",
    status: "approved",
    current_step: 1,
    total_steps: 1,
    submitted_by: "user4",
    submitted_by_name: "Emily Davis",
    submitted_at: "2024-02-05T09:00:00Z",
    completed_at: "2024-02-06T11:30:00Z",
    created_at: "2024-02-05T09:00:00Z",
    updated_at: "2024-02-06T11:30:00Z",
  },
  {
    id: "r5",
    org_id: "org1",
    workflow_id: "w5",
    workflow_name: "Contract Approval",
    record_type: "contracts",
    record_id: "c3",
    record_title: "Marketing Services Contract",
    record_amount: 45000,
    status: "pending",
    current_step: 1,
    total_steps: 2,
    submitted_by: "user1",
    submitted_by_name: "John Smith",
    submitted_at: "2024-02-13T08:00:00Z",
    created_at: "2024-02-13T08:00:00Z",
    updated_at: "2024-02-13T08:00:00Z",
  },
  {
    id: "r6",
    org_id: "org1",
    workflow_id: "w1",
    workflow_name: "Expense Approval",
    record_type: "expenses",
    record_id: "exp3",
    record_title: "Client Dinner",
    record_amount: 380,
    status: "rejected",
    current_step: 1,
    total_steps: 1,
    submitted_by: "user2",
    submitted_by_name: "Sarah Wilson",
    submitted_at: "2024-02-08T16:00:00Z",
    completed_at: "2024-02-09T09:15:00Z",
    created_at: "2024-02-08T16:00:00Z",
    updated_at: "2024-02-09T09:15:00Z",
  },
];

// Mock actions
const mockActions: Record<string, ApprovalAction[]> = {
  r1: [
    {
      id: "a1",
      request_id: "r1",
      step_order: 1,
      approver_name: "Direct Manager",
      action: "approve",
      comments: "Approved for team building",
      acted_at: "2024-02-11T14:30:00Z",
    },
  ],
  r4: [
    {
      id: "a2",
      request_id: "r4",
      step_order: 1,
      approver_name: "Team Lead",
      action: "approve",
      comments: "Have a great vacation!",
      acted_at: "2024-02-06T11:30:00Z",
    },
  ],
  r6: [
    {
      id: "a3",
      request_id: "r6",
      step_order: 1,
      approver_name: "Direct Manager",
      action: "reject",
      comments: "Please provide itemized receipt and client details",
      acted_at: "2024-02-09T09:15:00Z",
    },
  ],
};

interface ApprovalsState {
  workflows: ApprovalWorkflow[];
  requests: ApprovalRequest[];
  actions: Record<string, ApprovalAction[]>;
  filterStatus: string;
  filterType: string;
  searchQuery: string;

  // Actions
  setFilterStatus: (status: string) => void;
  setFilterType: (type: string) => void;
  setSearchQuery: (query: string) => void;

  addWorkflow: (workflow: ApprovalWorkflow) => void;
  updateWorkflow: (id: string, updates: Partial<ApprovalWorkflow>) => void;
  deleteWorkflow: (id: string) => void;
  addStep: (workflowId: string, step: ApprovalStep) => void;
  updateStep: (workflowId: string, stepId: string, updates: Partial<ApprovalStep>) => void;
  removeStep: (workflowId: string, stepId: string) => void;
  reorderSteps: (workflowId: string, stepIds: string[]) => void;

  submitRequest: (request: ApprovalRequest) => void;
  approveRequest: (requestId: string, comments?: string) => void;
  rejectRequest: (requestId: string, comments?: string) => void;
  cancelRequest: (requestId: string) => void;

  // Selectors
  getWorkflowById: (id: string) => ApprovalWorkflow | undefined;
  getWorkflowsByType: (type: string) => ApprovalWorkflow[];
  getActiveWorkflows: () => ApprovalWorkflow[];
  filteredRequests: () => ApprovalRequest[];
  getPendingRequests: () => ApprovalRequest[];
  getRequestActions: (requestId: string) => ApprovalAction[];
  getRequestsByRecord: (recordType: string, recordId: string) => ApprovalRequest[];
  getStats: () => {
    pending: number;
    approved: number;
    rejected: number;
    avgApprovalTime: number;
  };
}

export const useApprovalsStore = create<ApprovalsState>((set, get) => ({
  workflows: mockWorkflows,
  requests: mockRequests,
  actions: mockActions,
  filterStatus: "",
  filterType: "",
  searchQuery: "",

  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterType: (type) => set({ filterType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addWorkflow: (workflow) =>
    set((s) => ({ workflows: [...s.workflows, workflow] })),

  updateWorkflow: (id, updates) =>
    set((s) => ({
      workflows: s.workflows.map((w) =>
        w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w
      ),
    })),

  deleteWorkflow: (id) =>
    set((s) => ({
      workflows: s.workflows.filter((w) => w.id !== id),
    })),

  addStep: (workflowId, step) =>
    set((s) => ({
      workflows: s.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        const steps = w.steps || [];
        return {
          ...w,
          steps: [...steps, { ...step, step_order: steps.length + 1 }],
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  updateStep: (workflowId, stepId, updates) =>
    set((s) => ({
      workflows: s.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          steps: (w.steps || []).map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  removeStep: (workflowId, stepId) =>
    set((s) => ({
      workflows: s.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        const steps = (w.steps || [])
          .filter((step) => step.id !== stepId)
          .map((step, i) => ({ ...step, step_order: i + 1 }));
        return { ...w, steps, updated_at: new Date().toISOString() };
      }),
    })),

  reorderSteps: (workflowId, stepIds) =>
    set((s) => ({
      workflows: s.workflows.map((w) => {
        if (w.id !== workflowId) return w;
        const stepMap = new Map((w.steps || []).map((s) => [s.id, s]));
        const steps = stepIds
          .map((id, i) => {
            const step = stepMap.get(id);
            return step ? { ...step, step_order: i + 1 } : null;
          })
          .filter(Boolean) as ApprovalStep[];
        return { ...w, steps, updated_at: new Date().toISOString() };
      }),
    })),

  submitRequest: (request) =>
    set((s) => ({ requests: [...s.requests, request] })),

  approveRequest: (requestId, comments) =>
    set((s) => {
      const request = s.requests.find((r) => r.id === requestId);
      if (!request) return s;

      const action: ApprovalAction = {
        id: crypto.randomUUID(),
        request_id: requestId,
        step_order: request.current_step,
        approver_name: "Current User",
        action: "approve",
        comments,
        acted_at: new Date().toISOString(),
      };

      const isLastStep = request.current_step >= request.total_steps;
      const newStatus = isLastStep ? "approved" : "in_progress";
      const newStep = isLastStep ? request.current_step : request.current_step + 1;

      return {
        requests: s.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: newStatus,
                current_step: newStep,
                completed_at: isLastStep ? new Date().toISOString() : undefined,
                updated_at: new Date().toISOString(),
              }
            : r
        ),
        actions: {
          ...s.actions,
          [requestId]: [...(s.actions[requestId] || []), action],
        },
      };
    }),

  rejectRequest: (requestId, comments) =>
    set((s) => {
      const request = s.requests.find((r) => r.id === requestId);
      if (!request) return s;

      const action: ApprovalAction = {
        id: crypto.randomUUID(),
        request_id: requestId,
        step_order: request.current_step,
        approver_name: "Current User",
        action: "reject",
        comments,
        acted_at: new Date().toISOString(),
      };

      return {
        requests: s.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "rejected",
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : r
        ),
        actions: {
          ...s.actions,
          [requestId]: [...(s.actions[requestId] || []), action],
        },
      };
    }),

  cancelRequest: (requestId) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "cancelled",
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : r
      ),
    })),

  getWorkflowById: (id) => get().workflows.find((w) => w.id === id),

  getWorkflowsByType: (type) =>
    get()
      .workflows.filter((w) => w.applies_to === type)
      .sort((a, b) => b.priority - a.priority),

  getActiveWorkflows: () =>
    get().workflows.filter((w) => w.is_active),

  filteredRequests: () => {
    const { requests, filterStatus, filterType, searchQuery } = get();
    let filtered = requests;

    if (filterStatus) {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    if (filterType) {
      filtered = filtered.filter((r) => r.record_type === filterType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.record_title?.toLowerCase().includes(q) ||
          r.submitted_by_name?.toLowerCase().includes(q) ||
          r.workflow_name?.toLowerCase().includes(q)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
  },

  getPendingRequests: () =>
    get().requests.filter((r) => r.status === "pending" || r.status === "in_progress"),

  getRequestActions: (requestId) => get().actions[requestId] || [],

  getRequestsByRecord: (recordType, recordId) =>
    get().requests.filter(
      (r) => r.record_type === recordType && r.record_id === recordId
    ),

  getStats: () => {
    const { requests } = get();
    const pending = requests.filter(
      (r) => r.status === "pending" || r.status === "in_progress"
    ).length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;

    // Calculate average approval time (in hours)
    const completedRequests = requests.filter(
      (r) => r.status === "approved" && r.completed_at && r.submitted_at
    );
    const totalTime = completedRequests.reduce((sum, r) => {
      const submitted = new Date(r.submitted_at).getTime();
      const completed = new Date(r.completed_at!).getTime();
      return sum + (completed - submitted);
    }, 0);
    const avgApprovalTime =
      completedRequests.length > 0
        ? totalTime / completedRequests.length / (1000 * 60 * 60)
        : 0;

    return { pending, approved, rejected, avgApprovalTime };
  },
}));
