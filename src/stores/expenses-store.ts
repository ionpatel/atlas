import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { logAuditEvent } from "@/lib/audit";
import type { Expense, ExpenseCategory, ExpenseReport, ExpenseStatus } from "@/types";

interface ExpenseFilters {
  category: string;
  status: string;
  userId: string;
  dateRange: { start: string; end: string } | null;
}

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  reports: ExpenseReport[];
  searchQuery: string;
  filters: ExpenseFilters;
  loading: boolean;
  error: string | null;

  // Async CRUD
  fetchExpenses: (orgId: string) => Promise<void>;
  fetchCategories: (orgId?: string) => Promise<void>;
  fetchReports: (orgId: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "created_at" | "status">) => Promise<Expense | null>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  submitExpense: (id: string) => Promise<boolean>;
  approveExpense: (id: string, approverId: string) => Promise<boolean>;
  rejectExpense: (id: string, reason: string) => Promise<boolean>;
  markReimbursed: (id: string) => Promise<boolean>;

  // Sync helpers
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof ExpenseFilters, value: unknown) => void;
  resetFilters: () => void;
  filteredExpenses: () => Expense[];
  getTotalByStatus: (status: ExpenseStatus) => number;
  calculateMileage: (distance: number, rate?: number) => number;
}

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const mockCategories: ExpenseCategory[] = [
  { id: "ec1", name: "Travel", icon: "plane", default_limit: 5000, is_mileage: false, mileage_rate: 0, is_active: true },
  { id: "ec2", name: "Meals & Entertainment", icon: "utensils", default_limit: 500, is_mileage: false, mileage_rate: 0, is_active: true },
  { id: "ec3", name: "Office Supplies", icon: "briefcase", default_limit: 250, is_mileage: false, mileage_rate: 0, is_active: true },
  { id: "ec4", name: "Software & Subscriptions", icon: "monitor", default_limit: 1000, is_mileage: false, mileage_rate: 0, is_active: true },
  { id: "ec5", name: "Mileage", icon: "car", is_mileage: true, mileage_rate: 0.67, is_active: true },
  { id: "ec6", name: "Professional Development", icon: "graduation-cap", default_limit: 2000, is_mileage: false, mileage_rate: 0, is_active: true },
  { id: "ec7", name: "Communication", icon: "phone", default_limit: 200, is_mileage: false, mileage_rate: 0, is_active: true },
  { id: "ec8", name: "Other", icon: "receipt", default_limit: 500, is_mileage: false, mileage_rate: 0, is_active: true },
];

