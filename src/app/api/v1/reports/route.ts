import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "summary";
  const from = searchParams.get("from") || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];

  const reports: Record<string, any> = {
    summary: {
      type: "summary",
      period: { from, to },
      data: {
        revenue: { total: 47250, change: 10.4, trend: "up" },
        expenses: { total: 28500, change: 5.2, trend: "up" },
        profit: { total: 18750, margin: 39.7 },
        orders: { total: 156, change: 9.9, trend: "up" },
        customers: { active: 89, new: 12 },
        inventory: { totalItems: 245, lowStock: 7, outOfStock: 2 },
        invoices: { open: 23, overdue: 4, overdueAmount: 12450 },
        cashFlow: { inflow: 52300, outflow: 33550, net: 18750 },
      },
    },
    "profit-loss": {
      type: "profit-loss",
      period: { from, to },
      data: {
        revenue: [
          { category: "Product Sales", amount: 38200 },
          { category: "Service Revenue", amount: 7050 },
          { category: "Other Income", amount: 2000 },
        ],
        expenses: [
          { category: "Cost of Goods Sold", amount: 18460 },
          { category: "Salaries & Wages", amount: 5200 },
          { category: "Rent & Utilities", amount: 2400 },
          { category: "Marketing", amount: 1200 },
          { category: "Software & Tools", amount: 640 },
          { category: "Other Expenses", amount: 600 },
        ],
        totalRevenue: 47250,
        totalExpenses: 28500,
        netProfit: 18750,
        profitMargin: 39.7,
      },
    },
    "balance-sheet": {
      type: "balance-sheet",
      asOf: to,
      data: {
        assets: {
          current: [
            { name: "Cash & Bank", amount: 45200 },
            { name: "Accounts Receivable", amount: 34500 },
            { name: "Inventory", amount: 28300 },
            { name: "Prepaid Expenses", amount: 3200 },
          ],
          fixed: [
            { name: "Equipment", amount: 15000 },
            { name: "Less: Depreciation", amount: -3000 },
          ],
          totalAssets: 123200,
        },
        liabilities: {
          current: [
            { name: "Accounts Payable", amount: 12800 },
            { name: "GST/HST Payable", amount: 4200 },
            { name: "Wages Payable", amount: 5200 },
          ],
          longTerm: [
            { name: "Line of Credit", amount: 10000 },
          ],
          totalLiabilities: 32200,
        },
        equity: {
          items: [
            { name: "Owner's Equity", amount: 72250 },
            { name: "Retained Earnings", amount: 18750 },
          ],
          totalEquity: 91000,
        },
      },
    },
    "cash-flow": {
      type: "cash-flow",
      period: { from, to },
      data: {
        operating: {
          items: [
            { name: "Receipts from Customers", amount: 52300 },
            { name: "Payments to Suppliers", amount: -22100 },
            { name: "Payments to Employees", amount: -5200 },
            { name: "Other Operating", amount: -2250 },
          ],
          total: 22750,
        },
        investing: {
          items: [
            { name: "Equipment Purchases", amount: -3000 },
            { name: "Software Licenses", amount: -640 },
          ],
          total: -3640,
        },
        financing: {
          items: [
            { name: "Owner Withdrawals", amount: -5000 },
          ],
          total: -5000,
        },
        netChange: 14110,
        openingBalance: 31090,
        closingBalance: 45200,
      },
    },
    "tax-summary": {
      type: "tax-summary",
      period: { from, to },
      data: {
        gst_hst: {
          collected: 6142.50,
          paid: 3705.00,
          netOwing: 2437.50,
          rate: 13,
          province: "Ontario",
        },
        payroll: {
          cpp: { employee: 312.50, employer: 312.50 },
          ei: { employee: 156.25, employer: 218.75 },
          incomeTax: 1025.00,
          totalRemittance: 2025.00,
        },
        filingDeadlines: [
          { name: "GST/HST Return", due: "2026-03-31", status: "upcoming" },
          { name: "Payroll Remittance", due: "2026-03-15", status: "upcoming" },
          { name: "T4 Filing", due: "2026-02-28", status: "due_soon" },
        ],
      },
    },
  };

  const report = reports[type] || reports.summary;
  return NextResponse.json({ data: report }, { headers: CORS });
}
