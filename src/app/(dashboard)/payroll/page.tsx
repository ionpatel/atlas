"use client";

import { useState, useMemo, useEffect } from "react";
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
import { usePayrollStore, type PayRun, type PayPeriod, type PayStub } from "@/stores/payroll-store";
import { cn } from "@/lib/utils";

/* ─────────── T4 Generator ─────────── */

function generateT4(employeeName: string, ytdData: {
  gross: number;
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
}, year: number = 2026) {
  const totalTax = ytdData.federalTax + ytdData.provincialTax;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>T4 - ${employeeName} - ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .t4 { max-width: 800px; margin: 0 auto; background: white; border: 2px solid #000; }
    .header { background: #1a1a1a; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 24px; }
    .header .year { font-size: 28px; font-weight: bold; }
    .subheader { background: #333; color: white; padding: 8px 20px; font-size: 12px; }
    .content { padding: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .box { border: 1px solid #ccc; padding: 10px; }
    .box-number { font-size: 10px; color: #666; margin-bottom: 3px; }
    .box-label { font-size: 11px; color: #333; margin-bottom: 5px; }
    .box-value { font-size: 16px; font-weight: bold; color: #000; }
    .employer-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .employer-info, .employee-info { border: 1px solid #ccc; padding: 15px; }
    .info-title { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
    .info-line { font-size: 12px; margin-bottom: 5px; }
    .totals { background: #f9f9f9; padding: 15px; margin-top: 20px; }
    .totals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
    .total-box { text-align: center; }
    .total-label { font-size: 10px; color: #666; }
    .total-value { font-size: 18px; font-weight: bold; }
    .footer { background: #f0f0f0; padding: 15px 20px; font-size: 10px; color: #666; text-align: center; }
    @media print { body { padding: 0; background: white; } .t4 { border: none; } }
  </style>
</head>
<body>
  <div class="t4">
    <div class="header">
      <h1>T4</h1>
      <div class="year">${year}</div>
    </div>
    <div class="subheader">STATEMENT OF REMUNERATION PAID</div>
    
    <div class="content">
      <div class="employer-section">
        <div class="employer-info">
          <div class="info-title">Employer Information</div>
          <div class="info-line"><strong>Atlas ERP Inc.</strong></div>
          <div class="info-line">123 Business Street</div>
          <div class="info-line">Toronto, ON M5V 1A1</div>
          <div class="info-line">Business Number: 123456789RP0001</div>
        </div>
        <div class="employee-info">
          <div class="info-title">Employee Information</div>
          <div class="info-line"><strong>${employeeName}</strong></div>
          <div class="info-line">SIN: XXX-XXX-XXX</div>
          <div class="info-line">Province of Employment: ON</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Income & Deductions</div>
        <div class="grid">
          <div class="box">
            <div class="box-number">Box 14</div>
            <div class="box-label">Employment Income</div>
            <div class="box-value">$${ytdData.gross.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="box">
            <div class="box-number">Box 16</div>
            <div class="box-label">Employee's CPP Contributions</div>
            <div class="box-value">$${ytdData.cpp.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="box">
            <div class="box-number">Box 18</div>
            <div class="box-label">Employee's EI Premiums</div>
            <div class="box-value">$${ytdData.ei.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="box">
            <div class="box-number">Box 22</div>
            <div class="box-label">Income Tax Deducted</div>
            <div class="box-value">$${totalTax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="box">
            <div class="box-number">Box 24</div>
            <div class="box-label">EI Insurable Earnings</div>
            <div class="box-value">$${Math.min(ytdData.gross, 65700).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="box">
            <div class="box-number">Box 26</div>
            <div class="box-label">CPP/QPP Pensionable Earnings</div>
            <div class="box-value">$${Math.min(ytdData.gross, 71300).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <div class="totals">
        <div class="totals-grid">
          <div class="total-box">
            <div class="total-label">Total Income</div>
            <div class="total-value">$${ytdData.gross.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="total-box">
            <div class="total-label">Total Tax</div>
            <div class="total-value">$${totalTax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="total-box">
            <div class="total-label">Total CPP</div>
            <div class="total-value">$${ytdData.cpp.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="total-box">
            <div class="total-label">Total EI</div>
            <div class="total-value">$${ytdData.ei.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      This is a computer-generated T4 slip. For official tax filing, please verify with CRA requirements.<br>
      Generated by Atlas ERP
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

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

function generatePayStubPDF(stub: PayStub, payRunName: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Pay Stub - ${stub.employeeName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .stub { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #111111 0%, #1a1a1a 100%); color: white; padding: 30px; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { color: #CDB49E; font-size: 14px; }
    .company { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
    .company-name { font-size: 18px; font-weight: 600; }
    .pay-date { text-align: right; }
    .pay-date .label { font-size: 12px; color: #888; }
    .pay-date .value { font-size: 16px; font-weight: 600; color: #CDB49E; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #555; }
    .row .value { font-weight: 500; }
    .row.highlight { background: #f9f9f9; margin: 0 -15px; padding: 12px 15px; border-radius: 6px; }
    .row.highlight .value { color: #111; font-weight: 600; font-size: 18px; }
    .earnings .value { color: #059669; }
    .deductions .value { color: #dc2626; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .totals { background: #111; color: white; padding: 25px 30px; display: flex; justify-content: space-between; align-items: center; }
    .totals .label { font-size: 14px; color: #888; }
    .totals .amount { font-size: 32px; font-weight: 700; color: #CDB49E; }
    .ytd { background: #f9f9f9; padding: 20px 30px; }
    .ytd-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 15px; }
    .ytd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .ytd-item .label { font-size: 11px; color: #888; }
    .ytd-item .value { font-size: 16px; font-weight: 600; color: #111; }
    .footer { padding: 20px 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #f0f0f0; }
    @media print { body { padding: 0; background: white; } .stub { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="stub">
    <div class="header">
      <h1>PAY STUB</h1>
      <p>${payRunName}</p>
      <div class="company">
        <div>
          <div class="company-name">Atlas ERP</div>
          <div style="color: #888; font-size: 13px; margin-top: 5px;">Your Company Address</div>
        </div>
        <div class="pay-date">
          <div class="label">PAY DATE</div>
          <div class="value">${new Date(stub.payDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Employee Information</div>
        <div class="row">
          <span class="label">Employee Name</span>
          <span class="value">${stub.employeeName}</span>
        </div>
        <div class="row">
          <span class="label">Pay Period</span>
          <span class="value">${new Date(stub.periodStart).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} – ${new Date(stub.periodEnd).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div class="grid">
        <div class="section earnings">
          <div class="section-title">Earnings</div>
          <div class="row">
            <span class="label">Regular Pay (${stub.regularHours.toFixed(1)} hrs @ $${stub.regularRate.toFixed(2)})</span>
            <span class="value">$${stub.regularPay.toFixed(2)}</span>
          </div>
          ${stub.overtimePay > 0 ? `<div class="row"><span class="label">Overtime (${stub.overtimeHours.toFixed(1)} hrs)</span><span class="value">$${stub.overtimePay.toFixed(2)}</span></div>` : ''}
          ${stub.bonus > 0 ? `<div class="row"><span class="label">Bonus</span><span class="value">$${stub.bonus.toFixed(2)}</span></div>` : ''}
          ${stub.commission > 0 ? `<div class="row"><span class="label">Commission</span><span class="value">$${stub.commission.toFixed(2)}</span></div>` : ''}
          ${stub.vacation > 0 ? `<div class="row"><span class="label">Vacation Pay</span><span class="value">$${stub.vacation.toFixed(2)}</span></div>` : ''}
          <div class="row highlight">
            <span class="label">Gross Pay</span>
            <span class="value">$${stub.grossPay.toFixed(2)}</span>
          </div>
        </div>

        <div class="section deductions">
          <div class="section-title">Deductions</div>
          <div class="row">
            <span class="label">Federal Tax</span>
            <span class="value">-$${stub.federalTax.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">Provincial Tax</span>
            <span class="value">-$${stub.provincialTax.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">CPP Contribution</span>
            <span class="value">-$${stub.cpp.toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">EI Premium</span>
            <span class="value">-$${stub.ei.toFixed(2)}</span>
          </div>
          ${stub.otherDeductions > 0 ? `<div class="row"><span class="label">Other Deductions</span><span class="value">-$${stub.otherDeductions.toFixed(2)}</span></div>` : ''}
          <div class="row highlight">
            <span class="label">Total Deductions</span>
            <span class="value">-$${stub.totalDeductions.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="totals">
      <div class="label">NET PAY</div>
      <div class="amount">$${stub.netPay.toFixed(2)}</div>
    </div>

    <div class="ytd">
      <div class="ytd-title">Year-to-Date Totals</div>
      <div class="ytd-grid">
        <div class="ytd-item">
          <div class="label">YTD Gross</div>
          <div class="value">$${stub.ytdGross.toFixed(2)}</div>
        </div>
        <div class="ytd-item">
          <div class="label">YTD Taxes</div>
          <div class="value">$${(stub.ytdFederalTax + stub.ytdProvincialTax).toFixed(2)}</div>
        </div>
        <div class="ytd-item">
          <div class="label">YTD CPP</div>
          <div class="value">$${stub.ytdCpp.toFixed(2)}</div>
        </div>
        <div class="ytd-item">
          <div class="label">YTD EI</div>
          <div class="value">$${stub.ytdEi.toFixed(2)}</div>
        </div>
        <div class="ytd-item">
          <div class="label">YTD Net</div>
          <div class="value">$${stub.ytdNet.toFixed(2)}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      This is a computer-generated document. Please retain for your records.<br>
      Generated by Atlas ERP • ${new Date().toLocaleDateString('en-CA')}
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
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
                <th className="text-center px-6 py-3 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">Pay Stub</th>
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => generatePayStubPDF(stub, payRun.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CDB49E] bg-[#CDB49E]/10 border border-[#CDB49E]/20 rounded-lg hover:bg-[#CDB49E]/20 transition-all"
                        title="View Pay Stub"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Stub
                      </button>
                      <button
                        onClick={() => generateT4(stub.employeeName, {
                          gross: stub.ytdGross,
                          federalTax: stub.ytdFederalTax,
                          provincialTax: stub.ytdProvincialTax,
                          cpp: stub.ytdCpp,
                          ei: stub.ytdEi,
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                        title="Generate T4"
                      >
                        T4
                      </button>
                    </div>
                  </td>
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
  const { payRuns, compensations, createPayRun, approvePayRun, markAsPaid, fetchPayRuns, fetchCompensations, loading } = usePayrollStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayRun, setSelectedPayRun] = useState<PayRun | null>(null);

  // Demo org UUID
  const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

  // Fetch pay runs and compensations on mount
  useEffect(() => {
    fetchPayRuns(DEMO_ORG_ID);
    fetchCompensations(DEMO_ORG_ID);
  }, [fetchPayRuns, fetchCompensations]);

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

  const handleCreatePayRun = async (data: { name: string; payPeriod: PayPeriod; periodStart: string; periodEnd: string; payDate: string }) => {
    const newRun = await createPayRun({
      ...data,
      orgId: DEMO_ORG_ID,
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
