"use client";

import { useState } from "react";
import {
  Calculator,
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BookOpen,
  BarChart3,
  FileText,
  Minus,
} from "lucide-react";
import { useAccountingStore } from "@/stores/accounting-store";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Account, JournalEntry, JournalLine } from "@/types";

/* ──────────────────────────── Shared Badges ──────────────────────────── */

function AccountTypeBadge({ type }: { type: Account["type"] }) {
  const styles: Record<string, string> = {
    asset: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    liability: "bg-red-500/10 text-red-400 border-red-500/20",
    equity: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    revenue: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expense: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[type]}`}>
      {label}
    </span>
  );
}

function EntryStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    posted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    draft: "bg-[#222222] text-[#888888] border-[#2a2a2a]",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
}

/* ──────────────────────────── Tab Navigation ──────────────────────────── */

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "accounts", label: "Chart of Accounts", icon: BookOpen },
  { id: "journal", label: "Journal Entries", icon: FileText },
  { id: "reports", label: "Reports", icon: TrendingUp },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ──────────────────────────── Add Account Form ──────────────────────────── */

function AccountForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<Account, "id" | "org_id" | "created_at">) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("asset");
  const [balance, setBalance] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      name,
      type,
      balance: parseFloat(balance) || 0,
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#888888] mb-1.5">Account Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 1000"
            required
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#888888] mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Account["type"])}
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#888888] mb-1.5">Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cash"
          required
          className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#888888] mb-1.5">Opening Balance</label>
        <input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          step="0.01"
          className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          Add Account
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────── Journal Entry Form ──────────────────────────── */

function JournalEntryForm({
  accounts,
  onSubmit,
  onCancel,
}: {
  accounts: Account[];
  onSubmit: (entry: JournalEntry) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<
    { accountId: string; description: string; debit: string; credit: string }[]
  >([
    { accountId: "", description: "", debit: "", credit: "" },
    { accountId: "", description: "", debit: "", credit: "" },
  ]);

  const addLine = () =>
    setLines([...lines, { accountId: "", description: "", debit: "", credit: "" }]);

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (
    idx: number,
    field: string,
    value: string
  ) => {
    setLines(
      lines.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    const entryId = crypto.randomUUID();
    const entryLines: JournalLine[] = lines
      .filter((l) => l.accountId)
      .map((l) => ({
        id: crypto.randomUUID(),
        entry_id: entryId,
        account_id: l.accountId,
        account_name: accounts.find((a) => a.id === l.accountId)?.name ?? "",
        description: l.description,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
      }));

    const entry: JournalEntry = {
      id: entryId,
      org_id: "org1",
      entry_number: `JE-2026-${String(Date.now()).slice(-3)}`,
      date,
      description,
      status: "draft",
      lines: entryLines,
      created_at: new Date().toISOString(),
    };
    onSubmit(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#888888] mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#888888] mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Entry description"
            required
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Lines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-[#888888]">Journal Lines</label>
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1 text-xs text-[#CDB49E] hover:text-[#d4c0ad] transition-colors duration-200"
          >
            <Plus className="w-3 h-3" />
            Add Line
          </button>
        </div>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2 px-1">
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Account</span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Description</span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest text-right">Debit</span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest text-right">Credit</span>
            <span />
          </div>
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2">
              <select
                value={line.accountId}
                onChange={(e) => updateLine(idx, "accountId", e.target.value)}
                className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-xs text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={line.description}
                onChange={(e) => updateLine(idx, "description", e.target.value)}
                placeholder="Line description"
                className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-xs text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
              />
              <input
                type="number"
                value={line.debit}
                onChange={(e) => updateLine(idx, "debit", e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-xs text-[#f5f0eb] text-right placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
              />
              <input
                type="number"
                value={line.credit}
                onChange={(e) => updateLine(idx, "credit", e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-xs text-[#f5f0eb] text-right placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => removeLine(idx)}
                className="p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-30"
                disabled={lines.length <= 2}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {/* Totals */}
          <div className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2 pt-2 border-t border-[#2a2a2a]">
            <span />
            <span className="text-xs font-semibold text-[#888888] text-right pr-1">Total</span>
            <span className={`text-xs font-semibold text-right ${isBalanced ? "text-[#34d399]" : "text-[#f87171]"}`}>
              {formatCurrency(totalDebit)}
            </span>
            <span className={`text-xs font-semibold text-right ${isBalanced ? "text-[#34d399]" : "text-[#f87171]"}`}>
              {formatCurrency(totalCredit)}
            </span>
            <span />
          </div>
          {!isBalanced && totalDebit > 0 && (
            <p className="text-[11px] text-[#f87171]">Debits and credits must be equal</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isBalanced}
          className="px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Entry
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────── Tab: Overview ──────────────────────────── */

function OverviewTab() {
  const { getProfitAndLoss, getBalanceSheet, getTaxSummary } = useAccountingStore();
  const pnl = getProfitAndLoss();
  const bs = getBalanceSheet();
  const tax = getTaxSummary();

  const summaryCards = [
    { label: "Total Assets", value: bs.totalAssets, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Liabilities", value: bs.totalLiabilities, icon: TrendingDown, color: "text-[#f87171]", bg: "bg-red-500/10" },
    { label: "Total Equity", value: bs.totalEquity, icon: DollarSign, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Net Income", value: pnl.netIncome, icon: BarChart3, color: "text-[#34d399]", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#888888]">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-xl font-semibold text-[#f5f0eb]">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini P&L */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[#f5f0eb] mb-4">Profit & Loss Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888888]">Total Revenue</span>
              <span className="text-sm font-semibold text-[#34d399]">{formatCurrency(pnl.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888888]">Total Expenses</span>
              <span className="text-sm font-semibold text-[#f87171]">{formatCurrency(pnl.totalExpenses)}</span>
            </div>
            <div className="border-t border-[#2a2a2a] pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f5f0eb]">Net Income</span>
              <span className={`text-sm font-bold ${pnl.netIncome >= 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
                {formatCurrency(pnl.netIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[#f5f0eb] mb-4">Tax Summary (GST/HST)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888888]">Tax Collected</span>
              <span className="text-sm font-semibold text-[#f5f0eb]">{formatCurrency(tax.collected)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888888]">Tax Paid (ITC)</span>
              <span className="text-sm font-semibold text-[#f5f0eb]">{formatCurrency(tax.paid)}</span>
            </div>
            <div className="border-t border-[#2a2a2a] pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f5f0eb]">Net Owing</span>
              <span className={`text-sm font-bold ${tax.netOwing >= 0 ? "text-[#fbbf24]" : "text-[#34d399]"}`}>
                {formatCurrency(tax.netOwing)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Tab: Chart of Accounts ──────────────────────────── */

function ChartOfAccountsTab() {
  const {
    accounts,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addAccount,
    deleteAccount,
    filteredAccounts,
  } = useAccountingStore();
  const addToast = useToastStore((s) => s.addToast);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filteredAccounts();

  const accountTypes: Account["type"][] = ["asset", "liability", "equity", "revenue", "expense"];
  const typeLabels: Record<string, string> = {
    asset: "Assets",
    liability: "Liabilities",
    equity: "Equity",
    revenue: "Revenue",
    expense: "Expenses",
  };

  const handleAdd = (data: Omit<Account, "id" | "org_id" | "created_at">) => {
    const newAccount: Account = {
      ...data,
      id: crypto.randomUUID(),
      org_id: "org1",
      created_at: new Date().toISOString(),
    };
    addAccount(newAccount);
    setModalOpen(false);
    addToast("Account added successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteAccount(id);
    addToast("Account deleted", "info");
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#888888] hover:text-[#f5f0eb]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.accountType
              ? "border-[#CDB49E]/50 text-[#CDB49E] bg-[#3a3028]/50"
              : "border-[#2a2a2a] text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.accountType}
            onChange={(e) => setFilter("accountType", e.target.value)}
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      )}

      {/* Grouped Tables */}
      {accountTypes.map((type) => {
        const typeAccounts = filtered.filter((a) => a.type === type);
        if (typeAccounts.length === 0) return null;
        return (
          <div key={type} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-[#2a2a2a] bg-[#222222]">
              <h3 className="text-xs font-semibold text-[#f5f0eb] uppercase tracking-widest">
                {typeLabels[type]}
              </h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Code</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Name</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Type</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Balance</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest w-16"></th>
                </tr>
              </thead>
              <tbody>
                {typeAccounts.map((account, i) => {
                  const balanceColor =
                    account.type === "revenue" || account.type === "asset"
                      ? "text-[#34d399]"
                      : account.type === "expense"
                      ? "text-[#f87171]"
                      : "text-[#f5f0eb]";
                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-[#222222] transition-colors duration-150 border-b border-[#2a2a2a]/50 last:border-0 ${
                        i % 2 === 1 ? "bg-[#111111]/40" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5 text-sm font-mono text-[#CDB49E]">{account.code}</td>
                      <td className="px-6 py-3.5 text-sm font-medium text-[#f5f0eb]">{account.name}</td>
                      <td className="px-6 py-3.5">
                        <AccountTypeBadge type={account.type} />
                      </td>
                      <td className={`px-6 py-3.5 text-sm text-right font-semibold ${balanceColor}`}>
                        {formatCurrency(account.balance)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => handleDelete(e, account.id)}
                          className="p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-16 text-center">
          <Calculator className="w-8 h-8 mx-auto mb-3 text-[#888888]/40" />
          <p className="text-[#888888] text-sm">No accounts found</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Account">
        <AccountForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}

/* ──────────────────────────── Tab: Journal Entries ──────────────────────────── */

function JournalEntriesTab() {
  const {
    accounts,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addJournalEntry,
    deleteJournalEntry,
    filteredEntries,
  } = useAccountingStore();
  const addToast = useToastStore((s) => s.addToast);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filteredEntries();

  const handleCreate = (entry: JournalEntry) => {
    addJournalEntry(entry);
    setModalOpen(false);
    addToast("Journal entry created successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteJournalEntry(id);
    addToast("Journal entry deleted", "info");
  };

  const getEntryTotal = (entry: JournalEntry) =>
    entry.lines.reduce((sum, l) => sum + l.debit, 0);

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#888888] hover:text-[#f5f0eb]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.entryStatus
              ? "border-[#CDB49E]/50 text-[#CDB49E] bg-[#3a3028]/50"
              : "border-[#2a2a2a] text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.entryStatus}
            onChange={(e) => setFilter("entryStatus", e.target.value)}
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest w-8"></th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Entry #</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Date</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Description</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Amount</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-[#888888] text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-[#888888]/40" />
                  No journal entries found
                </td>
              </tr>
            ) : (
              filtered.map((entry, i) => (
                <JournalEntryRow
                  key={entry.id}
                  entry={entry}
                  index={i}
                  expanded={expandedId === entry.id}
                  onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  onDelete={handleDelete}
                  getEntryTotal={getEntryTotal}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Journal Entry" size="xl">
        <JournalEntryForm
          accounts={accounts}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function JournalEntryRow({
  entry,
  index,
  expanded,
  onToggle,
  onDelete,
  getEntryTotal,
}: {
  entry: JournalEntry;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  getEntryTotal: (entry: JournalEntry) => number;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`hover:bg-[#222222] transition-colors duration-150 cursor-pointer border-b border-[#2a2a2a]/50 ${
          index % 2 === 1 ? "bg-[#111111]/40" : ""
        } ${expanded ? "bg-[#222222]" : ""}`}
      >
        <td className="pl-6 py-4">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#888888]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#888888]" />
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3a3028] flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5 text-[#CDB49E]" />
            </div>
            <span className="text-sm font-medium text-[#f5f0eb] font-mono">{entry.entry_number}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-[#888888]">{formatDate(entry.date)}</td>
        <td className="px-6 py-4 text-sm text-[#f5f0eb]">{entry.description}</td>
        <td className="px-6 py-4 text-sm text-right font-semibold text-[#CDB49E]">
          {formatCurrency(getEntryTotal(entry))}
        </td>
        <td className="px-6 py-4 text-right">
          <EntryStatusBadge status={entry.status} />
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={(e) => onDelete(e, entry.id)}
            className="p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#222222]/50">
          <td colSpan={7} className="px-12 py-4">
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Account</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Description</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Debit</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="border-b border-[#2a2a2a]/50 last:border-0">
                      <td className="px-5 py-2.5 text-xs font-medium text-[#f5f0eb]">{line.account_name}</td>
                      <td className="px-5 py-2.5 text-xs text-[#888888]">{line.description}</td>
                      <td className="px-5 py-2.5 text-xs text-right font-mono text-[#f5f0eb]">
                        {line.debit > 0 ? formatCurrency(line.debit) : ""}
                      </td>
                      <td className="px-5 py-2.5 text-xs text-right font-mono text-[#f5f0eb]">
                        {line.credit > 0 ? formatCurrency(line.credit) : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ──────────────────────────── Tab: Reports ──────────────────────────── */

function ReportsTab() {
  const { getProfitAndLoss, getBalanceSheet, getTaxSummary, taxConfig } = useAccountingStore();
  const pnl = getProfitAndLoss();
  const bs = getBalanceSheet();
  const tax = getTaxSummary();

  return (
    <div className="space-y-6">
      {/* P&L Statement */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#f5f0eb] mb-5">Profit & Loss Statement</h3>

        <div className="space-y-4">
          {/* Revenue */}
          <div>
            <h4 className="text-xs font-semibold text-[#34d399] uppercase tracking-widest mb-2">Revenue</h4>
            <div className="space-y-2">
              {pnl.revenue.map((item) => (
                <div key={item.account.id} className="flex items-center justify-between pl-4">
                  <span className="text-sm text-[#888888]">{item.account.name}</span>
                  <span className="text-sm font-medium text-[#f5f0eb]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#2a2a2a]">
                <span className="text-sm font-semibold text-[#f5f0eb]">Total Revenue</span>
                <span className="text-sm font-bold text-[#34d399]">{formatCurrency(pnl.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h4 className="text-xs font-semibold text-[#f87171] uppercase tracking-widest mb-2">Expenses</h4>
            <div className="space-y-2">
              {pnl.expenses.map((item) => (
                <div key={item.account.id} className="flex items-center justify-between pl-4">
                  <span className="text-sm text-[#888888]">{item.account.name}</span>
                  <span className="text-sm font-medium text-[#f5f0eb]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#2a2a2a]">
                <span className="text-sm font-semibold text-[#f5f0eb]">Total Expenses</span>
                <span className="text-sm font-bold text-[#f87171]">{formatCurrency(pnl.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="border-t-2 border-[#2a2a2a] pt-4 flex items-center justify-between">
            <span className="text-base font-bold text-[#f5f0eb]">Net Income</span>
            <span className={`text-base font-bold ${pnl.netIncome >= 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
              {formatCurrency(pnl.netIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#f5f0eb] mb-5">Balance Sheet</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <div>
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Assets</h4>
            <div className="space-y-2">
              {bs.assets.map((item) => (
                <div key={item.account.id} className="flex items-center justify-between pl-4">
                  <span className="text-sm text-[#888888]">{item.account.name}</span>
                  <span className="text-sm font-medium text-[#f5f0eb]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#2a2a2a]">
                <span className="text-sm font-bold text-[#f5f0eb]">Total Assets</span>
                <span className="text-sm font-bold text-blue-400">{formatCurrency(bs.totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* Liabilities + Equity */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-[#f87171] uppercase tracking-widest mb-2">Liabilities</h4>
              <div className="space-y-2">
                {bs.liabilities.map((item) => (
                  <div key={item.account.id} className="flex items-center justify-between pl-4">
                    <span className="text-sm text-[#888888]">{item.account.name}</span>
                    <span className="text-sm font-medium text-[#f5f0eb]">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#f5f0eb]">Total Liabilities</span>
                  <span className="text-sm font-bold text-[#f87171]">{formatCurrency(bs.totalLiabilities)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Equity</h4>
              <div className="space-y-2">
                {bs.equity.map((item) => (
                  <div key={item.account.id} className="flex items-center justify-between pl-4">
                    <span className="text-sm text-[#888888]">{item.account.name}</span>
                    <span className="text-sm font-medium text-[#f5f0eb]">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#2a2a2a]">
                  <span className="text-sm font-semibold text-[#f5f0eb]">Total Equity</span>
                  <span className="text-sm font-bold text-violet-400">{formatCurrency(bs.totalEquity)}</span>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-[#2a2a2a] pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#f5f0eb]">Liabilities + Equity</span>
              <span className="text-sm font-bold text-[#CDB49E]">
                {formatCurrency(bs.totalLiabilities + bs.totalEquity)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Report */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#f5f0eb] mb-5">Tax Report (GST/HST)</h3>

        <div className="space-y-4">
          {/* Tax Rates */}
          <div className="grid grid-cols-3 gap-4">
            {taxConfig.map((t) => (
              <div key={t.id} className="bg-[#222222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                <p className="text-xs text-[#888888] mb-1">{t.name}</p>
                <p className="text-lg font-bold text-[#CDB49E]">{(t.rate * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888888]">GST/HST Collected on Sales</span>
              <span className="text-sm font-semibold text-[#f5f0eb]">{formatCurrency(tax.collected)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#888888]">Input Tax Credits (ITC) Paid</span>
              <span className="text-sm font-semibold text-[#f5f0eb]">{formatCurrency(tax.paid)}</span>
            </div>
            <div className="border-t-2 border-[#2a2a2a] pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#f5f0eb]">Net Tax Owing</span>
              <span className={`text-base font-bold ${tax.netOwing >= 0 ? "text-[#fbbf24]" : "text-[#34d399]"}`}>
                {formatCurrency(tax.netOwing)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── Main Page ──────────────────────────── */

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
          Accounting
        </h1>
        <p className="text-[#888888] text-sm mt-1">
          Manage your chart of accounts, journal entries, and financial reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#CDB49E] text-[#111111]"
                : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "accounts" && <ChartOfAccountsTab />}
      {activeTab === "journal" && <JournalEntriesTab />}
      {activeTab === "reports" && <ReportsTab />}
    </div>
  );
}
