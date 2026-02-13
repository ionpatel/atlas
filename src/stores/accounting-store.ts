import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Account, JournalEntry, JournalLine, TaxConfig } from "@/types";

interface AccountingFilters {
  accountType: string;
  entryStatus: string;
}

interface AccountingState {
  accounts: Account[];
  journalEntries: JournalEntry[];
  taxConfig: TaxConfig[];
  searchQuery: string;
  filters: AccountingFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof AccountingFilters, value: string) => void;
  resetFilters: () => void;

  // Async CRUD
  fetchAccounts: (orgId: string) => Promise<void>;
  fetchJournalEntries: (orgId: string) => Promise<void>;
  addAccount: (account: Omit<Account, "id" | "created_at"> | Account) => Promise<Account | null>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  addJournalEntry: (entry: JournalEntry) => Promise<JournalEntry | null>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<boolean>;
  deleteJournalEntry: (id: string) => Promise<boolean>;

  // Computed
  filteredAccounts: () => Account[];
  filteredEntries: () => JournalEntry[];
  getAccountsByType: (type: Account["type"]) => Account[];
  getTrialBalance: () => { account: Account; debit: number; credit: number }[];
  getProfitAndLoss: () => {
    revenue: { account: Account; amount: number }[];
    expenses: { account: Account; amount: number }[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
  getBalanceSheet: () => {
    assets: { account: Account; amount: number }[];
    liabilities: { account: Account; amount: number }[];
    equity: { account: Account; amount: number }[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
  };
  getTaxSummary: () => {
    collected: number;
    paid: number;
    netOwing: number;
  };
}

const defaultFilters: AccountingFilters = { accountType: "", entryStatus: "" };

const mockAccounts: Account[] = [
  { id: "acc-1000", org_id: "org1", code: "1000", name: "Cash", type: "asset", balance: 45250.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-1100", org_id: "org1", code: "1100", name: "Accounts Receivable", type: "asset", balance: 12800.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-1200", org_id: "org1", code: "1200", name: "Inventory", type: "asset", balance: 8400.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-2000", org_id: "org1", code: "2000", name: "Accounts Payable", type: "liability", balance: 6200.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-2100", org_id: "org1", code: "2100", name: "GST/HST Payable", type: "liability", balance: 3150.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-2200", org_id: "org1", code: "2200", name: "Income Tax Payable", type: "liability", balance: 4500.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-3000", org_id: "org1", code: "3000", name: "Owner's Equity", type: "equity", balance: 30000.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-3100", org_id: "org1", code: "3100", name: "Retained Earnings", type: "equity", balance: 8750.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-4000", org_id: "org1", code: "4000", name: "Sales Revenue", type: "revenue", balance: 42000.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-4100", org_id: "org1", code: "4100", name: "Service Revenue", type: "revenue", balance: 15500.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5000", org_id: "org1", code: "5000", name: "Cost of Goods Sold", type: "expense", balance: 18200.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5100", org_id: "org1", code: "5100", name: "Salaries", type: "expense", balance: 12000.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5200", org_id: "org1", code: "5200", name: "Rent", type: "expense", balance: 4500.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5300", org_id: "org1", code: "5300", name: "Utilities", type: "expense", balance: 1350.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5400", org_id: "org1", code: "5400", name: "Office Supplies", type: "expense", balance: 800.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: "je-1", org_id: "org1", entry_number: "JE-2026-001", date: "2026-01-05",
    description: "Record monthly sales revenue", status: "posted",
    lines: [
      { id: "jl-1a", entry_id: "je-1", account_id: "acc-1100", account_name: "Accounts Receivable", description: "Sales on account", debit: 8500.00, credit: 0 },
      { id: "jl-1b", entry_id: "je-1", account_id: "acc-4000", account_name: "Sales Revenue", description: "Sales on account", debit: 0, credit: 7522.12 },
      { id: "jl-1c", entry_id: "je-1", account_id: "acc-2100", account_name: "GST/HST Payable", description: "HST on sales", debit: 0, credit: 977.88 },
    ],
    created_at: "2026-01-05T09:00:00Z",
  },
  {
    id: "je-2", org_id: "org1", entry_number: "JE-2026-002", date: "2026-01-10",
    description: "Pay monthly rent", status: "posted",
    lines: [
      { id: "jl-2a", entry_id: "je-2", account_id: "acc-5200", account_name: "Rent", description: "January rent", debit: 4500.00, credit: 0 },
      { id: "jl-2b", entry_id: "je-2", account_id: "acc-1000", account_name: "Cash", description: "January rent", debit: 0, credit: 4500.00 },
    ],
    created_at: "2026-01-10T09:00:00Z",
  },
];

const mockTaxConfig: TaxConfig[] = [
  { id: "tax-1", org_id: "org1", name: "GST", rate: 0.05, is_active: true },
  { id: "tax-2", org_id: "org1", name: "HST", rate: 0.13, is_active: true },
  { id: "tax-3", org_id: "org1", name: "PST", rate: 0.07, is_active: true },
];

const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const useAccountingStore = create<AccountingState>((set, get) => ({
  accounts: mockAccounts, // Start with mock for integrations to work
  journalEntries: mockJournalEntries,
  taxConfig: mockTaxConfig,
  searchQuery: "",
  filters: { ...defaultFilters },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...defaultFilters }, searchQuery: "" }),

  fetchAccounts: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ accounts: mockAccounts, loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("org_id", orgId)
        .order("code", { ascending: true });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ accounts: data || [], loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch accounts";
      set({ error: message, loading: false });
    }
  },

  fetchJournalEntries: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ journalEntries: mockJournalEntries, loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("org_id", orgId)
        .order("date", { ascending: false });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      // Fetch lines for each entry
      const entriesWithLines: JournalEntry[] = [];
      for (const entry of data || []) {
        const { data: lines } = await supabase
          .from("journal_lines")
          .select("*")
          .eq("entry_id", entry.id);
        entriesWithLines.push({ ...entry, lines: lines || [] });
      }

      set({ journalEntries: entriesWithLines, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch journal entries";
      set({ error: message, loading: false });
    }
  },

  addAccount: async (account) => {
    // Handle both formats (with or without id)
    const hasId = "id" in account && account.id;
    
    if (!isSupabaseConfigured()) {
      const newAccount: Account = hasId
        ? (account as Account)
        : {
            ...account,
            id: `acc-${Date.now()}`,
            created_at: new Date().toISOString(),
          } as Account;
      set((state) => ({ accounts: [newAccount, ...state.accounts] }));
      return newAccount;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const insertData = hasId
        ? account
        : { ...account, created_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from("accounts")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        set({ error: error.message, loading: false });
        return null;
      }

      set((state) => ({
        accounts: [data, ...state.accounts],
        loading: false,
      }));

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add account";
      set({ error: message, loading: false });
      return null;
    }
  },

  updateAccount: async (id, data) => {
    // Always update local state first for integrations
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    }));

    if (!isSupabaseConfigured()) {
      return true;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("accounts")
        .update(data)
        .eq("id", id);

      if (error) {
        console.error("Error updating account:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error updating account:", err);
      return false;
    }
  },

  deleteAccount: async (id) => {
    if (!isSupabaseConfigured()) {
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      }));
      return true;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id);

      if (error) {
        set({ error: error.message });
        return false;
      }

      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete account";
      set({ error: message });
      return false;
    }
  },

  addJournalEntry: async (entry) => {
    // Always add to local state first for integrations
    set((state) => ({ journalEntries: [entry, ...state.journalEntries] }));

    if (!isSupabaseConfigured()) {
      return entry;
    }

    try {
      const supabase = createClient();
      const { lines, ...entryData } = entry;

      const { data, error } = await supabase
        .from("journal_entries")
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error("Error adding journal entry:", error);
        return entry; // Return original for local state
      }

      // Insert lines
      if (lines && lines.length > 0) {
        const linesWithEntryId = lines.map((line) => ({
          ...line,
          entry_id: data.id,
        }));

        await supabase.from("journal_lines").insert(linesWithEntryId);
      }

      return { ...data, lines };
    } catch (err) {
      console.error("Error adding journal entry:", err);
      return entry;
    }
  },

  updateJournalEntry: async (id, data) => {
    set((state) => ({
      journalEntries: state.journalEntries.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));

    if (!isSupabaseConfigured()) {
      return true;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("journal_entries")
        .update(data)
        .eq("id", id);

      return !error;
    } catch (err) {
      console.error("Error updating journal entry:", err);
      return false;
    }
  },

  deleteJournalEntry: async (id) => {
    if (!isSupabaseConfigured()) {
      set((state) => ({
        journalEntries: state.journalEntries.filter((e) => e.id !== id),
      }));
      return true;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) {
        return false;
      }

      set((state) => ({
        journalEntries: state.journalEntries.filter((e) => e.id !== id),
      }));

      return true;
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      return false;
    }
  },

  filteredAccounts: () => {
    const { accounts, searchQuery, filters } = get();
    return accounts.filter((a) => {
      const matchesSearch =
        !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.includes(searchQuery);

      const matchesType =
        !filters.accountType || a.type === filters.accountType;

      return matchesSearch && matchesType;
    });
  },

  filteredEntries: () => {
    const { journalEntries, searchQuery, filters } = get();
    return journalEntries.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.entry_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !filters.entryStatus || e.status === filters.entryStatus;

      return matchesSearch && matchesStatus;
    });
  },

  getAccountsByType: (type) => {
    return get().accounts.filter((a) => a.type === type && a.is_active);
  },

  getTrialBalance: () => {
    const { accounts } = get();
    return accounts
      .filter((a) => a.is_active)
      .map((account) => {
        const isDebitNormal = account.type === "asset" || account.type === "expense";
        return {
          account,
          debit: isDebitNormal ? account.balance : 0,
          credit: !isDebitNormal ? account.balance : 0,
        };
      });
  },

  getProfitAndLoss: () => {
    const { accounts } = get();
    const revenueAccounts = accounts.filter((a) => a.type === "revenue" && a.is_active);
    const expenseAccounts = accounts.filter((a) => a.type === "expense" && a.is_active);

    const revenue = revenueAccounts.map((a) => ({ account: a, amount: a.balance }));
    const expenses = expenseAccounts.map((a) => ({ account: a, amount: a.balance }));

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    };
  },

  getBalanceSheet: () => {
    const { accounts } = get();
    const assetAccounts = accounts.filter((a) => a.type === "asset" && a.is_active);
    const liabilityAccounts = accounts.filter((a) => a.type === "liability" && a.is_active);
    const equityAccounts = accounts.filter((a) => a.type === "equity" && a.is_active);

    const assets = assetAccounts.map((a) => ({ account: a, amount: a.balance }));
    const liabilities = liabilityAccounts.map((a) => ({ account: a, amount: a.balance }));
    const equity = equityAccounts.map((a) => ({ account: a, amount: a.balance }));

    return {
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((sum, a) => sum + a.amount, 0),
      totalLiabilities: liabilities.reduce((sum, l) => sum + l.amount, 0),
      totalEquity: equity.reduce((sum, e) => sum + e.amount, 0),
    };
  },

  getTaxSummary: () => {
    const { accounts } = get();
    const gstPayable = accounts.find((a) => a.code === "2100");
    const collected = gstPayable?.balance ?? 0;
    const paid = 850.00;
    return {
      collected,
      paid,
      netOwing: collected - paid,
    };
  },
}));
