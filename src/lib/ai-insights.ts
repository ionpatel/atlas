/**
 * Atlas ERP - AI Insights Engine
 * 
 * Analyzes business data to surface actionable insights,
 * detect anomalies, and predict trends.
 */

// Types
export interface Insight {
  id: string;
  type: InsightType;
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  description: string;
  metric?: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  action?: {
    label: string;
    href: string;
  };
  createdAt: string;
  expiresAt?: string;
}

export type InsightType =
  | "sales_trend"
  | "inventory_alert"
  | "revenue_change"
  | "customer_churn"
  | "payment_overdue"
  | "expense_spike"
  | "product_performance"
  | "seasonal_pattern"
  | "anomaly_detected"
  | "goal_progress";

export interface InventoryForecast {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  recommendedReorderDate: string;
  recommendedQuantity: number;
  confidence: number;
}

export interface SalesForecast {
  period: string;
  predictedRevenue: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  factors: string[];
}

// Insight templates
const INSIGHT_TEMPLATES = {
  sales_up: (percent: number, period: string) => ({
    type: "sales_trend" as InsightType,
    severity: "success" as const,
    title: `Sales up ${percent.toFixed(1)}%`,
    description: `Your sales have increased by ${percent.toFixed(1)}% compared to ${period}. Great momentum!`,
  }),
  sales_down: (percent: number, period: string) => ({
    type: "sales_trend" as InsightType,
    severity: "warning" as const,
    title: `Sales down ${Math.abs(percent).toFixed(1)}%`,
    description: `Sales have decreased by ${Math.abs(percent).toFixed(1)}% compared to ${period}. Consider running a promotion.`,
  }),
  low_stock: (count: number) => ({
    type: "inventory_alert" as InsightType,
    severity: "warning" as const,
    title: `${count} products low on stock`,
    description: `${count} products are below their minimum stock level and need to be reordered soon.`,
    action: { label: "View Products", href: "/inventory?filter=low_stock" },
  }),
  out_of_stock: (count: number) => ({
    type: "inventory_alert" as InsightType,
    severity: "critical" as const,
    title: `${count} products out of stock`,
    description: `${count} products are completely out of stock. Customers may be unable to complete purchases.`,
    action: { label: "Reorder Now", href: "/inventory?filter=out_of_stock" },
  }),
  overdue_invoices: (count: number, total: number) => ({
    type: "payment_overdue" as InsightType,
    severity: "warning" as const,
    title: `${count} overdue invoices`,
    description: `You have ${count} overdue invoices totaling $${total.toLocaleString()}. Consider sending reminders.`,
    action: { label: "View Overdue", href: "/invoices?status=overdue" },
  }),
  top_product: (name: string, sales: number) => ({
    type: "product_performance" as InsightType,
    severity: "success" as const,
    title: `${name} is your top seller`,
    description: `${name} has generated ${sales} sales this month, outperforming other products.`,
  }),
  expense_increase: (percent: number, category: string) => ({
    type: "expense_spike" as InsightType,
    severity: "warning" as const,
    title: `${category} expenses up ${percent.toFixed(1)}%`,
    description: `Your ${category.toLowerCase()} expenses have increased significantly. Review recent transactions.`,
    action: { label: "View Expenses", href: "/accounting?tab=expenses" },
  }),
  seasonal_opportunity: (season: string, suggestion: string) => ({
    type: "seasonal_pattern" as InsightType,
    severity: "info" as const,
    title: `${season} opportunity detected`,
    description: suggestion,
  }),
};

/**
 * Generate AI insights from business data
 */
