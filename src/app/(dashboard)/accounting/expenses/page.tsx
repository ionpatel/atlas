"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  X,
  Check,
  XCircle,
  DollarSign,
  Car,
  Calculator,
  Pencil,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCcw,
  Image,
  Eye,
  RotateCcw,
  TrendingUp,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useExpensesStore, EXPENSE_STATUS_STYLES, CATEGORY_ICONS } from "@/stores/expenses-store";
import { useToastStore } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Expense, ExpenseCategory, ExpenseStatus } from "@/types";

/* ─────────── constants ─────────── */

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const MILEAGE_RATE = 0.67; // CAD per km

/* ─────────── Status Badge ─────────── */

function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const style = EXPENSE_STATUS_STYLES[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${style.bgColor} ${style.textColor} ${style.borderColor}`}>
      {style.label}
    </span>
  );
}

/* ─────────── Category Badge ─────────── */

function CategoryBadge({ name, icon }: { name: string; icon?: string }) {
  const emoji = icon ? CATEGORY_ICONS[icon] || "🧾" : "🧾";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#D8CAC0] text-[#4A5654] border border-[#C9BAB0]">
      <span>{emoji}</span>
      {name}
    </span>
  );
}

/* ─────────── Expense Form ─────────── */

function ExpenseForm({
  categories,
  expense,
  onSave,
  onClose,
}: {
  categories: ExpenseCategory[];
  expense?: Expense | null;
  onSave: (data: Omit<Expense, "id" | "created_at" | "status">) => void;
  onClose: () => void;
}) {
  const isEditing = !!expense;
  
  const [categoryId, setCategoryId] = useState(expense?.category_id || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [date, setDate] = useState(expense?.expense_date || new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(expense?.description || "");
  const [vendor, setVendor] = useState(expense?.vendor || "");
  const [isMileage, setIsMileage] = useState(expense?.is_mileage || false);
  const [mileageDistance, setMileageDistance] = useState(expense?.mileage_distance?.toString() || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    if (selectedCategory?.is_mileage) {
      setIsMileage(true);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (isMileage && mileageDistance) {
      const calculatedAmount = parseFloat(mileageDistance) * MILEAGE_RATE;
      setAmount(calculatedAmount.toFixed(2));
    }
  }, [isMileage, mileageDistance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find((c) => c.id === categoryId);
    
    onSave({
      org_id: DEMO_ORG_ID,
      user_id: "e1",
      user_name: "Alexandra Mitchell",
      category_id: categoryId || undefined,
      category_name: category?.name,
      amount: parseFloat(amount) || 0,
      currency: "CAD",
      expense_date: date,
      description,
      vendor,
      is_mileage: isMileage,
      mileage_distance: isMileage ? parseFloat(mileageDistance) : undefined,
      mileage_rate: isMileage ? MILEAGE_RATE : undefined,
      receipt_url: expense?.receipt_url,
      receipt_filename: receiptFile?.name || expense?.receipt_filename,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#F0E6E0] border border-[#C9BAB0] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#C9BAB0]">
          <h2 className="text-xl font-semibold text-[#1A2726]">
            {isEditing ? "Edit Expense" : "Add Expense"}
          </h2>
          <button onClick={onClose} className="text-[#4A5654] hover:text-[#1A2726] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {CATEGORY_ICONS[cat.icon] || "🧾"} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {isMileage ? (
            <div className="space-y-4 p-4 bg-[#D8CAC0] rounded-lg border border-[#C9BAB0]">
              <div className="flex items-center gap-2 text-[#273B3A]">
                <Car className="w-5 h-5" />
                <span className="text-sm font-medium">Mileage Calculator</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Distance (km)</label>
                <input
                  type="number"
                  value={mileageDistance}
                  onChange={(e) => setMileageDistance(e.target.value)}
                  placeholder="0"
                  step="0.1"
                  required
                  className="w-full px-4 py-2.5 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A5654]">Rate: ${MILEAGE_RATE}/km</span>
                <span className="text-[#1A2726] font-medium">Total: {formatCurrency(parseFloat(amount) || 0)}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Amount (CAD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7876]" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Vendor / Merchant</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g., Air Canada, Uber, Staples"
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              rows={2}
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Receipt</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-[#D8CAC0] border border-dashed border-[#C9BAB0] rounded-lg text-sm text-[#4A5654] hover:border-[#273B3A]/50 hover:text-[#1A2726] cursor-pointer transition-all duration-200"
              >
                <Upload className="w-5 h-5" />
                {receiptFile ? receiptFile.name : expense?.receipt_filename || "Upload receipt (image or PDF)"}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#D8CAC0] hover:bg-[#C9BAB0] text-[#1A2726] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#273B3A] to-[#1E2E2D] hover:from-[#273B3A]/90 hover:to-[#1E2E2D]/90 text-[#E6D4C7] font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {isEditing ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Expense Card ─────────── */

function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onReimburse,
  isManager,
}: {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  onSubmit: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onReimburse?: () => void;
  isManager?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl p-5 hover:border-[#273B3A]/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D8CAC0] flex items-center justify-center text-lg">
            {expense.category_name && CATEGORY_ICONS[
              expense.is_mileage ? "car" : 
              expense.category_name === "Travel" ? "plane" :
              expense.category_name === "Meals & Entertainment" ? "utensils" :
              expense.category_name === "Office Supplies" ? "briefcase" :
              expense.category_name === "Software & Subscriptions" ? "monitor" :
              expense.category_name === "Professional Development" ? "graduation-cap" :
              expense.category_name === "Communication" ? "phone" : "receipt"
            ] || "🧾"}
          </div>
          <div>
            <h4 className="font-medium text-[#1A2726] line-clamp-1">
              {expense.description || expense.category_name || "Expense"}
            </h4>
            <p className="text-xs text-[#4A5654]">
              {expense.vendor && `${expense.vendor} • `}
              {formatDate(expense.expense_date)}
            </p>
          </div>
        </div>
        <ExpenseStatusBadge status={expense.status} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-[#1A2726]">{formatCurrency(expense.amount)}</span>
          {expense.is_mileage && expense.mileage_distance && (
            <p className="text-xs text-[#4A5654] mt-1">
              <Car className="w-3 h-3 inline mr-1" />
              {expense.mileage_distance} km @ ${expense.mileage_rate}/km
            </p>
          )}
        </div>
        {expense.receipt_url && (
          <button className="flex items-center gap-1 px-2 py-1 bg-[#D8CAC0] rounded-lg text-xs text-[#4A5654] hover:text-[#1A2726] transition-colors">
            <Image className="w-3.5 h-3.5" />
            Receipt
          </button>
        )}
      </div>

      {expense.category_name && (
        <CategoryBadge name={expense.category_name} />
      )}

      {expense.rejection_reason && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400">{expense.rejection_reason}</p>
        </div>
      )}

      {/* Action Buttons based on status */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[#C9BAB0]">
        {expense.status === "draft" && (
          <>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#D8CAC0] hover:bg-[#C9BAB0] text-[#1A2726] rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#273B3A]/10 hover:bg-[#273B3A]/20 text-[#273B3A] rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Submit
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {expense.status === "pending" && isManager && (
          <>
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}

        {expense.status === "approved" && isManager && (
          <button
            onClick={onReimburse}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Mark Reimbursed
          </button>
        )}

        {expense.status === "reimbursed" && (
          <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Reimbursed {expense.reimbursed_at && `on ${formatDate(expense.reimbursed_at)}`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── Expense Row (Table View) ─────────── */

function ExpenseRow({
  expense,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onReimburse,
  isManager,
}: {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  onSubmit: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onReimburse?: () => void;
  isManager?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl hover:border-[#273B3A]/20 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-[#D8CAC0] flex items-center justify-center text-lg flex-shrink-0">
        {CATEGORY_ICONS[expense.is_mileage ? "car" : "receipt"] || "🧾"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[#1A2726] truncate">
            {expense.description || expense.category_name || "Expense"}
          </h4>
          <CategoryBadge name={expense.category_name || "Other"} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-[#4A5654]">
          {expense.vendor && <span>{expense.vendor}</span>}
          <span>{formatDate(expense.expense_date)}</span>
          <span className="text-xs">{expense.user_name}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-[#1A2726]">{formatCurrency(expense.amount)}</div>
        <ExpenseStatusBadge status={expense.status} />
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {expense.status === "draft" && (
          <>
            <button onClick={onEdit} className="p-2 hover:bg-[#D8CAC0] rounded-lg transition-colors">
              <Pencil className="w-4 h-4 text-[#4A5654]" />
            </button>
            <button onClick={onSubmit} className="p-2 hover:bg-[#273B3A]/10 rounded-lg transition-colors">
              <FileText className="w-4 h-4 text-[#273B3A]" />
            </button>
            <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </>
        )}
        {expense.status === "pending" && isManager && (
          <>
            <button onClick={onApprove} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
              <Check className="w-4 h-4 text-emerald-400" />
            </button>
            <button onClick={onReject} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
              <XCircle className="w-4 h-4 text-red-400" />
            </button>
          </>
        )}
        {expense.status === "approved" && isManager && (
          <button onClick={onReimburse} className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors">
            <RefreshCcw className="w-4 h-4 text-blue-400" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────── Mileage Calculator ─────────── */

function MileageCalculator({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: Omit<Expense, "id" | "created_at" | "status">) => void;
}) {
  const [distance, setDistance] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const amount = parseFloat(distance) * MILEAGE_RATE || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      org_id: DEMO_ORG_ID,
      user_id: "e1",
      user_name: "Alexandra Mitchell",
      category_id: "ec5",
      category_name: "Mileage",
      amount,
      currency: "CAD",
      expense_date: date,
      description,
      is_mileage: true,
      mileage_distance: parseFloat(distance),
      mileage_rate: MILEAGE_RATE,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#F0E6E0] border border-[#C9BAB0] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#C9BAB0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#273B3A]/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-[#273B3A]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A2726]">Mileage Calculator</h2>
          </div>
          <button onClick={onClose} className="text-[#4A5654] hover:text-[#1A2726] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Distance (km)</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Enter distance driven"
              step="0.1"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
            />
          </div>

          <div className="p-4 bg-[#D8CAC0] rounded-lg border border-[#C9BAB0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#4A5654]">Rate per km</span>
              <span className="text-sm text-[#1A2726]">${MILEAGE_RATE}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4A5654]">Total Reimbursement</span>
              <span className="text-xl font-bold text-[#273B3A]">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4A5654] mb-1.5">Trip Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Client visit - Downtown office"
              rows={2}
              className="w-full px-4 py-2.5 bg-[#D8CAC0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#D8CAC0] hover:bg-[#C9BAB0] text-[#1A2726] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!distance}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#273B3A] to-[#1E2E2D] hover:from-[#273B3A]/90 hover:to-[#1E2E2D]/90 text-[#E6D4C7] font-medium rounded-lg transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Mileage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */

export default function ExpensesPage() {
  const {
    expenses,
    categories,
    loading,
    fetchExpenses,
    fetchCategories,
    addExpense,
    updateExpense,
    deleteExpense,
    submitExpense,
    approveExpense,
    rejectExpense,
    markReimbursed,
    filteredExpenses,
    getTotalByStatus,
    calculateMileage,
  } = useExpensesStore();

  const toast = useToastStore();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMileageCalc, setShowMileageCalc] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchExpenses(DEMO_ORG_ID);
    fetchCategories(DEMO_ORG_ID);
  }, [fetchExpenses, fetchCategories]);

  const filtered = filteredExpenses();

  // Apply local filters
  const displayedExpenses = filtered.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
    const matchesCategory = !categoryFilter || e.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingTotal = getTotalByStatus("pending");
  const approvedTotal = getTotalByStatus("approved");
  const reimbursedTotal = getTotalByStatus("reimbursed");

  const handleAddExpense = async (data: Omit<Expense, "id" | "created_at" | "status">) => {
    const result = await addExpense(data);
    if (result) {
      toast.addToast({ type: "success", message: "Expense added!" });
    }
  };

  const handleSubmitExpense = async (id: string) => {
    const result = await submitExpense(id);
    if (result) {
      toast.addToast({ type: "success", message: "Expense submitted for approval!" });
    }
  };

  const handleApprove = async (id: string) => {
    const result = await approveExpense(id, "e1");
    if (result) {
      toast.addToast({ type: "success", message: "Expense approved!" });
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      const result = await rejectExpense(id, reason);
      if (result) {
        toast.addToast({ type: "info", message: "Expense rejected" });
      }
    }
  };

  const handleReimburse = async (id: string) => {
    const result = await markReimbursed(id);
    if (result) {
      toast.addToast({ type: "success", message: "Marked as reimbursed!" });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this expense?")) {
      const result = await deleteExpense(id);
      if (result) {
        toast.addToast({ type: "success", message: "Expense deleted" });
      }
    }
  };

  const handleExportPDF = () => {
    toast.addToast({ type: "info", message: "Exporting expenses to PDF..." });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2726]">Expense Reports</h1>
          <p className="text-[#4A5654] mt-1">Track and manage your business expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D8CAC0] hover:bg-[#C9BAB0] text-[#1A2726] rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => setShowMileageCalc(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D8CAC0] hover:bg-[#C9BAB0] text-[#1A2726] rounded-lg transition-colors"
          >
            <Car className="w-4 h-4" />
            Mileage
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#273B3A] to-[#1E2E2D] hover:from-[#273B3A]/90 hover:to-[#1E2E2D]/90 text-[#E6D4C7] font-medium rounded-lg transition-all shadow-lg shadow-[#273B3A]/20"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-[#4A5654]">Pending</span>
          </div>
          <div className="text-2xl font-bold text-[#1A2726]">{formatCurrency(pendingTotal)}</div>
        </div>

        <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-[#4A5654]">Approved</span>
          </div>
          <div className="text-2xl font-bold text-[#1A2726]">{formatCurrency(approvedTotal)}</div>
        </div>

        <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-[#4A5654]">Reimbursed</span>
          </div>
          <div className="text-2xl font-bold text-[#1A2726]">{formatCurrency(reimbursedTotal)}</div>
        </div>

        <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#273B3A]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#273B3A]" />
            </div>
            <span className="text-sm text-[#4A5654]">Total</span>
          </div>
          <div className="text-2xl font-bold text-[#1A2726]">
            {formatCurrency(pendingTotal + approvedTotal + reimbursedTotal)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7876]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder:text-[#6B7876] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="reimbursed">Reimbursed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg p-1 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" ? "bg-[#273B3A] text-[#E6D4C7]" : "text-[#4A5654] hover:text-[#1A2726]"
            )}
          >
            <Receipt className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list" ? "bg-[#273B3A] text-[#E6D4C7]" : "text-[#4A5654] hover:text-[#1A2726]"
            )}
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {displayedExpenses.length === 0 ? (
        <div className="text-center py-12 text-[#4A5654]">
          <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No expenses found</p>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="mt-4 text-[#273B3A] hover:underline"
          >
            Add your first expense
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              isManager={true}
              onEdit={() => {
                setEditingExpense(expense);
                setShowExpenseForm(true);
              }}
              onDelete={() => handleDelete(expense.id)}
              onSubmit={() => handleSubmitExpense(expense.id)}
              onApprove={() => handleApprove(expense.id)}
              onReject={() => handleReject(expense.id)}
              onReimburse={() => handleReimburse(expense.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedExpenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              isManager={true}
              onEdit={() => {
                setEditingExpense(expense);
                setShowExpenseForm(true);
              }}
              onDelete={() => handleDelete(expense.id)}
              onSubmit={() => handleSubmitExpense(expense.id)}
              onApprove={() => handleApprove(expense.id)}
              onReject={() => handleReject(expense.id)}
              onReimburse={() => handleReimburse(expense.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showExpenseForm && (
        <ExpenseForm
          categories={categories}
          expense={editingExpense}
          onSave={handleAddExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      {showMileageCalc && (
        <MileageCalculator
          onClose={() => setShowMileageCalc(false)}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
}
