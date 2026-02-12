"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, FileText, StickyNote, LayoutList } from "lucide-react";
import { useAccountingStore } from "@/stores/accounting-store";
import { useContactsStore } from "@/stores/contacts-store";
import { formatCurrency } from "@/lib/utils";
import type { Bill, BillLine } from "@/types";

interface BillFormProps {
  onSubmit: (bill: Bill) => void;
  onCancel: () => void;
}

type BillTab = "lines" | "journal" | "other";

interface FormLine {
  key: string;
  label: string;
  account_id: string;
  quantity: number;
  price: number;
  tax_rate: number;
  type: "line" | "section" | "note";
}

const inputClass =
  "w-full px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200";

const labelClass = "block text-xs font-medium text-[#888888] mb-1.5";

export function BillForm({ onSubmit, onCancel }: BillFormProps) {
  const accounts = useAccountingStore((s) => s.accounts);
  const contacts = useContactsStore((s) => s.contacts);
  const vendors = useMemo(
    () => contacts.filter((c) => c.type === "vendor" || c.type === "both"),
    [contacts]
  );

  const [billType, setBillType] = useState<"bill" | "receipt">("bill");
  const [vendorId, setVendorId] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [billReference, setBillReference] = useState("");
  const [billDate, setBillDate] = useState("");
  const [accountingDate, setAccountingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<BillTab>("lines");
  const [status] = useState<"draft" | "posted">("draft");

  const [lines, setLines] = useState<FormLine[]>([
    {
      key: crypto.randomUUID(),
      label: "",
      account_id: "",
      quantity: 1,
      price: 0,
      tax_rate: 13,
      type: "line",
    },
  ]);

  const billNumber = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `BILL/${year}/${month}/${seq}`;
  }, []);

  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors;
    const q = vendorSearch.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.company && v.company.toLowerCase().includes(q))
    );
  }, [vendors, vendorSearch]);

  const addLine = () =>
    setLines([
      ...lines,
      {
        key: crypto.randomUUID(),
        label: "",
        account_id: "",
        quantity: 1,
        price: 0,
        tax_rate: 13,
        type: "line",
      },
    ]);

  const addSection = () =>
    setLines([
      ...lines,
      {
        key: crypto.randomUUID(),
        label: "",
        account_id: "",
        quantity: 0,
        price: 0,
        tax_rate: 0,
        type: "section",
      },
    ]);

  const addNote = () =>
    setLines([
      ...lines,
      {
        key: crypto.randomUUID(),
        label: "",
        account_id: "",
        quantity: 0,
        price: 0,
        tax_rate: 0,
        type: "note",
      },
    ]);

  const removeLine = (key: string) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((l) => l.key !== key));
  };

  const updateLine = (
    key: string,
    field: keyof FormLine,
    value: string | number
  ) => {
    setLines(lines.map((l) => (l.key === key ? { ...l, [field]: value } : l)));
  };

  const dataLines = lines.filter((l) => l.type === "line");
  const subtotal = dataLines.reduce((s, l) => s + l.quantity * l.price, 0);
  const taxTotal = dataLines.reduce(
    (s, l) => s + l.quantity * l.price * (l.tax_rate / 100),
    0
  );
  const total = subtotal + taxTotal;

  // Journal items auto-generated from lines
  const journalItems = useMemo(() => {
    const items: { account: string; label: string; debit: number; credit: number }[] = [];
    dataLines.forEach((l) => {
      const accName =
        accounts.find((a) => a.id === l.account_id)?.name || "Expense Account";
      const amount = l.quantity * l.price;
      if (amount > 0) {
        items.push({ account: accName, label: l.label || "Bill line", debit: amount, credit: 0 });
      }
    });
    if (taxTotal > 0) {
      items.push({
        account: "Tax Receivable",
        label: "HST/GST",
        debit: taxTotal,
        credit: 0,
      });
    }
    if (total > 0) {
      const vendorName =
        contacts.find((c) => c.id === vendorId)?.name || "Accounts Payable";
      items.push({
        account: vendorName,
        label: "Payable",
        debit: 0,
        credit: total,
      });
    }
    return items;
  }, [dataLines, taxTotal, total, accounts, contacts, vendorId]);

  const handleConfirm = () => {
    const billLines: BillLine[] = dataLines.map((l) => ({
      id: crypto.randomUUID(),
      bill_id: "",
      label: l.label,
      account_id: l.account_id,
      quantity: l.quantity,
      price: l.price,
      tax_rate: l.tax_rate,
      amount: l.quantity * l.price,
    }));

    const bill: Bill = {
      id: crypto.randomUUID(),
      org_id: "org1",
      type: billType,
      bill_number: billNumber,
      vendor_id: vendorId,
      vendor_name: contacts.find((c) => c.id === vendorId)?.name,
      bill_reference: billReference || undefined,
      bill_date: billDate,
      accounting_date: accountingDate,
      due_date: dueDate,
      payment_reference: paymentReference || undefined,
      status: "draft",
      lines: billLines,
      subtotal,
      tax: taxTotal,
      total,
      created_at: new Date().toISOString(),
    };

    onSubmit(bill);
  };

  const selectVendor = (id: string, name: string) => {
    setVendorId(id);
    setVendorSearch(name);
    setShowVendorDropdown(false);
  };

  const billTabs: { id: BillTab; label: string }[] = [
    { id: "lines", label: "Invoice Lines" },
    { id: "journal", label: "Journal Items" },
    { id: "other", label: "Other Info" },
  ];

  const expenseAccounts = accounts.filter(
    (a) => a.type === "expense" || a.type === "asset"
  );

  return (
    <div className="space-y-5">
      {/* Top bar: Type toggle + Bill number + Status stepper */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Type Toggle */}
          <div className="flex items-center bg-[#222222] border border-[#2a2a2a] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setBillType("bill")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                billType === "bill"
                  ? "bg-[#CDB49E] text-[#111111]"
                  : "text-[#888888] hover:text-[#f5f0eb]"
              }`}
            >
              Bill
            </button>
            <button
              type="button"
              onClick={() => setBillType("receipt")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                billType === "receipt"
                  ? "bg-[#CDB49E] text-[#111111]"
                  : "text-[#888888] hover:text-[#f5f0eb]"
              }`}
            >
              Receipt
            </button>
          </div>
          <span className="text-sm font-mono text-[#CDB49E]">{billNumber}</span>
        </div>

        {/* Status stepper */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              status === "draft"
                ? "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/30"
                : "bg-[#222222] text-[#555555] border-[#2a2a2a]"
            }`}
          >
            Draft
          </span>
          <div className="w-6 h-px bg-[#2a2a2a]" />
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              status === "posted"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-[#222222] text-[#555555] border-[#2a2a2a]"
            }`}
          >
            Posted
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          className="px-5 py-2 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all duration-200"
        >
          Cancel
        </button>
      </div>

      {/* Two-column header fields */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {/* Left column */}
        <div className="space-y-4">
          <div className="relative">
            <label className={labelClass}>Vendor</label>
            <input
              type="text"
              value={vendorSearch}
              onChange={(e) => {
                setVendorSearch(e.target.value);
                setShowVendorDropdown(true);
                if (!e.target.value) setVendorId("");
              }}
              onFocus={() => setShowVendorDropdown(true)}
              onBlur={() => setTimeout(() => setShowVendorDropdown(false), 150)}
              placeholder="Search vendors..."
              className={inputClass}
            />
            {showVendorDropdown && filteredVendors.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#222222] border border-[#2a2a2a] rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {filteredVendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onMouseDown={() => selectVendor(v.id, v.name)}
                    className="w-full text-left px-3 py-2 text-sm text-[#f5f0eb] hover:bg-[#2a2a2a] transition-colors"
                  >
                    {v.name}
                    {v.company && (
                      <span className="text-[#888888] ml-2">({v.company})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Bill Reference</label>
            <input
              type="text"
              value={billReference}
              onChange={(e) => setBillReference(e.target.value)}
              placeholder="Vendor bill reference"
              className={inputClass}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              Bill Date <span className="text-[#f87171]">*</span>
            </label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className={`${inputClass} ${
                !billDate ? "border-[#f87171]/50 focus:ring-[#f87171]/30" : ""
              }`}
            />
          </div>
          <div>
            <label className={labelClass}>Accounting Date</label>
            <input
              type="date"
              value={accountingDate}
              onChange={(e) => setAccountingDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Payment Reference</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Payment ref"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Due Date{" "}
              <button
                type="button"
                className="text-[#CDB49E] hover:text-[#d4c0ad] text-[10px] ml-1"
              >
                or Payment Terms
              </button>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#2a2a2a]">
        {billTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#CDB49E] text-[#CDB49E]"
                : "border-transparent text-[#888888] hover:text-[#f5f0eb]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "lines" && (
        <div>
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_80px_100px_70px_100px_32px] gap-2 px-1 pb-2">
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
              Label
            </span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
              Account
            </span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest text-right">
              Qty
            </span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest text-right">
              Price
            </span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest text-right">
              Tax %
            </span>
            <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-widest text-right">
              Amount
            </span>
            <span />
          </div>

          <div className="space-y-2">
            {lines.map((line) => {
              if (line.type === "section") {
                return (
                  <div
                    key={line.key}
                    className="grid grid-cols-[1fr_32px] gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) =>
                        updateLine(line.key, "label", e.target.value)
                      }
                      placeholder="Section title..."
                      className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm font-semibold text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="p-2 text-[#888888] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }
              if (line.type === "note") {
                return (
                  <div
                    key={line.key}
                    className="grid grid-cols-[1fr_32px] gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) =>
                        updateLine(line.key, "label", e.target.value)
                      }
                      placeholder="Add a note..."
                      className="px-3 py-2 bg-[#222222] border border-dashed border-[#2a2a2a] rounded-lg text-sm italic text-[#888888] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="p-2 text-[#888888] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }
              const amount = line.quantity * line.price;
              return (
                <div
                  key={line.key}
                  className="grid grid-cols-[2fr_1.5fr_80px_100px_70px_100px_32px] gap-2 items-center"
                >
                  <input
                    type="text"
                    value={line.label}
                    onChange={(e) =>
                      updateLine(line.key, "label", e.target.value)
                    }
                    placeholder="Line description"
                    className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                  />
                  <select
                    value={line.account_id}
                    onChange={(e) =>
                      updateLine(line.key, "account_id", e.target.value)
                    }
                    className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                  >
                    <option value="">Select</option>
                    {expenseAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(
                        line.key,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] text-right focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.price}
                    onChange={(e) =>
                      updateLine(
                        line.key,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] text-right focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={line.tax_rate}
                    onChange={(e) =>
                      updateLine(
                        line.key,
                        "tax_rate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] text-right focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 transition-all duration-200"
                  />
                  <div className="text-sm text-right font-medium text-[#CDB49E] px-1">
                    {formatCurrency(amount)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="p-2 text-[#888888] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add buttons */}
          <div className="flex items-center gap-4 mt-3">
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 text-xs text-[#CDB49E] hover:text-[#d4c0ad] font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add a line
            </button>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#f5f0eb] font-medium transition-colors"
            >
              <LayoutList className="w-3 h-3" />
              Add a section
            </button>
            <button
              type="button"
              onClick={addNote}
              className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#f5f0eb] font-medium transition-colors"
            >
              <StickyNote className="w-3 h-3" />
              Add a note
            </button>
          </div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="bg-[#222222] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                  Account
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                  Label
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                  Debit
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                  Credit
                </th>
              </tr>
            </thead>
            <tbody>
              {journalItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-[#888888]"
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2 text-[#555555]" />
                    Add invoice lines to generate journal items
                  </td>
                </tr>
              ) : (
                journalItems.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#2a2a2a]/50 last:border-0"
                  >
                    <td className="px-5 py-2.5 text-sm text-[#f5f0eb]">
                      {item.account}
                    </td>
                    <td className="px-5 py-2.5 text-sm text-[#888888]">
                      {item.label}
                    </td>
                    <td className="px-5 py-2.5 text-sm text-right font-mono text-[#f5f0eb]">
                      {item.debit > 0 ? formatCurrency(item.debit) : ""}
                    </td>
                    <td className="px-5 py-2.5 text-sm text-right font-mono text-[#f5f0eb]">
                      {item.credit > 0 ? formatCurrency(item.credit) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "other" && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className={labelClass}>Payment Method</label>
            <select className={inputClass}>
              <option value="">Manual</option>
              <option value="bank">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Fiscal Position</label>
            <select className={inputClass}>
              <option value="">Default</option>
              <option value="domestic">Domestic</option>
              <option value="intl">International</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Recipient Bank</label>
            <input
              type="text"
              placeholder="Bank account number"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Incoterm</label>
            <select className={inputClass}>
              <option value="">None</option>
              <option value="fob">FOB</option>
              <option value="cif">CIF</option>
              <option value="exw">EXW</option>
            </select>
          </div>
        </div>
      )}

      {/* Totals section */}
      <div className="flex justify-end border-t border-[#2a2a2a] pt-4">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between text-[#888888]">
            <span>Untaxed Amount</span>
            <span className="text-[#f5f0eb] font-medium">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>Taxes</span>
            <span className="text-[#f5f0eb] font-medium">
              {formatCurrency(taxTotal)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-[#2a2a2a] pt-2.5 mt-2.5">
            <span className="text-[#f5f0eb]">Total</span>
            <span className="text-[#CDB49E]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