export function generateInsights(data: {
  salesThisWeek: number;
  salesLastWeek: number;
  salesThisMonth: number;
  salesLastMonth: number;
  lowStockCount: number;
  outOfStockCount: number;
  overdueInvoices: number;
  overdueAmount: number;
  topProduct?: { name: string; sales: number };
  expensesByCategory?: Record<string, { current: number; previous: number }>;
}): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();

  // Weekly sales trend
  if (data.salesLastWeek > 0) {
    const weeklyChange = ((data.salesThisWeek - data.salesLastWeek) / data.salesLastWeek) * 100;
    if (Math.abs(weeklyChange) >= 5) {
      const template = weeklyChange > 0
        ? INSIGHT_TEMPLATES.sales_up(weeklyChange, "last week")
        : INSIGHT_TEMPLATES.sales_down(weeklyChange, "last week");
      
      insights.push({
        id: `sales-weekly-${now.getTime()}`,
        ...template,
        metric: {
          current: data.salesThisWeek,
          previous: data.salesLastWeek,
          change: data.salesThisWeek - data.salesLastWeek,
          changePercent: weeklyChange,
        },
        createdAt: now.toISOString(),
      });
    }
  }

  // Monthly sales trend
  if (data.salesLastMonth > 0) {
    const monthlyChange = ((data.salesThisMonth - data.salesLastMonth) / data.salesLastMonth) * 100;
    if (Math.abs(monthlyChange) >= 10) {
      const template = monthlyChange > 0
        ? INSIGHT_TEMPLATES.sales_up(monthlyChange, "last month")
        : INSIGHT_TEMPLATES.sales_down(monthlyChange, "last month");
      
      insights.push({
        id: `sales-monthly-${now.getTime()}`,
        ...template,
        metric: {
          current: data.salesThisMonth,
          previous: data.salesLastMonth,
          change: data.salesThisMonth - data.salesLastMonth,
          changePercent: monthlyChange,
        },
        createdAt: now.toISOString(),
      });
    }
  }

  // Inventory alerts
  if (data.outOfStockCount > 0) {
    insights.push({
      id: `out-of-stock-${now.getTime()}`,
      ...INSIGHT_TEMPLATES.out_of_stock(data.outOfStockCount),
      createdAt: now.toISOString(),
    });
  }

  if (data.lowStockCount > 0) {
    insights.push({
      id: `low-stock-${now.getTime()}`,
      ...INSIGHT_TEMPLATES.low_stock(data.lowStockCount),
      createdAt: now.toISOString(),
    });
  }

  // Overdue invoices
  if (data.overdueInvoices > 0) {
    insights.push({
      id: `overdue-${now.getTime()}`,
      ...INSIGHT_TEMPLATES.overdue_invoices(data.overdueInvoices, data.overdueAmount),
      createdAt: now.toISOString(),
    });
  }

  // Top product
  if (data.topProduct && data.topProduct.sales > 10) {
    insights.push({
      id: `top-product-${now.getTime()}`,
      ...INSIGHT_TEMPLATES.top_product(data.topProduct.name, data.topProduct.sales),
      createdAt: now.toISOString(),
    });
  }

  // Expense spikes
  if (data.expensesByCategory) {
    for (const [category, amounts] of Object.entries(data.expensesByCategory)) {
      if (amounts.previous > 0) {
        const change = ((amounts.current - amounts.previous) / amounts.previous) * 100;
        if (change >= 25) {
          insights.push({
            id: `expense-${category}-${now.getTime()}`,
            ...INSIGHT_TEMPLATES.expense_increase(change, category),
            metric: {
              current: amounts.current,
              previous: amounts.previous,
              change: amounts.current - amounts.previous,
              changePercent: change,
            },
            createdAt: now.toISOString(),
          });
        }
      }
    }
  }

  // Seasonal patterns
  const month = now.getMonth();
  if (month === 10 || month === 11) { // Nov/Dec
    insights.push({
      id: `seasonal-holiday-${now.getTime()}`,
      ...INSIGHT_TEMPLATES.seasonal_opportunity(
        "Holiday season",
        "Holiday shopping season is here. Consider increasing inventory for popular items and running promotions."
      ),
      createdAt: now.toISOString(),
    });
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, success: 2, info: 3 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return insights;
}

/**
 * Generate inventory forecasts based on sales velocity
 */
