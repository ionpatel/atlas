"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Calendar,
  ChevronRight,
  Filter,
  RefreshCcw,
  Eye,
  Printer,
  Share2,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { useInventoryStore } from "@/stores/inventory-store";
import { useInvoicesStore } from "@/stores/invoices-store";
import { useContactsStore } from "@/stores/contacts-store";
import { useSalesStore } from "@/stores/sales-store";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ─────────────────────── types ─────────────────────── */

type ReportType =
  | "sales_summary"
  | "inventory_valuation"
  | "accounts_receivable"
  | "top_products"
  | "customer_analysis"
  | "profit_loss";

interface Report {
  id: ReportType;
  name: string;
  description: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  category: "sales" | "inventory" | "finance" | "customers";
}

/* ─────────────────────── report definitions ─────────────────────── */

const reports: Report[] = [
  {
    id: "sales_summary",
    name: "Sales Summary",
    description: "Revenue, orders, and sales trends over time",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    category: "sales",
  },
  {
    id: "inventory_valuation",
    name: "Inventory Valuation",
    description: "Stock levels and total inventory value",
    icon: Package,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    category: "inventory",
  },
  {
    id: "accounts_receivable",
    name: "Accounts Receivable",
    description: "Outstanding invoices and aging report",
    icon: DollarSign,
    color: "text-[#FAFAFA]",
    bgColor: "bg-[rgba(156,74,41,0.15)]",
    category: "finance",
  },
  {
    id: "top_products",
    name: "Top Products",
    description: "Best-selling and most profitable products",
    icon: BarChart3,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    category: "sales",
  },
  {
    id: "customer_analysis",
    name: "Customer Analysis",
    description: "Customer segments and purchase patterns",
    icon: Users,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    category: "customers",
  },
  {
    id: "profit_loss",
    name: "Profit & Loss",
    description: "Revenue, expenses, and net profit",
    icon: PieChart,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    category: "finance",
  },
];

/* ─────────────────────── export utilities ─────────────────────── */

const exportToPDF = async (reportData: unknown, reportName: string) => {
  // In production, use a proper PDF library like jsPDF or html2pdf
  const html2pdf = (await import("html2pdf.js")).default;
  
  // Create a temporary element for PDF generation
  const element = document.createElement("div");
  element.innerHTML = `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">${reportName}</h1>
      <p style="color: #888; font-size: 12px; margin-bottom: 32px;">
        Generated on ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <pre style="font-size: 11px; white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px;">
${JSON.stringify(reportData, null, 2)}
      </pre>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `${reportName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
  };

  html2pdf().set(opt).from(element).save();
};

