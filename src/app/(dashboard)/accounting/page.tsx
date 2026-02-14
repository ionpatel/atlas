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
  Upload,
  CreditCard,
  Landmark,
  ShoppingCart,
  MonitorSmartphone,
} from "lucide-react";
import { useAccountingStore } from "@/stores/accounting-store";
import { Modal } from "@/components/ui/modal";
import { BillForm } from "@/components/modules/bill-form";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Account, JournalEntry, JournalLine, Bill } from "@/types";

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
    draft: "bg-[#DDD7C0] text-[#6B5B4F] border-[#D4CDB8]",
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
          <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Account Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 1000"
            required
            className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Account["type"])}
            className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
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
        <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cash"
          required
          className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Opening Balance</label>
        <input
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          step="0.01"
          className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-[#D4CDB8] rounded-lg text-sm text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#DDD7C0] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200"
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
          <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Entry description"
            required
            className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Lines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-[#6B5B4F]">Journal Lines</label>
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1 text-xs text-[#9C4A29] hover:text-[#B85A35] transition-colors duration-200"
          >
            <Plus className="w-3 h-3" />
            Add Line
          </button>
        </div>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2 px-1">
            <span className="text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Account</span>
            <span className="text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Description</span>
            <span className="text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest text-right">Debit</span>
            <span className="text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest text-right">Credit</span>
            <span />
          </div>
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2">
              <select
                value={line.accountId}
                onChange={(e) => updateLine(idx, "accountId", e.target.value)}
                className="px-3 py-2 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-xs text-[#2D1810] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
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
                className="px-3 py-2 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-xs text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
              />
              <input
                type="number"
                value={line.debit}
                onChange={(e) => updateLine(idx, "debit", e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="px-3 py-2 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-xs text-[#2D1810] text-right placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
              />
              <input
                type="number"
                value={line.credit}
                onChange={(e) => updateLine(idx, "credit", e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="px-3 py-2 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-xs text-[#2D1810] text-right placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => removeLine(idx)}
                className="p-2 rounded-lg text-[#6B5B4F] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-30"
                disabled={lines.length <= 2}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {/* Totals */}
          <div className="grid grid-cols-[1fr_1fr_100px_100px_32px] gap-2 pt-2 border-t border-[#D4CDB8]">
            <span />
            <span className="text-xs font-semibold text-[#6B5B4F] text-right pr-1">Total</span>
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
          className="px-5 py-2.5 border border-[#D4CDB8] rounded-lg text-sm text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#DDD7C0] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isBalanced}
          className="px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Entry
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────── Tab: Overview (Odoo-style) ──────────────────────────── */

const invoiceBarData = [
  { label: "Overdue", count: 3, amount: 4250, color: "#f87171" },
  { label: "This Week", count: 5, amount: 7800, color: "#fbbf24" },
  { label: "Next Week", count: 2, amount: 3200, color: "#60a5fa" },
  { label: "Later", count: 4, amount: 6100, color: "#a78bfa" },
  { label: "Not Due", count: 8, amount: 12400, color: "#34d399" },
];

const bankCards = [
  { name: "Search 26,000+\nbanks", abbr: "🔍", bg: "bg-[rgba(156,74,41,0.15)]", text: "text-[#9C4A29]" },
  { name: "RBC", abbr: "RBC", bg: "bg-[#003DA5]", text: "text-white" },
  { name: "TD Bank", abbr: "TD", bg: "bg-[#2E8B57]", text: "text-white" },
  { name: "BMO", abbr: "BMO", bg: "bg-[#0075BE]", text: "text-white" },
  { name: "Scotiabank", abbr: "BNS", bg: "bg-[#EC111A]", text: "text-white" },
  { name: "CIBC", abbr: "CIBC", bg: "bg-[#C41F3E]", text: "text-white" },
  { name: "Desjardins", abbr: "DES", bg: "bg-[#00874E]", text: "text-white" },
  { name: "National", abbr: "NBC", bg: "bg-[#E31937]", text: "text-white" },
  { name: "HSBC", abbr: "HSBC", bg: "bg-[#DB0011]", text: "text-white" },
];

function OverviewTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const maxAmount = Math.max(...invoiceBarData.map((d) => d.amount));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    addToast("Document uploaded. Processing...");
  };

  const handleUpload = () => {
    addToast("Document uploaded. Processing...");
  };

  const handleBillSubmit = (bill: Bill) => {
    setBillModalOpen(false);
    addToast(`Bill ${bill.bill_number} created successfully`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Top-Left: Sales ── */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-[#34d399]">Sales</h3>
            <p className="text-xs text-[#6B5B4F] mt-0.5">
              Get Paid online. Send electronic invoices.
            </p>
          </div>
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-xs font-semibold hover:bg-[#B85A35] transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Mini bar chart */}
        <div className="mt-5 space-y-3">
          {invoiceBarData.map((bar) => (
            <div key={bar.label} className="flex items-center gap-3">
              <span className="text-[11px] text-[#6B5B4F] w-20 text-right shrink-0">
                {bar.label}
              </span>
              <div className="flex-1 h-6 bg-[#DDD7C0] rounded-md overflow-hidden relative">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${Math.max((bar.amount / maxAmount) * 100, 8)}%`,
                    backgroundColor: bar.color,
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-[#2D1810] w-16 text-right shrink-0">
                {bar.count} · {formatCurrency(bar.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top-Right: Purchases ── */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-[#9C4A29]">Purchases</h3>
            <p className="text-xs text-[#6B5B4F] mt-0.5">
              Let AI scan your bill. Pay easily.
            </p>
          </div>
          <button
            onClick={handleUpload}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-xs font-semibold hover:bg-[#B85A35] transition-all duration-200"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>

        {/* Drag & drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 transition-all duration-200 ${
            dragOver
              ? "border-[#9C4A29] bg-[rgba(156,74,41,0.15)]/30"
              : "border-[#D4CDB8] bg-[#DDD7C0]/30 hover:border-[#8B7B6F]"
          }`}
        >
          <Upload
            className={`w-8 h-8 mb-2 transition-colors duration-200 ${
              dragOver ? "text-[#9C4A29]" : "text-[#8B7B6F]"
            }`}
          />
          <span className="text-sm font-medium text-[#6B5B4F]">Drag & drop</span>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-px bg-[#D4CDB8]" />
          <span className="text-[11px] text-[#8B7B6F]">or</span>
          <div className="flex-1 h-px bg-[#D4CDB8]" />
        </div>

        <button
          onClick={() => setBillModalOpen(true)}
          className="mt-3 w-full text-center text-sm text-[#9C4A29] hover:text-[#B85A35] font-medium transition-colors duration-200"
        >
          Create a bill manually
        </button>
      </div>

      {/* ── Bottom-Left: Bank ── */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#60a5fa]">Bank</h3>
          <p className="text-xs text-[#6B5B4F] mt-0.5">
            Connect your bank. Match invoices automatically.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {bankCards.map((bank, i) => (
            <button
              key={i}
              onClick={() => addToast("Bank connection coming soon", "info")}
              className="group flex flex-col items-center justify-center aspect-square rounded-xl border border-[#D4CDB8] hover:border-[#9C4A29]/40 transition-all duration-200 hover:scale-[1.03]"
              style={{ backgroundColor: i === 0 ? undefined : undefined }}
            >
              <div
                className={`w-10 h-10 rounded-lg ${bank.bg} flex items-center justify-center mb-1.5 group-hover:shadow-lg transition-shadow duration-200`}
              >
                <span className={`text-xs font-bold ${bank.text} leading-none`}>
                  {bank.abbr}
                </span>
              </div>
              <span className="text-[10px] text-[#6B5B4F] text-center leading-tight px-1 whitespace-pre-line">
                {bank.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Bottom-Right: Point of Sale ── */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#a78bfa]">Point of Sale</h3>
          <p className="text-xs text-[#6B5B4F] mt-0.5">
            Manage retail transactions
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-[#DDD7C0] border border-[#D4CDB8] flex items-center justify-center mb-4">
            <MonitorSmartphone className="w-7 h-7 text-[#8B7B6F]" />
          </div>
          <p className="text-sm font-medium text-[#6B5B4F] mb-1">Coming Soon</p>
          <p className="text-xs text-[#8B7B6F] text-center max-w-xs mb-5">
            Accept in-person payments, track cash registers, and manage retail operations from one place.
          </p>
          <button
            disabled
            className="px-5 py-2.5 bg-[#DDD7C0] text-[#8B7B6F] rounded-lg text-sm font-medium border border-[#D4CDB8] cursor-not-allowed"
          >
            Set up POS
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="New Invoice" size="xl">
        <InvoiceFormInline onClose={() => setInvoiceModalOpen(false)} />
      </Modal>

      <Modal open={billModalOpen} onClose={() => setBillModalOpen(false)} title="New Bill" size="xl">
        <BillForm onSubmit={handleBillSubmit} onCancel={() => setBillModalOpen(false)} />
      </Modal>
    </div>
  );
}

/* Simple inline invoice form for the Sales "New" button */
function InvoiceFormInline({ onClose }: { onClose: () => void }) {
  const addToast = useToastStore((s) => s.addToast);
  return (
    <div className="space-y-5">
      <p className="text-sm text-[#6B5B4F]">
        Quick invoice creation — fill in the details below.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Customer Name</label>
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Amount</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B5B4F] mb-1.5">Description</label>
        <input
          type="text"
          placeholder="Invoice description"
          className="w-full px-4 py-2.5 bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] placeholder:text-[#8B7B6F] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 border border-[#D4CDB8] rounded-lg text-sm text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#DDD7C0] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            addToast("Invoice created successfully");
            onClose();
          }}
          className="px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200"
        >
          Create Invoice
        </button>
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
        <div className="flex items-center gap-2.5 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#9C4A29]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#6B5B4F]" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#2D1810] placeholder:text-[#6B5B4F]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#6B5B4F] hover:text-[#2D1810]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.accountType
              ? "border-[#9C4A29]/50 text-[#9C4A29] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#D4CDB8] text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200"
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
            className="px-4 py-2.5 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
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
          <div key={type} className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-[#D4CDB8] bg-[#DDD7C0]">
              <h3 className="text-xs font-semibold text-[#2D1810] uppercase tracking-widest">
                {typeLabels[type]}
              </h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4CDB8]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Code</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Name</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Type</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Balance</th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest w-16"></th>
                </tr>
              </thead>
              <tbody>
                {typeAccounts.map((account, i) => {
                  const balanceColor =
                    account.type === "revenue" || account.type === "asset"
                      ? "text-[#34d399]"
                      : account.type === "expense"
                      ? "text-[#f87171]"
                      : "text-[#2D1810]";
                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-[#DDD7C0] transition-colors duration-150 border-b border-[#D4CDB8]/50 last:border-0 ${
                        i % 2 === 1 ? "bg-[#E8E3CC]/40" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5 text-sm font-mono text-[#9C4A29]">{account.code}</td>
                      <td className="px-6 py-3.5 text-sm font-medium text-[#2D1810]">{account.name}</td>
                      <td className="px-6 py-3.5">
                        <AccountTypeBadge type={account.type} />
                      </td>
                      <td className={`px-6 py-3.5 text-sm text-right font-semibold ${balanceColor}`}>
                        {formatCurrency(account.balance)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => handleDelete(e, account.id)}
                          className="p-2 rounded-lg text-[#6B5B4F] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
        <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl px-6 py-16 text-center">
          <Calculator className="w-8 h-8 mx-auto mb-3 text-[#6B5B4F]/40" />
          <p className="text-[#6B5B4F] text-sm">No accounts found</p>
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
        <div className="flex items-center gap-2.5 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#9C4A29]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#6B5B4F]" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#2D1810] placeholder:text-[#6B5B4F]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#6B5B4F] hover:text-[#2D1810]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.entryStatus
              ? "border-[#9C4A29]/50 text-[#9C4A29] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#D4CDB8] text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#B85A35] transition-all duration-200"
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
            className="px-4 py-2.5 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:ring-2 focus:ring-[#9C4A29]/30 focus:border-[#9C4A29]/50 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#D4CDB8]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest w-8"></th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Entry #</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Date</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Description</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Amount</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-[#6B5B4F] text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-[#6B5B4F]/40" />
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
        className={`hover:bg-[#DDD7C0] transition-colors duration-150 cursor-pointer border-b border-[#D4CDB8]/50 ${
          index % 2 === 1 ? "bg-[#E8E3CC]/40" : ""
        } ${expanded ? "bg-[#DDD7C0]" : ""}`}
      >
        <td className="pl-6 py-4">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#6B5B4F]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#6B5B4F]" />
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5 text-[#9C4A29]" />
            </div>
            <span className="text-sm font-medium text-[#2D1810] font-mono">{entry.entry_number}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-[#6B5B4F]">{formatDate(entry.date)}</td>
        <td className="px-6 py-4 text-sm text-[#2D1810]">{entry.description}</td>
        <td className="px-6 py-4 text-sm text-right font-semibold text-[#9C4A29]">
          {formatCurrency(getEntryTotal(entry))}
        </td>
        <td className="px-6 py-4 text-right">
          <EntryStatusBadge status={entry.status} />
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={(e) => onDelete(e, entry.id)}
            className="p-2 rounded-lg text-[#6B5B4F] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#DDD7C0]/50">
          <td colSpan={7} className="px-12 py-4">
            <div className="bg-[#E8E3CC] border border-[#D4CDB8] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4CDB8]">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Account</th>
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Description</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Debit</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-[#6B5B4F] uppercase tracking-widest">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="border-b border-[#D4CDB8]/50 last:border-0">
                      <td className="px-5 py-2.5 text-xs font-medium text-[#2D1810]">{line.account_name}</td>
                      <td className="px-5 py-2.5 text-xs text-[#6B5B4F]">{line.description}</td>
                      <td className="px-5 py-2.5 text-xs text-right font-mono text-[#2D1810]">
                        {line.debit > 0 ? formatCurrency(line.debit) : ""}
                      </td>
                      <td className="px-5 py-2.5 text-xs text-right font-mono text-[#2D1810]">
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
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#2D1810] mb-5">Profit & Loss Statement</h3>

        <div className="space-y-4">
          {/* Revenue */}
          <div>
            <h4 className="text-xs font-semibold text-[#34d399] uppercase tracking-widest mb-2">Revenue</h4>
            <div className="space-y-2">
              {pnl.revenue.map((item) => (
                <div key={item.account.id} className="flex items-center justify-between pl-4">
                  <span className="text-sm text-[#6B5B4F]">{item.account.name}</span>
                  <span className="text-sm font-medium text-[#2D1810]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#D4CDB8]">
                <span className="text-sm font-semibold text-[#2D1810]">Total Revenue</span>
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
                  <span className="text-sm text-[#6B5B4F]">{item.account.name}</span>
                  <span className="text-sm font-medium text-[#2D1810]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#D4CDB8]">
                <span className="text-sm font-semibold text-[#2D1810]">Total Expenses</span>
                <span className="text-sm font-bold text-[#f87171]">{formatCurrency(pnl.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="border-t-2 border-[#D4CDB8] pt-4 flex items-center justify-between">
            <span className="text-base font-bold text-[#2D1810]">Net Income</span>
            <span className={`text-base font-bold ${pnl.netIncome >= 0 ? "text-[#34d399]" : "text-[#f87171]"}`}>
              {formatCurrency(pnl.netIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#2D1810] mb-5">Balance Sheet</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <div>
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Assets</h4>
            <div className="space-y-2">
              {bs.assets.map((item) => (
                <div key={item.account.id} className="flex items-center justify-between pl-4">
                  <span className="text-sm text-[#6B5B4F]">{item.account.name}</span>
                  <span className="text-sm font-medium text-[#2D1810]">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#D4CDB8]">
                <span className="text-sm font-bold text-[#2D1810]">Total Assets</span>
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
                    <span className="text-sm text-[#6B5B4F]">{item.account.name}</span>
                    <span className="text-sm font-medium text-[#2D1810]">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#D4CDB8]">
                  <span className="text-sm font-semibold text-[#2D1810]">Total Liabilities</span>
                  <span className="text-sm font-bold text-[#f87171]">{formatCurrency(bs.totalLiabilities)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Equity</h4>
              <div className="space-y-2">
                {bs.equity.map((item) => (
                  <div key={item.account.id} className="flex items-center justify-between pl-4">
                    <span className="text-sm text-[#6B5B4F]">{item.account.name}</span>
                    <span className="text-sm font-medium text-[#2D1810]">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pl-4 pt-1 border-t border-[#D4CDB8]">
                  <span className="text-sm font-semibold text-[#2D1810]">Total Equity</span>
                  <span className="text-sm font-bold text-violet-400">{formatCurrency(bs.totalEquity)}</span>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-[#D4CDB8] pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#2D1810]">Liabilities + Equity</span>
              <span className="text-sm font-bold text-[#9C4A29]">
                {formatCurrency(bs.totalLiabilities + bs.totalEquity)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Report */}
      <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-6">
        <h3 className="text-base font-semibold text-[#2D1810] mb-5">Tax Report (GST/HST)</h3>

        <div className="space-y-4">
          {/* Tax Rates */}
          <div className="grid grid-cols-3 gap-4">
            {taxConfig.map((t) => (
              <div key={t.id} className="bg-[#DDD7C0] border border-[#D4CDB8] rounded-lg p-4 text-center">
                <p className="text-xs text-[#6B5B4F] mb-1">{t.name}</p>
                <p className="text-lg font-bold text-[#9C4A29]">{(t.rate * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B5B4F]">GST/HST Collected on Sales</span>
              <span className="text-sm font-semibold text-[#2D1810]">{formatCurrency(tax.collected)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B5B4F]">Input Tax Credits (ITC) Paid</span>
              <span className="text-sm font-semibold text-[#2D1810]">{formatCurrency(tax.paid)}</span>
            </div>
            <div className="border-t-2 border-[#D4CDB8] pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[#2D1810]">Net Tax Owing</span>
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
        <h1 className="text-2xl font-semibold tracking-tight text-[#2D1810]">
          Accounting
        </h1>
        <p className="text-[#6B5B4F] text-sm mt-1">
          Manage your chart of accounts, journal entries, and financial reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#9C4A29] text-[#E8E3CC]"
                : "text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#DDD7C0]"
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