export function generateInventoryForecasts(products: {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  salesLast30Days: number;
  salesLast7Days: number;
}[]): InventoryForecast[] {
  const forecasts: InventoryForecast[] = [];
  const now = new Date();

  for (const product of products) {
    // Calculate average daily sales (weighted recent sales higher)
    const dailySales30 = product.salesLast30Days / 30;
    const dailySales7 = product.salesLast7Days / 7;
    const avgDailySales = (dailySales7 * 0.6 + dailySales30 * 0.4); // Weight recent higher

    if (avgDailySales <= 0) continue;

    // Days until stockout
    const daysUntilStockout = product.currentStock / avgDailySales;

    // Only forecast products that will run out within 60 days
    if (daysUntilStockout > 60) continue;

    // Recommended reorder date (7 days before stockout, minimum today)
    const reorderDays = Math.max(0, Math.floor(daysUntilStockout) - 7);
    const reorderDate = new Date(now);
    reorderDate.setDate(reorderDate.getDate() + reorderDays);

    // Recommended quantity (30 days of stock + safety buffer)
    const recommendedQuantity = Math.ceil(avgDailySales * 30 * 1.2);

    // Confidence based on data consistency
    const salesVariance = Math.abs(dailySales7 - dailySales30) / Math.max(dailySales7, dailySales30);
    const confidence = Math.max(0.5, 1 - salesVariance);

    forecasts.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.currentStock,
      minStock: product.minStock,
      avgDailySales: Math.round(avgDailySales * 10) / 10,
      daysUntilStockout: Math.round(daysUntilStockout),
      recommendedReorderDate: reorderDate.toISOString().split("T")[0],
      recommendedQuantity,
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  // Sort by days until stockout
  forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

  return forecasts;
}

/**
 * Generate sales forecasts using simple trend analysis
 */
export function generateSalesForecasts(
  historicalSales: { date: string; amount: number }[],
  periods: number = 4
): SalesForecast[] {
  if (historicalSales.length < 4) {
    return [];
  }

  const forecasts: SalesForecast[] = [];
  
  // Group by week
  const weeklySales: number[] = [];
  let weekTotal = 0;
  let dayCount = 0;
  
  for (const sale of historicalSales) {
    weekTotal += sale.amount;
    dayCount++;
    
    if (dayCount === 7) {
      weeklySales.push(weekTotal);
      weekTotal = 0;
      dayCount = 0;
    }
  }

  if (weeklySales.length < 2) return [];

  // Calculate trend
  const recentAvg = weeklySales.slice(-4).reduce((a, b) => a + b, 0) / Math.min(4, weeklySales.length);
  const olderAvg = weeklySales.slice(0, -4).reduce((a, b) => a + b, 0) / Math.max(1, weeklySales.length - 4) || recentAvg;
  const weeklyGrowth = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;

  // Generate forecasts
  const lastDate = new Date(historicalSales[historicalSales.length - 1].date);
  let currentPrediction = recentAvg;

  for (let i = 1; i <= periods; i++) {
    const periodStart = new Date(lastDate);
    periodStart.setDate(periodStart.getDate() + (i - 1) * 7);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 6);

    // Apply growth
    currentPrediction *= (1 + weeklyGrowth * 0.5); // Dampen growth for safety

    // Calculate bounds (wider as we go further out)
    const uncertainty = 0.1 + (i * 0.05);
    const lowerBound = currentPrediction * (1 - uncertainty);
    const upperBound = currentPrediction * (1 + uncertainty);

    // Confidence decreases over time
    const confidence = Math.max(0.5, 0.9 - (i * 0.1));

    forecasts.push({
      period: `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`,
      predictedRevenue: Math.round(currentPrediction),
      lowerBound: Math.round(lowerBound),
      upperBound: Math.round(upperBound),
      confidence: Math.round(confidence * 100) / 100,
      factors: [
        weeklyGrowth > 0 ? "Positive trend" : "Stable trend",
        "Historical average",
        i > 2 ? "Increased uncertainty" : "Recent data",
      ],
    });
  }

  return forecasts;
}

/**
 * Get mock insights for demo
 */
export function getMockInsights(): Insight[] {
  return generateInsights({
    salesThisWeek: 12500,
    salesLastWeek: 10800,
    salesThisMonth: 48000,
    salesLastMonth: 52000,
    lowStockCount: 5,
    outOfStockCount: 2,
    overdueInvoices: 3,
    overdueAmount: 4500,
    topProduct: { name: "Premium Widget", sales: 145 },
    expensesByCategory: {
      Shipping: { current: 2400, previous: 1800 },
    },
  });
}

/**
 * Get mock inventory forecasts for demo
 */
export function getMockInventoryForecasts(): InventoryForecast[] {
  return generateInventoryForecasts([
    { id: "1", name: "Premium Widget", sku: "WDG-001", currentStock: 25, minStock: 20, salesLast30Days: 45, salesLast7Days: 12 },
    { id: "2", name: "Basic Widget", sku: "WDG-002", currentStock: 8, minStock: 15, salesLast30Days: 30, salesLast7Days: 8 },
    { id: "3", name: "Deluxe Package", sku: "PKG-001", currentStock: 15, minStock: 10, salesLast30Days: 20, salesLast7Days: 6 },
    { id: "4", name: "Accessory Kit", sku: "ACC-001", currentStock: 50, minStock: 25, salesLast30Days: 60, salesLast7Days: 18 },
  ]);
}
