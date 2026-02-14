import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { logAuditEvent } from "@/lib/audit";
import type { LeaveRequest, LeaveBalance, LeavePolicy, LeaveType, LeaveStatus } from "@/types";

interface LeaveFilters {
  type: string;
  status: string;
  userId: string;
}

interface LeaveState {
  requests: LeaveRequest[];
  balances: LeaveBalance[];
  policies: LeavePolicy[];
  searchQuery: string;
  filters: LeaveFilters;
  loading: boolean;
  error: string | null;
  selectedMonth: Date;

  // Async CRUD
  fetchRequests: (orgId: string) => Promise<void>;
  fetchBalances: (orgId: string, year?: number) => Promise<void>;
  fetchPolicies: (orgId: string) => Promise<void>;
  submitRequest: (request: Omit<LeaveRequest, "id" | "created_at" | "status">) => Promise<LeaveRequest | null>;
  approveRequest: (id: string, approverId: string) => Promise<boolean>;
  rejectRequest: (id: string, reason: string) => Promise<boolean>;
  cancelRequest: (id: string) => Promise<boolean>;
  updatePolicy: (id: string, data: Partial<LeavePolicy>) => Promise<boolean>;

  // Sync helpers
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof LeaveFilters, value: string) => void;
  resetFilters: () => void;
  setSelectedMonth: (date: Date) => void;
  filteredRequests: () => LeaveRequest[];
  getUserBalance: (userId: string) => LeaveBalance | undefined;
  getTeamCalendar: () => LeaveRequest[];
}

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const mockRequests: LeaveRequest[] = [
  { id: "lr1", org_id: DEMO_ORG_ID, user_id: "e1", user_name: "Alexandra Mitchell", leave_type: "vacation", start_date: "2026-03-15", end_date: "2026-03-22", days_requested: 5, status: "approved", reason: "Family vacation to Hawaii", approved_by: "e10", approver_name: "Karen Webb", approved_at: "2026-02-01T10:00:00Z", created_at: "2026-01-28T10:00:00Z" },
  { id: "lr2", org_id: DEMO_ORG_ID, user_id: "e3", user_name: "Sam Torres", leave_type: "sick", start_date: "2026-02-10", end_date: "2026-02-11", days_requested: 2, status: "approved", reason: "Flu symptoms", approved_by: "e2", approver_name: "Jordan Kimura", approved_at: "2026-02-10T08:00:00Z", created_at: "2026-02-10T07:30:00Z" },
  { id: "lr3", org_id: DEMO_ORG_ID, user_id: "e6", user_name: "Emily Chen", leave_type: "personal", start_date: "2026-02-20", end_date: "2026-02-20", days_requested: 1, status: "pending", reason: "Personal appointment", created_at: "2026-02-12T14:00:00Z" },
  { id: "lr4", org_id: DEMO_ORG_ID, user_id: "e4", user_name: "Priya Sharma", leave_type: "vacation", start_date: "2026-04-01", end_date: "2026-04-05", days_requested: 5, status: "pending", reason: "Spring break trip", created_at: "2026-02-10T09:00:00Z" },
  { id: "lr5", org_id: DEMO_ORG_ID, user_id: "e7", user_name: "David Park", leave_type: "bereavement", start_date: "2026-01-20", end_date: "2026-01-24", days_requested: 5, status: "approved", reason: "Family bereavement", approved_by: "e1", approver_name: "Alexandra Mitchell", approved_at: "2026-01-19T16:00:00Z", created_at: "2026-01-19T15:00:00Z" },
];

const mockBalances: LeaveBalance[] = [
  { id: "lb1", org_id: DEMO_ORG_ID, user_id: "e1", user_name: "Alexandra Mitchell", year: 2026, vacation_days: 20, sick_days: 10, personal_days: 3, used_vacation: 5, used_sick: 0, used_personal: 1, carried_over: 5 },
  { id: "lb2", org_id: DEMO_ORG_ID, user_id: "e2", user_name: "Jordan Kimura", year: 2026, vacation_days: 18, sick_days: 10, personal_days: 3, used_vacation: 3, used_sick: 2, used_personal: 0, carried_over: 3 },
  { id: "lb3", org_id: DEMO_ORG_ID, user_id: "e3", user_name: "Sam Torres", year: 2026, vacation_days: 15, sick_days: 10, personal_days: 3, used_vacation: 0, used_sick: 2, used_personal: 0, carried_over: 0 },
  { id: "lb4", org_id: DEMO_ORG_ID, user_id: "e4", user_name: "Priya Sharma", year: 2026, vacation_days: 15, sick_days: 10, personal_days: 3, used_vacation: 0, used_sick: 0, used_personal: 0, carried_over: 0 },
  { id: "lb5", org_id: DEMO_ORG_ID, user_id: "e5", user_name: "Marcus Williams", year: 2026, vacation_days: 18, sick_days: 10, personal_days: 3, used_vacation: 8, used_sick: 1, used_personal: 2, carried_over: 3 },
  { id: "lb6", org_id: DEMO_ORG_ID, user_id: "e6", user_name: "Emily Chen", year: 2026, vacation_days: 15, sick_days: 10, personal_days: 3, used_vacation: 2, used_sick: 3, used_personal: 0, carried_over: 0 },
  { id: "lb7", org_id: DEMO_ORG_ID, user_id: "e7", user_name: "David Park", year: 2026, vacation_days: 15, sick_days: 10, personal_days: 3, used_vacation: 0, used_sick: 0, used_personal: 1, carried_over: 2 },
];