const exportToExcel = (reportData: Record<string, unknown>[], reportName: string, columns: string[]) => {
  // Convert data to CSV format
  const csvContent = [
    columns.join(","),
    ...reportData.map((row) =>
      columns.map((col) => {
        const value = row[col.toLowerCase().replace(/\s+/g, "_")];
        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${reportName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

/* ─────────────────────── report preview component ─────────────────────── */

function ReportPreview({
  reportType,
  onExportPDF,
  onExportExcel,
}: {
  reportType: ReportType;
  onExportPDF: () => void;
  onExportExcel: () => void;
}) {
  const { products } = useInventoryStore();
  const { invoices } = useInvoicesStore();
  const { contacts } = useContactsStore();
  const { orders } = useSalesStore();

  const reportConfig = reports.find((r) => r.id === reportType);

  // Generate report data based on type
  const reportData = useMemo(() => {
    switch (reportType) {
      case "sales_summary":
        const totalRevenue = invoices
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + i.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return {
          summary: {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            invoicesSent: invoices.filter((i) => i.status === "sent").length,
            invoicesPaid: invoices.filter((i) => i.status === "paid").length,
          },
          byMonth: [
            { month: "Oct 2025", revenue: 12500, orders: 15 },
            { month: "Nov 2025", revenue: 18200, orders: 22 },
            { month: "Dec 2025", revenue: 21800, orders: 28 },
            { month: "Jan 2026", revenue: 16500, orders: 19 },
            { month: "Feb 2026", revenue: totalRevenue, orders: totalOrders },
          ],
        };

      case "inventory_valuation":
        const totalValue = products.reduce(
          (sum, p) => sum + p.cost_price * p.stock_quantity,
          0
        );
        const retailValue = products.reduce(
          (sum, p) => sum + p.sell_price * p.stock_quantity,
          0
        );
        const byCategory = Object.entries(
          products.reduce((acc, p) => {
            const cat = p.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = { count: 0, value: 0, quantity: 0 };
            acc[cat].count++;
            acc[cat].value += p.cost_price * p.stock_quantity;
            acc[cat].quantity += p.stock_quantity;
            return acc;
          }, {} as Record<string, { count: number; value: number; quantity: number }>)
        ).map(([name, data]) => ({ category: name, ...data }));

        return {
          summary: {
            totalProducts: products.length,
            totalUnits: products.reduce((sum, p) => sum + p.stock_quantity, 0),
            costValue: totalValue,
            retailValue,
            potentialProfit: retailValue - totalValue,
          },
          byCategory,
        };

      case "accounts_receivable":
        const outstanding = invoices.filter(
          (i) => i.status === "sent" || i.status === "overdue"
        );
        const totalOutstanding = outstanding.reduce((sum, i) => sum + i.total, 0);
        
        return {
          summary: {
            totalOutstanding,
            overdueAmount: invoices
              .filter((i) => i.status === "overdue")
              .reduce((sum, i) => sum + i.total, 0),
            current: invoices
              .filter((i) => i.status === "sent")
              .reduce((sum, i) => sum + i.total, 0),
            invoiceCount: outstanding.length,
          },
          aging: [
            { period: "Current (0-30 days)", amount: 4500, count: 3 },
            { period: "31-60 days", amount: 2200, count: 2 },
            { period: "61-90 days", amount: 1000, count: 1 },
            { period: "90+ days", amount: 800, count: 1 },
          ],
        };

      case "top_products":
        const productsByMargin = [...products]
          .map((p) => ({
            name: p.name,
            sku: p.sku,
            category: p.category,
            sold: Math.floor(Math.random() * 100) + 10,
            revenue: Math.floor(Math.random() * 5000) + 500,
            margin: ((p.sell_price - p.cost_price) / p.cost_price) * 100,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        return {
          topBySales: productsByMargin,
          topByMargin: [...productsByMargin].sort((a, b) => b.margin - a.margin),
        };

      case "customer_analysis":
        const customers = contacts.filter(
          (c) => c.type === "customer" || c.type === "both"
        );
        return {
          summary: {
            totalCustomers: customers.length,
            newThisMonth: Math.floor(customers.length * 0.15),
            activeCustomers: Math.floor(customers.length * 0.7),
            avgOrdersPerCustomer: 3.2,
          },
          topCustomers: customers.slice(0, 5).map((c) => ({
            name: c.name,
            company: c.company,
            orders: Math.floor(Math.random() * 20) + 1,
            totalSpent: Math.floor(Math.random() * 50000) + 1000,
          })),
        };

      case "profit_loss":
        const revenue = invoices
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + i.total, 0);
        const cogs = products.reduce(
          (sum, p) => sum + p.cost_price * Math.floor(p.stock_quantity * 0.3),
          0
        );
        const expenses = revenue * 0.25;
        const netProfit = revenue - cogs - expenses;

        return {
          summary: {
            revenue,
            cogs,
            grossProfit: revenue - cogs,
            expenses,
            netProfit,
            profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
          },
          breakdown: [
            { category: "Product Sales", amount: revenue * 0.85 },
            { category: "Services", amount: revenue * 0.15 },
            { category: "Cost of Goods", amount: -cogs },
            { category: "Operating Expenses", amount: -expenses * 0.6 },
            { category: "Marketing", amount: -expenses * 0.25 },
            { category: "Other", amount: -expenses * 0.15 },
          ],
        };

      default:
        return {};
    }
  }, [reportType, products, invoices, contacts, orders]);

  if (!reportConfig) return null;

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
      {/* Report Header */}
      <div className="px-6 py-5 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", reportConfig.bgColor)}>
            <reportConfig.icon className={cn("w-5 h-5", reportConfig.color)} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              {reportConfig.name}
            </h2>
            <p className="text-xs text-[#FAFAFA]">
              Generated {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-[#262626] rounded-lg text-xs text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all">
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-[#262626] rounded-lg text-xs text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <div className="w-px h-6 bg-[#0A0A0A]" />
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-6">
        {/* Summary Stats */}
        {reportData.summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(reportData.summary as Record<string, number | undefined>).filter((entry): entry is [string, number] => entry[1] !== undefined).map(([key, value]) => (
              <div
                key={key}
                className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-4"
              >
                <p className="text-xs text-[#FAFAFA] uppercase tracking-wider mb-2">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-xl font-bold text-[#FAFAFA]">
                  {key.toLowerCase().includes("value") ||
                  key.toLowerCase().includes("revenue") ||
                  key.toLowerCase().includes("amount") ||
                  key.toLowerCase().includes("profit") ||
                  key.toLowerCase().includes("cost") ||
                  key.toLowerCase().includes("spent") ||
                  key.toLowerCase().includes("cogs") ||
                  key.toLowerCase().includes("expenses")
                    ? formatCurrency(value)
                    : key.toLowerCase().includes("margin")
                    ? `${value.toFixed(1)}%`
                    : value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Data Tables */}
        {reportData.byMonth && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-3">
              Monthly Breakdown
            </h3>
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Month
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Revenue
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.byMonth as Array<{ month: string; revenue: number; orders: number }>).map((row, i) => (
                    <tr
                      key={row.month}
                      className={cn(
                        "border-b border-[#262626]/50 last:border-0",
                        i % 2 === 1 && "bg-[#0A0A0A]/50"
                      )}
                    >
                      <td className="px-4 py-3 text-sm text-[#FAFAFA]">
                        {row.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {row.orders}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportData.byCategory && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-3">
              By Category
            </h3>
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Category
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Products
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Units
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.byCategory as Array<{ category: string; count: number; quantity: number; value: number }>).map((row, i) => (
                    <tr
                      key={row.category}
                      className={cn(
                        "border-b border-[#262626]/50 last:border-0",
                        i % 2 === 1 && "bg-[#0A0A0A]/50"
                      )}
                    >
                      <td className="px-4 py-3 text-sm text-[#FAFAFA]">
                        {row.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {row.count}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {row.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {formatCurrency(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportData.topBySales && (
          <div>
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-3">
              Top Products by Revenue
            </h3>
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Product
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Units Sold
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Revenue
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.topBySales as Array<{ name: string; sku: string; sold: number; revenue: number; margin: number }>).map((row, i) => (
                    <tr
                      key={row.sku}
                      className={cn(
                        "border-b border-[#262626]/50 last:border-0",
                        i % 2 === 1 && "bg-[#0A0A0A]/50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-[#FAFAFA]">{row.name}</p>
                          <p className="text-xs text-[#FAFAFA] font-mono">{row.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {row.sold}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[#FAFAFA]">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={row.margin > 30 ? "text-emerald-400" : "text-amber-400"}>
                          {row.margin.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ REPORTS PAGE ═══════════════════════ */

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredReports = useMemo(() => {
    if (categoryFilter === "all") return reports;
    return reports.filter((r) => r.category === categoryFilter);
  }, [categoryFilter]);

  const handleExportPDF = async () => {
    if (!selectedReport) return;
    const report = reports.find((r) => r.id === selectedReport);
    if (report) {
      await exportToPDF({ type: selectedReport, generated: new Date().toISOString() }, report.name);
    }
  };

  const handleExportExcel = () => {
    if (!selectedReport) return;
    const report = reports.find((r) => r.id === selectedReport);
    if (report) {
      exportToExcel(
        [{ type: selectedReport, generated: new Date().toISOString() }],
        report.name,
        ["Type", "Generated"]
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Reports
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            Generate and export business reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-[#262626] rounded-lg text-sm text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all">
            <Calendar className="w-4 h-4" />
            This Month
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-[#262626] rounded-lg text-sm text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#FAFAFA] uppercase tracking-wider mr-2">
          Category:
        </span>
        {["all", "sales", "inventory", "finance", "customers"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              categoryFilter === cat
                ? "bg-[#161616] text-[#0A0A0A]"
                : "text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#262626]">
              <h2 className="text-sm font-semibold text-[#FAFAFA]">
                Available Reports
              </h2>
            </div>
            <div className="divide-y divide-[#0A0A0A]/50">
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all",
                    selectedReport === report.id
                      ? "bg-[rgba(156,74,41,0.15)] border-l-2 border-[#262626]"
                      : "hover:bg-[#0A0A0A]"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", report.bgColor)}>
                    <report.icon className={cn("w-4 h-4", report.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAFA]">
                      {report.name}
                    </p>
                    <p className="text-xs text-[#FAFAFA] truncate">
                      {report.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-colors",
                      selectedReport === report.id
                        ? "text-[#FAFAFA]"
                        : "text-[#FAFAFA]"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <ReportPreview
              reportType={selectedReport}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
            />
          ) : (
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl h-[600px] flex flex-col items-center justify-center">
              <div className="p-4 rounded-full bg-[#0A0A0A] mb-4">
                <BarChart3 className="w-10 h-10 text-[#FAFAFA]" />
              </div>
              <p className="text-sm font-medium text-[#FAFAFA] mb-1">
                Select a report
              </p>
              <p className="text-xs text-[#FAFAFA] text-center max-w-xs">
                Choose a report from the list to preview and export
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
