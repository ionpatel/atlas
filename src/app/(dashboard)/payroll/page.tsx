"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Download,
  ChevronRight,
  TrendingUp,
  Building2,
  Wallet,
} from "lucide-react";
import { usePayrollStore, type PayRun, type PayPeriod } from "@/stores/payroll-store";
import { cn } from "@/lib/utils";

/* ─────────── helpers ─────────── */

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

const statusConfig: Record<string, { label: string; style: string; icon: typeof Clock }> = {
  draft: { label: "Draft", style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: FileText },
  processing: { label: "Processing", style: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
  approved: { label: "Approved", style: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: CheckCircle2 },
  paid: { label: "Paid", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
};

/* ─────────── stat card ─────────── */

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: typeof DollarSign;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#CDB49E]/20 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-[#CDB49E]/10">
          <Icon className="w-5 h-5 text-[#CDB49E]" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            <TrendingUp className={cn("w-3 h-3", !trend.positive && "rotate-180")} />
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#f5f0eb] mb-1">{value}</p>
      <p className="text-xs text-[#888888]">{label}</p>
      {subValue && <p className="text-xs text-[#555555] mt-1">{subValue}</p>}
    </div>
  );
}

/* ─────────── pay run card ─────────── */

function PayRunCard({
  payRun,
  onClick,
}: {
  payRun: PayRun;
  onClick: () => void;
}) {
  const status = statusConfig[payRun.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#CDB49E]/25 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#f5f0eb] mb-1">{payRun.name}</h3>
          <p className="text-xs text-[#888888]">
            {formatDateShort(payRun.periodStart)} – {formatDateShort(payRun.periodEnd)}
          </p>
        </div>
        <span className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
          status.style
        )}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-[#555555] mb-1">Employees</p>
          <p className="text-sm font-medium text-[#f5f0eb]">{payRun.employeeCount}</p>
        </div>
        <div>
          <p className="text-xs text-[#555555] mb-1">Gross Pay</p>
          <p className="text-sm font-medium text-[#f5f0eb]">{formatCurrency(payRun.totalGross)}</p>
        </div>
        <div>
          <p className="text-xs text-[#555555] mb-1">Net Pay</p>
          <p className="text-sm font-medium text-emerald-400">{formatCurrency(payRun.totalNet)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2 text-xs text-[#888888]">
          <Calendar className="w-3.5 h-3.5 text-[#555555]" />
          Pay date: {formatDate(payRun.payDate)}
        </div>
        <ChevronRight className="w-4 h-4 text-[#555555] group-hover:text-[#CDB49E] transition-colors duration-200" />
      </div>
    </div>
  );
}

/* ─────────── create pay run modal ─────────── */

function CreatePayRunModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; payPeriod: PayPeriod; periodStart: string; periodEnd: string; payDate: string }) => void;
}) {
  const [name, setName] = useState("February 2026 - Period 2");
  const [payPeriod, setPayPeriod] = useState<PayPeriod>("semi-monthly");
  const [periodStart, setPeriodStart] = useState("2026-02-16");
  const [periodEnd, setPeriodEnd] = useState("2026-02-28");
  const [payDate, setPayDate] = useState("2026-03-05");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#f5f0eb] mb-6">Run Payroll</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#888888] mb-1.5 block">Pay Run Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#888888] mb-1.5 block">Pay Period</label>
            <select
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value as PayPeriod)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/50 focus:outline-none transition-colors"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="semi-monthly">Semi-monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888888] mb-1.5 block">Period Start</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#888888] mb-1.5 block">Period End</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#888888] mb-1.5 block">Pay Date</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#2a2a2a] rounded-lg text-sm font-medium text-[#888888] hover:text-[#f5f0eb] hover:border-[#3a3a3a] transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreate({ name, payPeriod, periodStart, periodEnd, payDate });
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
          >
            <Play className="w-4 h-4" />
            Run Payroll
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── export helper ─────────── */