const mockPolicies: LeavePolicy[] = [
  { id: "lp1", org_id: DEMO_ORG_ID, leave_type: "vacation", default_days: 15, accrual_rate: 1.25, max_carryover: 5, requires_approval: true, min_notice_days: 14, is_active: true },
  { id: "lp2", org_id: DEMO_ORG_ID, leave_type: "sick", default_days: 10, accrual_rate: 0, max_carryover: 0, requires_approval: false, min_notice_days: 0, is_active: true },
  { id: "lp3", org_id: DEMO_ORG_ID, leave_type: "personal", default_days: 3, accrual_rate: 0, max_carryover: 0, requires_approval: true, min_notice_days: 3, is_active: true },
  { id: "lp4", org_id: DEMO_ORG_ID, leave_type: "unpaid", default_days: 0, accrual_rate: 0, max_carryover: 0, requires_approval: true, min_notice_days: 7, is_active: true },
  { id: "lp5", org_id: DEMO_ORG_ID, leave_type: "bereavement", default_days: 5, accrual_rate: 0, max_carryover: 0, requires_approval: false, min_notice_days: 0, is_active: true },
  { id: "lp6", org_id: DEMO_ORG_ID, leave_type: "parental", default_days: 0, accrual_rate: 0, max_carryover: 0, requires_approval: true, min_notice_days: 30, is_active: true },
];

const isSupabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const LEAVE_TYPE_LABELS: Record<LeaveType, { label: string; color: string }> = {
  vacation: { label: "Vacation", color: "#38BDF8" },
  sick: { label: "Sick Leave", color: "#f87171" },
  personal: { label: "Personal", color: "#a78bfa" },
  unpaid: { label: "Unpaid Leave", color: "#888888" },
  bereavement: { label: "Bereavement", color: "#64748b" },
  parental: { label: "Parental Leave", color: "#34d399" },
};

export const LEAVE_STATUS_STYLES: Record<LeaveStatus, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  pending: { label: "Pending", bgColor: "bg-amber-500/10", textColor: "text-amber-400", borderColor: "border-amber-500/20" },
  approved: { label: "Approved", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400", borderColor: "border-emerald-500/20" },
  rejected: { label: "Rejected", bgColor: "bg-red-500/10", textColor: "text-red-400", borderColor: "border-red-500/20" },
  cancelled: { label: "Cancelled", bgColor: "bg-[#222222]", textColor: "text-[#888888]", borderColor: "border-[#2a2a2a]" },
};

