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

/* ─────────── PDF Download Helper ─────────── */

async function downloadPDF(html: string, filename: string) {
  // Dynamically import html2pdf (client-side only)
  const html2pdf = (await import('html2pdf.js')).default;
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  // Find the main content element
  const element = container.querySelector('.t4, .stub') as HTMLElement || container;

  // Generate and download PDF
  await html2pdf()
    .set({
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(element)
    .save();

  // Cleanup
  document.body.removeChild(container);
}

/* ─────────── T4 Generator ─────────── */

async function generateT4(employeeName: string, ytdData: {
  gross: number;
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
}, year: number = 2026) {
  const totalTax = ytdData.federalTax + ytdData.provincialTax;
  const html = `
<div class="t4" style="max-width: 800px; margin: 0 auto; background: white; border: 2px solid #000; font-family: Arial, sans-serif;">
  <div style="background: #E6D4C7; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
    <h1 style="font-size: 24px; margin: 0;">T4</h1>
    <div style="font-size: 28px; font-weight: bold;">${year}</div>
  </div>
  <div style="background: #333; color: white; padding: 8px 20px; font-size: 12px;">STATEMENT OF REMUNERATION PAID</div>
  
  <div style="padding: 20px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div style="border: 1px solid #ccc; padding: 15px;">
        <div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 10px;">Employer Information</div>
        <div style="font-size: 12px; margin-bottom: 5px;"><strong>Atlas ERP Inc.</strong></div>
        <div style="font-size: 12px; margin-bottom: 5px;">123 Business Street</div>
        <div style="font-size: 12px; margin-bottom: 5px;">Toronto, ON M5V 1A1</div>
        <div style="font-size: 12px; margin-bottom: 5px;">Business Number: 123456789RP0001</div>
      </div>
      <div style="border: 1px solid #ccc; padding: 15px;">
        <div style="font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 10px;">Employee Information</div>
        <div style="font-size: 12px; margin-bottom: 5px;"><strong>${employeeName}</strong></div>
        <div style="font-size: 12px; margin-bottom: 5px;">SIN: XXX-XXX-XXX</div>
        <div style="font-size: 12px; margin-bottom: 5px;">Province of Employment: ON</div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Income & Deductions</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div style="border: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Box 14</div>
          <div style="font-size: 11px; color: #333; margin-bottom: 5px;">Employment Income</div>
          <div style="font-size: 16px; font-weight: bold; color: #000;">$${ytdData.gross.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="border: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Box 16</div>
          <div style="font-size: 11px; color: #333; margin-bottom: 5px;">Employee's CPP Contributions</div>
          <div style="font-size: 16px; font-weight: bold; color: #000;">$${ytdData.cpp.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="border: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Box 18</div>
          <div style="font-size: 11px; color: #333; margin-bottom: 5px;">Employee's EI Premiums</div>
          <div style="font-size: 16px; font-weight: bold; color: #000;">$${ytdData.ei.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="border: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Box 22</div>
          <div style="font-size: 11px; color: #333; margin-bottom: 5px;">Income Tax Deducted</div>
          <div style="font-size: 16px; font-weight: bold; color: #000;">$${totalTax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="border: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Box 24</div>
          <div style="font-size: 11px; color: #333; margin-bottom: 5px;">EI Insurable Earnings</div>
          <div style="font-size: 16px; font-weight: bold; color: #000;">$${Math.min(ytdData.gross, 65700).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="border: 1px solid #ccc; padding: 10px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 3px;">Box 26</div>
          <div style="font-size: 11px; color: #333; margin-bottom: 5px;">CPP/QPP Pensionable Earnings</div>
          <div style="font-size: 16px; font-weight: bold; color: #000;">$${Math.min(ytdData.gross, 71300).toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>

    <div style="background: #f9f9f9; padding: 15px; margin-top: 20px;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #666;">Total Income</div>
          <div style="font-size: 18px; font-weight: bold;">$${ytdData.gross.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #666;">Total Tax</div>
          <div style="font-size: 18px; font-weight: bold;">$${totalTax.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #666;">Total CPP</div>
          <div style="font-size: 18px; font-weight: bold;">$${ytdData.cpp.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #666;">Total EI</div>
          <div style="font-size: 18px; font-weight: bold;">$${ytdData.ei.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  </div>

  <div style="background: #f0f0f0; padding: 15px 20px; font-size: 10px; color: #666; text-align: center;">
    This is a computer-generated T4 slip. For official tax filing, please verify with CRA requirements.<br>
    Generated by Atlas ERP
  </div>
</div>`;

  const safeName = employeeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  await downloadPDF(html, `T4-${safeName}-${year}.pdf`);
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
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5 hover:border-[#262626]/20 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-[#161616]/10">
          <Icon className="w-5 h-5 text-[#FAFAFA]" />
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
      <p className="text-2xl font-semibold text-[#FAFAFA] mb-1">{value}</p>
      <p className="text-xs text-[#FAFAFA]">{label}</p>
      {subValue && <p className="text-xs text-[#FAFAFA] mt-1">{subValue}</p>}
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
      className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5 hover:border-[#262626]/25 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">{payRun.name}</h3>
          <p className="text-xs text-[#FAFAFA]">
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
          <p className="text-xs text-[#FAFAFA] mb-1">Employees</p>
          <p className="text-sm font-medium text-[#FAFAFA]">{payRun.employeeCount}</p>
        </div>
        <div>
          <p className="text-xs text-[#FAFAFA] mb-1">Gross Pay</p>
          <p className="text-sm font-medium text-[#FAFAFA]">{formatCurrency(payRun.totalGross)}</p>
        </div>
        <div>
          <p className="text-xs text-[#FAFAFA] mb-1">Net Pay</p>
          <p className="text-sm font-medium text-emerald-400">{formatCurrency(payRun.totalNet)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
        <div className="flex items-center gap-2 text-xs text-[#FAFAFA]">
          <Calendar className="w-3.5 h-3.5 text-[#FAFAFA]" />
          Pay date: {formatDate(payRun.payDate)}
        </div>
        <ChevronRight className="w-4 h-4 text-[#FAFAFA] group-hover:text-[#FAFAFA] transition-colors duration-200" />
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
      <div className="relative bg-[#0A0A0A] border border-[#262626] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#FAFAFA] mb-6">Run Payroll</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#FAFAFA] mb-1.5 block">Pay Run Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#262626]/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#FAFAFA] mb-1.5 block">Pay Period</label>
            <select
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value as PayPeriod)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#262626]/50 focus:outline-none transition-colors"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="semi-monthly">Semi-monthly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#FAFAFA] mb-1.5 block">Period Start</label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#262626]/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#FAFAFA] mb-1.5 block">Period End</label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#262626]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#FAFAFA] mb-1.5 block">Pay Date</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#262626]/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#262626] rounded-lg text-sm font-medium text-[#FAFAFA] hover:text-[#FAFAFA] hover:border-[#3a3a3a] transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreate({ name, payPeriod, periodStart, periodEnd, payDate });
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
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

async function generatePayStubPDF(stub: PayStub, payRunName: string) {
  const html = `
<div class="stub" style="max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="background: linear-gradient(135deg, #E6D4C7 0%, #E6D4C7 100%); color: white; padding: 30px;">
    <h1 style="font-size: 24px; margin: 0 0 5px 0;">PAY STUB</h1>
    <p style="color: #273B3A; font-size: 14px; margin: 0;">${payRunName}</p>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px;">
      <div>
        <div style="font-size: 18px; font-weight: 600;">Atlas ERP</div>
        <div style="color: #888; font-size: 13px; margin-top: 5px;">Your Company Address</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #888;">PAY DATE</div>
        <div style="font-size: 16px; font-weight: 600; color: #273B3A;">${new Date(stub.payDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
    </div>
  </div>
  
  <div style="padding: 30px;">
    <div style="margin-bottom: 25px;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">Employee Information</div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
        <span style="color: #555;">Employee Name</span>
        <span style="font-weight: 500;">${stub.employeeName}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0;">
        <span style="color: #555;">Pay Period</span>
        <span style="font-weight: 500;">${new Date(stub.periodStart).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} – ${new Date(stub.periodEnd).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
      <div style="margin-bottom: 25px;">
        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">Earnings</div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="color: #555;">Regular Pay (${stub.regularHours.toFixed(1)} hrs @ $${stub.regularRate.toFixed(2)})</span>
          <span style="font-weight: 500; color: #059669;">$${stub.regularPay.toFixed(2)}</span>
        </div>
        ${stub.overtimePay > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><span style="color: #555;">Overtime (${stub.overtimeHours.toFixed(1)} hrs)</span><span style="font-weight: 500; color: #059669;">$${stub.overtimePay.toFixed(2)}</span></div>` : ''}
        ${stub.bonus > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><span style="color: #555;">Bonus</span><span style="font-weight: 500; color: #059669;">$${stub.bonus.toFixed(2)}</span></div>` : ''}
        ${stub.commission > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><span style="color: #555;">Commission</span><span style="font-weight: 500; color: #059669;">$${stub.commission.toFixed(2)}</span></div>` : ''}
        ${stub.vacation > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><span style="color: #555;">Vacation Pay</span><span style="font-weight: 500; color: #059669;">$${stub.vacation.toFixed(2)}</span></div>` : ''}
        <div style="background: #f9f9f9; margin: 8px -15px 0; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between;">
          <span style="color: #555;">Gross Pay</span>
          <span style="color: #111; font-weight: 600; font-size: 18px;">$${stub.grossPay.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">Deductions</div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="color: #555;">Federal Tax</span>
          <span style="font-weight: 500; color: #dc2626;">-$${stub.federalTax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="color: #555;">Provincial Tax</span>
          <span style="font-weight: 500; color: #dc2626;">-$${stub.provincialTax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="color: #555;">CPP Contribution</span>
          <span style="font-weight: 500; color: #dc2626;">-$${stub.cpp.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
          <span style="color: #555;">EI Premium</span>
          <span style="font-weight: 500; color: #dc2626;">-$${stub.ei.toFixed(2)}</span>
        </div>
        ${stub.otherDeductions > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5;"><span style="color: #555;">Other Deductions</span><span style="font-weight: 500; color: #dc2626;">-$${stub.otherDeductions.toFixed(2)}</span></div>` : ''}
        <div style="background: #f9f9f9; margin: 8px -15px 0; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between;">
          <span style="color: #555;">Total Deductions</span>
          <span style="color: #111; font-weight: 600; font-size: 18px;">-$${stub.totalDeductions.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  <div style="background: #111; color: white; padding: 25px 30px; display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 14px; color: #888;">NET PAY</div>
    <div style="font-size: 32px; font-weight: 700; color: #273B3A;">$${stub.netPay.toFixed(2)}</div>
  </div>

  <div style="background: #f9f9f9; padding: 20px 30px;">
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 15px;">Year-to-Date Totals</div>
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px;">
      <div>
        <div style="font-size: 11px; color: #888;">YTD Gross</div>
        <div style="font-size: 16px; font-weight: 600; color: #111;">$${stub.ytdGross.toFixed(2)}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #888;">YTD Taxes</div>
        <div style="font-size: 16px; font-weight: 600; color: #111;">$${(stub.ytdFederalTax + stub.ytdProvincialTax).toFixed(2)}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #888;">YTD CPP</div>
        <div style="font-size: 16px; font-weight: 600; color: #111;">$${stub.ytdCpp.toFixed(2)}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #888;">YTD EI</div>
        <div style="font-size: 16px; font-weight: 600; color: #111;">$${stub.ytdEi.toFixed(2)}</div>
      </div>
      <div>
        <div style="font-size: 11px; color: #888;">YTD Net</div>
        <div style="font-size: 16px; font-weight: 600; color: #111;">$${stub.ytdNet.toFixed(2)}</div>
      </div>
    </div>
  </div>

  <div style="padding: 20px 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #f0f0f0;">
    This is a computer-generated document. Please retain for your records.<br>
    Generated by Atlas ERP • ${new Date().toLocaleDateString('en-CA')}
  </div>
</div>`;

  const safeName = stub.employeeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const periodDate = new Date(stub.periodEnd).toISOString().slice(0, 10);
  await downloadPDF(html, `PayStub-${safeName}-${periodDate}.pdf`);
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
      <div className="relative bg-[#0A0A0A] border border-[#262626] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div>
            <h2 className="text-xl font-semibold text-[#FAFAFA]">{payRun.name}</h2>
            <p className="text-sm text-[#FAFAFA] mt-1">
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
              className="text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-[#262626] bg-[#0a0a0a]/50">
          <div>
            <p className="text-xs text-[#FAFAFA] mb-1">Employees</p>
            <p className="text-lg font-semibold text-[#FAFAFA]">{payRun.employeeCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#FAFAFA] mb-1">Gross Pay</p>
            <p className="text-lg font-semibold text-[#FAFAFA]">{formatCurrency(payRun.totalGross)}</p>
          </div>
          <div>
            <p className="text-xs text-[#FAFAFA] mb-1">Deductions</p>
            <p className="text-lg font-semibold text-red-400">{formatCurrency(payRun.totalDeductions)}</p>
          </div>
          <div>
            <p className="text-xs text-[#FAFAFA] mb-1">Net Pay</p>
            <p className="text-lg font-semibold text-emerald-400">{formatCurrency(payRun.totalNet)}</p>
          </div>
        </div>

        {/* Pay Stubs Table */}
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#0A0A0A]">
              <tr className="border-b border-[#262626]">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Employee</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Gross</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Federal Tax</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Provincial</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">CPP</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">EI</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Net Pay</th>
                <th className="text-center px-6 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Pay Stub</th>
              </tr>
            </thead>
            <tbody>
              {payRun.payStubs.map((stub) => (
                <tr key={stub.id} className="border-b border-[#262626]/50 hover:bg-[#0A0A0A] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#FAFAFA]">{stub.employeeName}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[#FAFAFA]">{formatCurrency(stub.grossPay)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#FAFAFA]">{formatCurrency(stub.federalTax)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#FAFAFA]">{formatCurrency(stub.provincialTax)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#FAFAFA]">{formatCurrency(stub.cpp)}</td>
                  <td className="px-6 py-4 text-right text-sm text-[#FAFAFA]">{formatCurrency(stub.ei)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-emerald-400">{formatCurrency(stub.netPay)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={async () => await generatePayStubPDF(stub, payRun.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAFAFA] bg-[#161616]/10 border border-[#262626]/20 rounded-lg hover:bg-[#161616]/20 transition-all"
                        title="Download Pay Stub PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Stub
                      </button>
                      <button
                        onClick={async () => await generateT4(stub.employeeName, {
                          gross: stub.ytdGross,
                          federalTax: stub.ytdFederalTax,
                          provincialTax: stub.ytdProvincialTax,
                          cpp: stub.ytdCpp,
                          ei: stub.ytdEi,
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                        title="Download T4 PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
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
        <div className="flex items-center justify-between p-6 border-t border-[#262626] bg-[#0a0a0a]/50">
          <div className="flex items-center gap-2 text-xs text-[#FAFAFA]">
            <Building2 className="w-4 h-4 text-[#FAFAFA]" />
            <span>Employer cost: <span className="text-[#FAFAFA] font-medium">{formatCurrency(payRun.totalEmployerCost)}</span></span>
            <span className="text-[#FAFAFA]">•</span>
            <span>Includes CPP & EI contributions</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => exportPayRunToCSV(payRun)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#262626] rounded-lg text-sm font-medium text-[#FAFAFA] hover:text-[#FAFAFA] hover:border-[#3a3a3a] transition-all duration-200"
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
                className="flex items-center gap-2 px-4 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">Payroll</h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            Canadian payroll with CPP, EI, and tax calculations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
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
        <h2 className="text-lg font-semibold text-[#FAFAFA] mb-4">Pay Runs</h2>
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
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4">🇨🇦 Canadian Compliance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-[#FAFAFA] text-xs mb-1">CPP Rate (2026)</p>
            <p className="text-[#FAFAFA]">5.95% (max $4,034)</p>
          </div>
          <div>
            <p className="text-[#FAFAFA] text-xs mb-1">EI Rate (2026)</p>
            <p className="text-[#FAFAFA]">1.63% (max $1,072)</p>
          </div>
          <div>
            <p className="text-[#FAFAFA] text-xs mb-1">Federal Basic</p>
            <p className="text-[#FAFAFA]">$15,705</p>
          </div>
          <div>
            <p className="text-[#FAFAFA] text-xs mb-1">Ontario Basic</p>
            <p className="text-[#FAFAFA]">$11,865</p>
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
