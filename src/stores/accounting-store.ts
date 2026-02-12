import { create } from "zustand";
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
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

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
  // Assets
  { id: "acc-1000", org_id: "org1", code: "1000", name: "Cash", type: "asset", balance: 45250.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-1100", org_id: "org1", code: "1100", name: "Accounts Receivable", type: "asset", balance: 12800.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-1200", org_id: "org1", code: "1200", name: "Inventory", type: "asset", balance: 8400.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  // Liabilities
  { id: "acc-2000", org_id: "org1", code: "2000", name: "Accounts Payable", type: "liability", balance: 6200.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-2100", org_id: "org1", code: "2100", name: "GST/HST Payable", type: "liability", balance: 3150.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-2200", org_id: "org1", code: "2200", name: "Income Tax Payable", type: "liability", balance: 4500.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  // Equity
  { id: "acc-3000", org_id: "org1", code: "3000", name: "Owner's Equity", type: "equity", balance: 30000.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-3100", org_id: "org1", code: "3100", name: "Retained Earnings", type: "equity", balance: 8750.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  // Revenue
  { id: "acc-4000", org_id: "org1", code: "4000", name: "Sales Revenue", type: "revenue", balance: 42000.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-4100", org_id: "org1", code: "4100", name: "Service Revenue", type: "revenue", balance: 15500.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  // Expenses
  { id: "acc-5000", org_id: "org1", code: "5000", name: "Cost of Goods Sold", type: "expense", balance: 18200.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5100", org_id: "org1", code: "5100", name: "Salaries", type: "expense", balance: 12000.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5200", org_id: "org1", code: "5200", name: "Rent", type: "expense", balance: 4500.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5300", org_id: "org1", code: "5300", name: "Utilities", type: "expense", balance: 1350.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "acc-5400", org_id: "org1", code: "5400", name: "Office Supplies", type: "expense", balance: 800.00, is_active: true, created_at: "2026-01-01T00:00:00Z" },
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: "je-1", org_id: "org1", entry_number: "JE-2026-001", date: "2026-01-05",
    description: "Record monthly sales revenue",
    status: "posted",
    lines: [
      { id: "jl-1a", entry_id: "je-1", account_id: "acc-1100", account_name: "Accounts Receivable", description: "Sales on account", debit: 8500.00, credit: 0 },
      { id: "jl-1b", entry_id: "je-1", account_id: "acc-4000", account_name: "Sales Revenue", description: "Sales on account", debit: 0, credit: 7522.12 },
      { id: "jl-1c", entry_id: "je-1", account_id: "acc-2100", account_name: "GST/HST Payable", description: "HST on sales", debit: 0, credit: 977.88 },
    ],
    created_at: "2026-01-05T09:00:00Z",
  },
  {
    id: "je-2", org_id: "org1", entry_number: "JE-2026-002", date: "2026-01-10",
    description: "Pay monthly rent",
    status: "posted",
    lines: [
      { id: "jl-2a", entry_id: "je-2", account_id: "acc-5200", account_name: "Rent", description: "January rent", debit: 4500.00, credit: 0 },
      { id: "jl-2b", entry_id: "je-2", account_id: "acc-1000", account_name: "Cash", description: "January rent", debit: 0, credit: 4500.00 },
    ],
    created_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "je-3", org_id: "org1", entry_number: "JE-2026-003", date: "2026-01-15",
    description: "Purchase inventory from supplier",
    status: "posted",
    lines: [
      { id: "jl-3a", entry_id: "je-3", account_id: "acc-1200", account_name: "Inventory", description: "Inventory purchase", debit: 3200.00, credit: 0 },
      { id: "jl-3b", entry_id: "je-3", account_id: "acc-2000", account_name: "Accounts Payable", description: "Inventory purchase", debit: 0, credit: 3200.00 },
    ],
    created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: "je-4", org_id: "org1", entry_number: "JE-2026-004", date: "2026-01-20",
    description: "Record salary payments",
    status: "posted",
    lines: [
      { id: "jl-4a", entry_id: "je-4", account_id: "acc-5100", account_name: "Salaries", description: "January salaries", debit: 12000.00, credit: 0 },
      { id: "jl-4b", entry_id: "je-4", account_id: "acc-1000", account_name: "Cash", description: "January salaries", debit: 0, credit: 12000.00 },
    ],
    created_at: "2026-01-20T09:00:00Z",
  },
  {
    id: "je-5", org_id: "org1", entry_number: "JE-2026-005", date: "2026-01-25",
    description: "Record service revenue collection",
    status: "posted",
    lines: [
      { id: "jl-5a", entry_id: "je-5", account_id: "acc-1000", account_name: "Cash", description: "Service payment received", debit: 5650.00, credit: 0 },
      { id: "jl-5b", entry_id: "je-5", account_id: "acc-4100", account_name: "Service Revenue", description: "Service payment received", debit: 0, credit: 5000.00 },
      { id: "jl-5c", entry_id: "je-5", account_id: "acc-2100", account_name: "GST/HST Payable", description: "GST on service", debit: 0, credit: 650.00 },
    ],
    created_at: "2026-01-25T09:00:00Z",
  },
  {
    id: "je-6", org_id: "org1", entry_number: "JE-2026-006", date: "2026-02-01",
    description: "Utility bill accrual",
    status: "draft",
    lines: [
      { id: "jl-6a", entry_id: "je-6", account_id: "acc-5300", account_name: "Utilities", description: "February utilities", debit: 1350.00, credit: 0 },
      { id: "jl-6b", entry_id: "je-6", account_id: "acc-2000", account_name: "Accounts Payable", description: "February utilities", debit: 0, credit: 1350.00 },
    ],
    created_at: "2026-02-01T09:00:00Z",
  },
];

const mockTaxConfig: TaxConfig[] = [
  { id: "tax-1", org_id: "org1", name: "GST", rate: 0.05, is_active: true },
  { id: "tax-2", org_id: "org1", name: "HST", rate: 0.13, is_active: true },
  { id: "tax-3", org_id: "org1", name: "PST", rate: 0.07, is_active: true },
];

export const useAccountingStore = create<AccountingState>((set, get) => ({
  accounts: mockAccounts,
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

  addAccount: (account) =>
    set((state) => ({ accounts: [account, ...state.accounts] })),

  updateAccount: (id, data) =>
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),

  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    })),

  addJournalEntry: (entry) =>
    set((state) => ({ journalEntries: [entry, ...state.journalEntries] })),

  updateJournalEntry: (id, data) =>
    set((state) => ({
      journalEntries: state.journalEntries.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    })),

  deleteJournalEntry: (id) =>
    set((state) => ({
      journalEntries: state.journalEntries.filter((e) => e.id !== id),
    })),

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
    // Approximate tax paid on expenses (simplified)
    const paid = 850.00;
    return {
      collected,
      paid,
      netOwing: collected - paid,
    };
  },
}));