const mockExpenses: Expense[] = [
  { id: "ex1", org_id: DEMO_ORG_ID, user_id: "e1", user_name: "Alexandra Mitchell", category_id: "ec1", category_name: "Travel", amount: 1250.00, currency: "CAD", expense_date: "2026-02-05", description: "Flight to Vancouver for client meeting", vendor: "Air Canada", is_mileage: false, status: "approved", approved_by: "e10", approver_name: "Karen Webb", approved_at: "2026-02-07T10:00:00Z", created_at: "2026-02-05T14:00:00Z" },
  { id: "ex2", org_id: DEMO_ORG_ID, user_id: "e2", user_name: "Jordan Kimura", category_id: "ec2", category_name: "Meals & Entertainment", amount: 185.50, currency: "CAD", expense_date: "2026-02-10", description: "Team lunch - sprint review", vendor: "The Keg", is_mileage: false, status: "pending", created_at: "2026-02-10T18:00:00Z" },
  { id: "ex3", org_id: DEMO_ORG_ID, user_id: "e3", user_name: "Sam Torres", category_id: "ec4", category_name: "Software & Subscriptions", amount: 299.00, currency: "CAD", expense_date: "2026-02-01", description: "Figma annual subscription", vendor: "Figma Inc.", is_mileage: false, status: "reimbursed", approved_by: "e2", approver_name: "Jordan Kimura", approved_at: "2026-02-02T09:00:00Z", reimbursed_at: "2026-02-08T14:00:00Z", created_at: "2026-02-01T10:00:00Z" },
  { id: "ex4", org_id: DEMO_ORG_ID, user_id: "e5", user_name: "Marcus Williams", category_id: "ec5", category_name: "Mileage", amount: 67.00, currency: "CAD", expense_date: "2026-02-12", description: "Client site visit - Downtown", is_mileage: true, mileage_distance: 100, mileage_rate: 0.67, status: "pending", created_at: "2026-02-12T16:00:00Z" },
  { id: "ex5", org_id: DEMO_ORG_ID, user_id: "e4", user_name: "Priya Sharma", category_id: "ec6", category_name: "Professional Development", amount: 450.00, currency: "CAD", expense_date: "2026-01-28", description: "React Summit 2026 conference ticket", vendor: "React Summit", is_mileage: false, status: "approved", approved_by: "e2", approver_name: "Jordan Kimura", approved_at: "2026-01-30T11:00:00Z", created_at: "2026-01-28T09:00:00Z" },
  { id: "ex6", org_id: DEMO_ORG_ID, user_id: "e6", user_name: "Emily Chen", category_id: "ec3", category_name: "Office Supplies", amount: 89.99, currency: "CAD", expense_date: "2026-02-08", description: "Wireless mouse and keyboard", vendor: "Best Buy", receipt_url: "https://example.com/receipt.pdf", is_mileage: false, status: "draft", created_at: "2026-02-08T11:00:00Z" },
  { id: "ex7", org_id: DEMO_ORG_ID, user_id: "e7", user_name: "David Park", category_id: "ec7", category_name: "Communication", amount: 65.00, currency: "CAD", expense_date: "2026-02-01", description: "Mobile phone bill - work portion", vendor: "Rogers", is_mileage: false, status: "rejected", rejection_reason: "Missing itemized bill showing work-related calls", created_at: "2026-02-03T09:00:00Z" },
];

const mockReports: ExpenseReport[] = [
  { id: "er1", org_id: DEMO_ORG_ID, user_id: "e1", user_name: "Alexandra Mitchell", report_number: "EXP-2026-001", title: "February Travel Expenses", status: "submitted", total_amount: 1250.00, submitted_at: "2026-02-06T10:00:00Z", created_at: "2026-02-05T14:00:00Z" },
  { id: "er2", org_id: DEMO_ORG_ID, user_id: "e3", user_name: "Sam Torres", report_number: "EXP-2026-002", title: "Software Subscriptions Q1", status: "reimbursed", total_amount: 299.00, submitted_at: "2026-02-01T11:00:00Z", approved_by: "e2", approver_name: "Jordan Kimura", approved_at: "2026-02-02T09:00:00Z", reimbursed_at: "2026-02-08T14:00:00Z", created_at: "2026-02-01T10:00:00Z" },
];

const isSupabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const EXPENSE_STATUS_STYLES: Record<ExpenseStatus, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  draft: { label: "Draft", bgColor: "bg-[#222222]", textColor: "text-[#888888]", borderColor: "border-[#2a2a2a]" },
  pending: { label: "Pending", bgColor: "bg-amber-500/10", textColor: "text-amber-400", borderColor: "border-amber-500/20" },
  approved: { label: "Approved", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400", borderColor: "border-emerald-500/20" },
  rejected: { label: "Rejected", bgColor: "bg-red-500/10", textColor: "text-red-400", borderColor: "border-red-500/20" },
  reimbursed: { label: "Reimbursed", bgColor: "bg-blue-500/10", textColor: "text-blue-400", borderColor: "border-blue-500/20" },
};

export const CATEGORY_ICONS: Record<string, string> = {
  plane: "✈️",
  utensils: "🍽️",
  briefcase: "💼",
  monitor: "💻",
  car: "🚗",
  "graduation-cap": "🎓",
  phone: "📱",
  receipt: "🧾",
};