function exportPayRunToCSV(payRun: PayRun) {
  const headers = [
    "Employee",
    "Gross Pay",
    "Federal Tax",
    "Provincial Tax",
    "CPP",
    "EI",
    "Other Deductions",
    "Total Deductions",
    "Net Pay",
  ];

  const rows = payRun.payStubs.map((stub) => [
    stub.employeeName,
    stub.grossPay.toFixed(2),
    stub.federalTax.toFixed(2),
    stub.provincialTax.toFixed(2),
    stub.cpp.toFixed(2),
    stub.ei.toFixed(2),
    stub.otherDeductions.toFixed(2),
    stub.totalDeductions.toFixed(2),
    stub.netPay.toFixed(2),
  ]);

  // Add summary row
  rows.push([]);
  rows.push([
    "TOTALS",
    payRun.totalGross.toFixed(2),
    payRun.payStubs.reduce((sum, s) => sum + s.federalTax, 0).toFixed(2),
    payRun.payStubs.reduce((sum, s) => sum + s.provincialTax, 0).toFixed(2),
    payRun.payStubs.reduce((sum, s) => sum + s.cpp, 0).toFixed(2),
    payRun.payStubs.reduce((sum, s) => sum + s.ei, 0).toFixed(2),
    payRun.payStubs.reduce((sum, s) => sum + s.otherDeductions, 0).toFixed(2),
    payRun.totalDeductions.toFixed(2),
    payRun.totalNet.toFixed(2),
  ]);

  const csvContent = [
    `Pay Run: ${payRun.name}`,
    `Period: ${payRun.periodStart} to ${payRun.periodEnd}`,
    `Pay Date: ${payRun.payDate}`,
    `Status: ${payRun.status.toUpperCase()}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payroll-${payRun.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ─────────── pay stub detail ─────────── */

function PayStubDetail({
  payRun,
  onClose,
  onApprove,
  onMarkPaid,
}: {
  payRun: PayRun;
  onClose: () => void;
  onApprove: () => void;
  onMarkPaid: () => void;
}) {
  const status = statusConfig[payRun.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-xl font-semibold text-[#f5f0eb]">{payRun.name}</h2>
            <p className="text-sm text-[#888888] mt-1">
              {formatDate(payRun.periodStart)} – {formatDate(payRun.periodEnd)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
              status.style
            )}>
              {status.label}
            </span>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-[#f5f0eb] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-[#2a2a2a] bg-[#0a0a0a]/50">
          <div>
            <p className="text-xs text-[#555555] mb-1">Employees</p>
            <p className="text-lg font-semibold text-[#f5f0eb]">{payRun.employeeCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#555555] mb-1">Gross Pay</p>
            <p className="text-lg font-semibold text-[#f5f0eb]">{formatCurrency(payRun.totalGross)}</p>
          </div>
          <div>
            <p className="text-xs text-[#555555] mb-1">Deductions</p>
            <p className="text-lg font-semibold text-red-400">{formatCurrency(payRun.totalDeductions)}</p>
          </div>
          <div>
            <p className="text-xs text-[#555555] mb-1">Net Pay</p>
            <p className="text-lg font-semibold text-emerald-400">{formatCurrency(payRun.totalNet)}</p>
          </div>
        </div>

        {/* Pay Stubs Table */}
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#141414]">
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Employee</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Gross</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Federal Tax</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Provincial</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">CPP</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">EI</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {payRun.payStubs.map((stub) => (
                <tr key={stub.id} className="border-b border-[#2a2a2a]/50 hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#f5f0eb]">{stub.employeeName}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[#f5f0eb]">{formatCurrency(stub.grossPay)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#888888]">{formatCurrency(stub.federalTax)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#888888]">{formatCurrency(stub.provincialTax)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#888888]">{formatCurrency(stub.cpp)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#888888]">{formatCurrency(stub.ei)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-emerald-400">{formatCurrency(stub.netPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-[#2a2a2a] bg-[#0a0a0a]/50">
          <div className="flex items-center gap-2 text-xs text-[#888888]">
            <Building2 className="w-4 h-4 text-[#555555]" />
            <span>Employer cost: <span className="text-[#f5f0eb] font-medium">{formatCurrency(payRun.totalEmployerCost)}</span></span>
            <span className="text-[#555555]">•</span>
            <span>Includes CPP & EI contributions</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => exportPayRunToCSV(payRun)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm font-medium text-[#888888] hover:text-[#f5f0eb] hover:border-[#3a3a3a] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {payRun.status === "draft" && (
              <button
                onClick={onApprove}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-500/20 transition-all duration-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            )}
            {payRun.status === "approved" && (
              <button
                onClick={onMarkPaid}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
              >
                <Wallet className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PAYROLL PAGE ═══════════════════════ */

export default function PayrollPage() {
  const { payRuns, compensations, createPayRun, approvePayRun, markAsPaid } = usePayrollStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayRun, setSelectedPayRun] = useState<PayRun | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const paidRuns = payRuns.filter((pr) => pr.status === "paid");
    const ytdGross = paidRuns.reduce((sum, pr) => sum + pr.totalGross, 0);
    const ytdNet = paidRuns.reduce((sum, pr) => sum + pr.totalNet, 0);
    const ytdDeductions = paidRuns.reduce((sum, pr) => sum + pr.totalDeductions, 0);
    const pendingRuns = payRuns.filter((pr) => pr.status === "approved" || pr.status === "draft");
    const nextPayDate = pendingRuns.length > 0 
      ? new Date(pendingRuns[0].payDate).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
      : "—";

    return {
      ytdGross,
      ytdNet,
      ytdDeductions,
      nextPayDate,
      activeEmployees: compensations.length,
    };
  }, [payRuns, compensations]);

  const handleCreatePayRun = (data: { name: string; payPeriod: PayPeriod; periodStart: string; periodEnd: string; payDate: string }) => {
    const newRun = createPayRun({
      ...data,
      orgId: "org1",
      status: "draft",
      employeeCount: compensations.length,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalEmployerCost: 0,
    });
    setSelectedPayRun(newRun);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">Payroll</h1>
          <p className="text-[#888888] text-sm mt-1">
            Canadian payroll with CPP, EI, and tax calculations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Play className="w-4 h-4" />
          Run Payroll
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="YTD Gross Payroll"
          value={formatCurrency(stats.ytdGross)}
          subValue={`${payRuns.filter(pr => pr.status === "paid").length} pay runs`}
        />
        <StatCard
          icon={Wallet}
          label="YTD Net Paid"
          value={formatCurrency(stats.ytdNet)}
          subValue="After all deductions"
        />
        <StatCard
          icon={Users}
          label="Active Employees"
          value={stats.activeEmployees.toString()}
          subValue="On payroll"
        />
        <StatCard
          icon={Calendar}
          label="Next Pay Date"
          value={stats.nextPayDate}
          subValue="Upcoming"
        />
      </div>

      {/* Pay Runs */}
      <div>
        <h2 className="text-lg font-semibold text-[#f5f0eb] mb-4">Pay Runs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {payRuns.map((payRun) => (
            <PayRunCard
              key={payRun.id}
              payRun={payRun}
              onClick={() => setSelectedPayRun(payRun)}
            />
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-[#f5f0eb] mb-4">🇨🇦 Canadian Compliance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-[#555555] text-xs mb-1">CPP Rate (2026)</p>
            <p className="text-[#f5f0eb]">5.95% (max $4,034)</p>
          </div>
          <div>
            <p className="text-[#555555] text-xs mb-1">EI Rate (2026)</p>
            <p className="text-[#f5f0eb]">1.63% (max $1,072)</p>
          </div>
          <div>
            <p className="text-[#555555] text-xs mb-1">Federal Basic</p>
            <p className="text-[#f5f0eb]">$15,705</p>
          </div>
          <div>
            <p className="text-[#555555] text-xs mb-1">Ontario Basic</p>
            <p className="text-[#f5f0eb]">$11,865</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePayRunModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePayRun}
      />

      {selectedPayRun && (
        <PayStubDetail
          payRun={selectedPayRun}
          onClose={() => setSelectedPayRun(null)}
          onApprove={() => {
            approvePayRun(selectedPayRun.id);
            setSelectedPayRun({ ...selectedPayRun, status: "approved" });
          }}
          onMarkPaid={() => {
            markAsPaid(selectedPayRun.id);
            setSelectedPayRun({ ...selectedPayRun, status: "paid" });
          }}
        />
      )}
    </div>
  );
}