export const useLeaveStore = create<LeaveState>((set, get) => ({
  requests: [],
  balances: [],
  policies: [],
  searchQuery: "",
  filters: { type: "", status: "", userId: "" },
  loading: false,
  error: null,
  selectedMonth: new Date(),

  fetchRequests: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ requests: mockRequests, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*, user:employees!user_id(name), approver:employees!approved_by(name)")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ requests: mockRequests, loading: false });
        return;
      }

      const requests: LeaveRequest[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string,
        user_id: row.user_id as string,
        user_name: (row.user as Record<string, string>)?.name,
        leave_type: row.leave_type as LeaveType,
        start_date: row.start_date as string,
        end_date: row.end_date as string,
        days_requested: row.days_requested as number,
        status: row.status as LeaveStatus,
        reason: row.reason as string | undefined,
        approved_by: row.approved_by as string | undefined,
        approver_name: (row.approver as Record<string, string>)?.name,
        approved_at: row.approved_at as string | undefined,
        rejection_reason: row.rejection_reason as string | undefined,
        created_at: row.created_at as string,
      }));

      set({ requests, loading: false });
    } catch (err) {
      console.error("fetchRequests error:", err);
      set({ requests: mockRequests, loading: false, error: String(err) });
    }
  },

  fetchBalances: async (orgId: string, year?: number) => {
    const targetYear = year || new Date().getFullYear();
    
    if (!isSupabaseConfigured()) {
      set({ balances: mockBalances.filter(b => b.year === targetYear), loading: false });
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leave_balances")
        .select("*, user:employees!user_id(name)")
        .eq("org_id", orgId)
        .eq("year", targetYear);

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ balances: mockBalances.filter(b => b.year === targetYear) });
        return;
      }

      const balances: LeaveBalance[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string,
        user_id: row.user_id as string,
        user_name: (row.user as Record<string, string>)?.name,
        year: row.year as number,
        vacation_days: row.vacation_days as number,
        sick_days: row.sick_days as number,
        personal_days: row.personal_days as number,
        used_vacation: row.used_vacation as number,
        used_sick: row.used_sick as number,
        used_personal: row.used_personal as number,
        carried_over: row.carried_over as number,
      }));

      set({ balances });
    } catch (err) {
      console.error("fetchBalances error:", err);
      set({ balances: mockBalances.filter(b => b.year === targetYear) });
    }
  },

  fetchPolicies: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ policies: mockPolicies, loading: false });
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leave_policies")
        .select("*")
        .eq("org_id", orgId);

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ policies: mockPolicies });
        return;
      }

      const policies: LeavePolicy[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string,
        leave_type: row.leave_type as LeaveType,
        default_days: row.default_days as number,
        accrual_rate: row.accrual_rate as number,
        max_carryover: row.max_carryover as number,
        requires_approval: row.requires_approval as boolean,
        min_notice_days: row.min_notice_days as number,
        is_active: row.is_active as boolean,
      }));

      set({ policies });
    } catch (err) {
      console.error("fetchPolicies error:", err);
      set({ policies: mockPolicies });
    }
  },

  submitRequest: async (requestData) => {
    const id = crypto.randomUUID();
    const newRequest: LeaveRequest = {
      ...requestData,
      id,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    set((state) => ({ requests: [newRequest, ...state.requests] }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("leave_requests").insert({
          id: newRequest.id,
          org_id: newRequest.org_id,
          user_id: newRequest.user_id,
          leave_type: newRequest.leave_type,
          start_date: newRequest.start_date,
          end_date: newRequest.end_date,
          days_requested: newRequest.days_requested,
          status: "pending",
          reason: newRequest.reason,
        });

        if (error) {
          console.error("Error submitting request:", error);
          set((state) => ({ requests: state.requests.filter((r) => r.id !== id) }));
          return null;
        }

        logAuditEvent({
          orgId: newRequest.org_id,
          action: "create",
          tableName: "leave_requests",
          recordId: newRequest.id,
          newValues: newRequest as unknown as Record<string, unknown>,
        });
      } catch (err) {
        console.error("submitRequest error:", err);
        return null;
      }
    }

    return newRequest;
  },

  approveRequest: async (id: string, approverId: string) => {
    const now = new Date().toISOString();

    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, status: "approved" as LeaveStatus, approved_by: approverId, approved_at: now } : r
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("leave_requests")
          .update({ status: "approved", approved_by: approverId, approved_at: now })
          .eq("id", id);

        if (error) {
          console.error("Error approving request:", error);
          return false;
        }
      } catch (err) {
        console.error("approveRequest error:", err);
        return false;
      }
    }

    return true;
  },

  rejectRequest: async (id: string, reason: string) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, status: "rejected" as LeaveStatus, rejection_reason: reason } : r
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("leave_requests")
          .update({ status: "rejected", rejection_reason: reason })
          .eq("id", id);

        if (error) {
          console.error("Error rejecting request:", error);
          return false;
        }
      } catch (err) {
        console.error("rejectRequest error:", err);
        return false;
      }
    }

    return true;
  },

  cancelRequest: async (id: string) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, status: "cancelled" as LeaveStatus } : r
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("leave_requests")
          .update({ status: "cancelled" })
          .eq("id", id);

        if (error) {
          console.error("Error cancelling request:", error);
          return false;
        }
      } catch (err) {
        console.error("cancelRequest error:", err);
        return false;
      }
    }

    return true;
  },

  updatePolicy: async (id: string, data: Partial<LeavePolicy>) => {
    set((state) => ({
      policies: state.policies.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("leave_policies").update(data).eq("id", id);

        if (error) {
          console.error("Error updating policy:", error);
          return false;
        }
      } catch (err) {
        console.error("updatePolicy error:", err);
        return false;
      }
    }

    return true;
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { type: "", status: "", userId: "" }, searchQuery: "" }),

  setSelectedMonth: (date) => set({ selectedMonth: date }),

  filteredRequests: () => {
    const { requests, searchQuery, filters } = get();
    return requests.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filters.type || r.leave_type === filters.type;
      const matchesStatus = !filters.status || r.status === filters.status;
      const matchesUser = !filters.userId || r.user_id === filters.userId;
      return matchesSearch && matchesType && matchesStatus && matchesUser;
    });
  },

  getUserBalance: (userId: string) => {
    const { balances } = get();
    return balances.find((b) => b.user_id === userId);
  },

  getTeamCalendar: () => {
    const { requests, selectedMonth } = get();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    return requests.filter((r) => {
      if (r.status === "rejected" || r.status === "cancelled") return false;
      const startDate = new Date(r.start_date);
      const endDate = new Date(r.end_date);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      return startDate <= monthEnd && endDate >= monthStart;
    });
  },
}));