export const useExpensesStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  reports: [],
  searchQuery: "",
  filters: { category: "", status: "", userId: "", dateRange: null },
  loading: false,
  error: null,

  fetchExpenses: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ expenses: mockExpenses, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("expenses")
        .select("*, user:employees!user_id(name), approver:employees!approved_by(name), category:expense_categories(name), project:projects(name)")
        .eq("org_id", orgId)
        .order("expense_date", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ expenses: mockExpenses, loading: false });
        return;
      }

      const expenses: Expense[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string,
        user_id: row.user_id as string,
        user_name: (row.user as Record<string, string>)?.name,
        category_id: row.category_id as string | undefined,
        category_name: (row.category as Record<string, string>)?.name || row.category_name as string,
        amount: row.amount as number,
        currency: row.currency as string || "CAD",
        expense_date: row.expense_date as string,
        description: row.description as string | undefined,
        receipt_url: row.receipt_url as string | undefined,
        receipt_filename: row.receipt_filename as string | undefined,
        vendor: row.vendor as string | undefined,
        is_mileage: row.is_mileage as boolean || false,
        mileage_distance: row.mileage_distance as number | undefined,
        mileage_rate: row.mileage_rate as number | undefined,
        project_id: row.project_id as string | undefined,
        project_name: (row.project as Record<string, string>)?.name,
        report_id: row.report_id as string | undefined,
        status: row.status as ExpenseStatus,
        approved_by: row.approved_by as string | undefined,
        approver_name: (row.approver as Record<string, string>)?.name,
        approved_at: row.approved_at as string | undefined,
        reimbursed_at: row.reimbursed_at as string | undefined,
        rejection_reason: row.rejection_reason as string | undefined,
        created_at: row.created_at as string,
      }));

      set({ expenses, loading: false });
    } catch (err) {
      console.error("fetchExpenses error:", err);
      set({ expenses: mockExpenses, loading: false, error: String(err) });
    }
  },

  fetchCategories: async (orgId?: string) => {
    if (!isSupabaseConfigured()) {
      set({ categories: mockCategories });
      return;
    }

    try {
      const supabase = createClient();
      let query = supabase
        .from("expense_categories")
        .select("*")
        .eq("is_active", true);

      if (orgId) {
        query = query.or(`org_id.eq.${orgId},org_id.is.null`);
      } else {
        query = query.is("org_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ categories: mockCategories });
        return;
      }

      const categories: ExpenseCategory[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string | undefined,
        name: row.name as string,
        icon: row.icon as string,
        default_limit: row.default_limit as number | undefined,
        is_mileage: row.is_mileage as boolean,
        mileage_rate: row.mileage_rate as number,
        is_active: row.is_active as boolean,
      }));

      set({ categories });
    } catch (err) {
      console.error("fetchCategories error:", err);
      set({ categories: mockCategories });
    }
  },

  fetchReports: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ reports: mockReports });
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("expense_reports")
        .select("*, user:employees!user_id(name), approver:employees!approved_by(name)")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ reports: mockReports });
        return;
      }

      const reports: ExpenseReport[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string,
        user_id: row.user_id as string,
        user_name: (row.user as Record<string, string>)?.name,
        report_number: row.report_number as string,
        title: row.title as string,
        status: row.status as ExpenseReport["status"],
        total_amount: row.total_amount as number,
        submitted_at: row.submitted_at as string | undefined,
        approved_by: row.approved_by as string | undefined,
        approver_name: (row.approver as Record<string, string>)?.name,
        approved_at: row.approved_at as string | undefined,
        reimbursed_at: row.reimbursed_at as string | undefined,
        notes: row.notes as string | undefined,
        created_at: row.created_at as string,
      }));

      set({ reports });
    } catch (err) {
      console.error("fetchReports error:", err);
      set({ reports: mockReports });
    }
  },

  addExpense: async (expenseData) => {
    const id = crypto.randomUUID();
    const newExpense: Expense = {
      ...expenseData,
      id,
      status: "draft",
      created_at: new Date().toISOString(),
    };

    set((state) => ({ expenses: [newExpense, ...state.expenses] }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("expenses").insert({
          id: newExpense.id,
          org_id: newExpense.org_id,
          user_id: newExpense.user_id,
          category_id: newExpense.category_id,
          category_name: newExpense.category_name,
          amount: newExpense.amount,
          currency: newExpense.currency,
          expense_date: newExpense.expense_date,
          description: newExpense.description,
          receipt_url: newExpense.receipt_url,
          receipt_filename: newExpense.receipt_filename,
          vendor: newExpense.vendor,
          is_mileage: newExpense.is_mileage,
          mileage_distance: newExpense.mileage_distance,
          mileage_rate: newExpense.mileage_rate,
          project_id: newExpense.project_id,
          status: "draft",
        });

        if (error) {
          console.error("Error adding expense:", error);
          set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
          return null;
        }

        logAuditEvent({
          orgId: newExpense.org_id,
          action: "create",
          tableName: "expenses",
          recordId: newExpense.id,
          newValues: newExpense as unknown as Record<string, unknown>,
        });
      } catch (err) {
        console.error("addExpense error:", err);
        return null;
      }
    }

    return newExpense;
  },

  updateExpense: async (id, data) => {
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
        delete updateData.id;
        delete updateData.created_at;

        const { error } = await supabase.from("expenses").update(updateData).eq("id", id);

        if (error) {
          console.error("Error updating expense:", error);
          return false;
        }
      } catch (err) {
        console.error("updateExpense error:", err);
        return false;
      }
    }

    return true;
  },

  deleteExpense: async (id) => {
    const { expenses } = get();
    const expense = expenses.find((e) => e.id === id);

    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("expenses").delete().eq("id", id);

        if (error) {
          console.error("Error deleting expense:", error);
          if (expense) {
            set((state) => ({ expenses: [...state.expenses, expense] }));
          }
          return false;
        }

        if (expense) {
          logAuditEvent({
            orgId: expense.org_id,
            action: "delete",
            tableName: "expenses",
            recordId: id,
            oldValues: expense as unknown as Record<string, unknown>,
          });
        }
      } catch (err) {
        console.error("deleteExpense error:", err);
        return false;
      }
    }

    return true;
  },

  submitExpense: async (id: string) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, status: "pending" as ExpenseStatus } : e
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("expenses")
          .update({ status: "pending" })
          .eq("id", id);

        if (error) {
          console.error("Error submitting expense:", error);
          return false;
        }
      } catch (err) {
        console.error("submitExpense error:", err);
        return false;
      }
    }

    return true;
  },

  approveExpense: async (id: string, approverId: string) => {
    const now = new Date().toISOString();

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, status: "approved" as ExpenseStatus, approved_by: approverId, approved_at: now } : e
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("expenses")
          .update({ status: "approved", approved_by: approverId, approved_at: now })
          .eq("id", id);

        if (error) {
          console.error("Error approving expense:", error);
          return false;
        }
      } catch (err) {
        console.error("approveExpense error:", err);
        return false;
      }
    }

    return true;
  },

  rejectExpense: async (id: string, reason: string) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, status: "rejected" as ExpenseStatus, rejection_reason: reason } : e
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("expenses")
          .update({ status: "rejected", rejection_reason: reason })
          .eq("id", id);

        if (error) {
          console.error("Error rejecting expense:", error);
          return false;
        }
      } catch (err) {
        console.error("rejectExpense error:", err);
        return false;
      }
    }

    return true;
  },

  markReimbursed: async (id: string) => {
    const now = new Date().toISOString();

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, status: "reimbursed" as ExpenseStatus, reimbursed_at: now } : e
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("expenses")
          .update({ status: "reimbursed", reimbursed_at: now })
          .eq("id", id);

        if (error) {
          console.error("Error marking reimbursed:", error);
          return false;
        }
      } catch (err) {
        console.error("markReimbursed error:", err);
        return false;
      }
    }

    return true;
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () =>
    set({ filters: { category: "", status: "", userId: "", dateRange: null }, searchQuery: "" }),

  filteredExpenses: () => {
    const { expenses, searchQuery, filters } = get();
    return expenses.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filters.category || e.category_id === filters.category;
      const matchesStatus = !filters.status || e.status === filters.status;
      const matchesUser = !filters.userId || e.user_id === filters.userId;
      
      let matchesDateRange = true;
      if (filters.dateRange) {
        const expenseDate = new Date(e.expense_date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        matchesDateRange = expenseDate >= startDate && expenseDate <= endDate;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesUser && matchesDateRange;
    });
  },

  getTotalByStatus: (status: ExpenseStatus) => {
    const { expenses } = get();
    return expenses
      .filter((e) => e.status === status)
      .reduce((sum, e) => sum + e.amount, 0);
  },

  calculateMileage: (distance: number, rate = 0.67) => {
    return Math.round(distance * rate * 100) / 100;
  },
}));
