/**
 * AI Insights Engine
 * Analyzes business data and surfaces actionable insights
 */

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'alert' | 'opportunity' | 'prediction';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  metric?: {
    value: number;
    change: number;
    changeType: 'increase' | 'decrease';
    period: string;
  };
  action?: {
    label: string;
    href: string;
  };
  createdAt: Date;
}

export interface SalesData {
  date: string;
  amount: number;
  count: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  reorder_level: number;
  price: number;
  avg_daily_sales?: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  customer_name: string;
}

// Calculate percentage change
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Calculate moving average
function movingAverage(data: number[], window: number): number {
  if (data.length < window) return data.reduce((a, b) => a + b, 0) / data.length;
  const slice = data.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / window;
}

// Detect anomalies using z-score
function detectAnomaly(value: number, data: number[]): boolean {
  if (data.length < 5) return false;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return false;
  const zScore = Math.abs((value - mean) / stdDev);
  return zScore > 2; // More than 2 standard deviations
}

// Generate sales insights
export function analyzeSales(
  currentWeek: SalesData[],
  previousWeek: SalesData[]
): Insight[] {
  const insights: Insight[] = [];
  
  const currentTotal = currentWeek.reduce((sum, d) => sum + d.amount, 0);
  const previousTotal = previousWeek.reduce((sum, d) => sum + d.amount, 0);
  const change = percentChange(currentTotal, previousTotal);
  
  // Sales trend
  if (Math.abs(change) >= 10) {
    insights.push({
      id: `sales-trend-${Date.now()}`,
      type: 'trend',
      severity: change > 0 ? 'success' : 'warning',
      title: change > 0 ? 'Sales are up!' : 'Sales are down',
      description: `Sales ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last week`,
      metric: {
        value: currentTotal,
        change: Math.abs(change),
        changeType: change > 0 ? 'increase' : 'decrease',
        period: 'vs last week'
      },
      action: {
        label: 'View Sales Report',
        href: '/reports?type=sales'
      },
      createdAt: new Date()
    });
  }
  
  // Best day detection
  const bestDay = currentWeek.reduce((best, day) => 
    day.amount > best.amount ? day : best
  , currentWeek[0]);
  
  if (bestDay && bestDay.amount > currentTotal * 0.3) {
    const dayName = new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long' });
    insights.push({
      id: `best-day-${Date.now()}`,
      type: 'opportunity',
      severity: 'info',
      title: `${dayName} is your best sales day`,
      description: `${dayName} accounted for ${((bestDay.amount / currentTotal) * 100).toFixed(0)}% of this week's sales`,
      createdAt: new Date()
    });
  }
  
  return insights;
}

// Generate inventory insights
export function analyzeInventory(items: InventoryItem[]): Insight[] {
  const insights: Insight[] = [];
  
  // Critical low stock
  const criticalItems = items.filter(item => 
    item.quantity <= item.reorder_level * 0.5 && item.quantity > 0
  );
  
  if (criticalItems.length > 0) {
    insights.push({
      id: `critical-stock-${Date.now()}`,
      type: 'alert',
      severity: 'critical',
      title: `${criticalItems.length} items critically low`,
      description: criticalItems.slice(0, 3).map(i => i.name).join(', ') + 
        (criticalItems.length > 3 ? ` and ${criticalItems.length - 3} more` : ''),
      action: {
        label: 'Reorder Now',
        href: '/inventory?filter=low-stock'
      },
      createdAt: new Date()
    });
  }
  
  // Out of stock
  const outOfStock = items.filter(item => item.quantity === 0);
  if (outOfStock.length > 0) {
    insights.push({
      id: `out-of-stock-${Date.now()}`,
      type: 'alert',
      severity: 'critical',
      title: `${outOfStock.length} items out of stock`,
      description: outOfStock.slice(0, 3).map(i => i.name).join(', ') +
        (outOfStock.length > 3 ? ` and ${outOfStock.length - 3} more` : ''),
      action: {
        label: 'View Out of Stock',
        href: '/inventory?filter=out-of-stock'
      },
      createdAt: new Date()
    });
  }
  
  // Overstock detection (items with high quantity but low sales)
  const overstocked = items.filter(item => 
    item.avg_daily_sales !== undefined && 
    item.avg_daily_sales > 0 &&
    item.quantity > item.avg_daily_sales * 90 // More than 90 days of stock
  );
  
  if (overstocked.length > 0) {
    const totalValue = overstocked.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    insights.push({
      id: `overstock-${Date.now()}`,
      type: 'opportunity',
      severity: 'info',
      title: `$${totalValue.toLocaleString()} tied up in slow-moving inventory`,
      description: `${overstocked.length} items have more than 90 days of stock. Consider running promotions.`,
      action: {
        label: 'View Slow Movers',
        href: '/inventory?sort=velocity&order=asc'
      },
      createdAt: new Date()
    });
  }
  
  return insights;
}

// Generate invoice insights
export function analyzeInvoices(invoices: Invoice[]): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  
  // Overdue invoices
  const overdue = invoices.filter(inv => {
    const dueDate = new Date(inv.due_date);
    return inv.status !== 'paid' && dueDate < now;
  });
  
  if (overdue.length > 0) {
    const totalOverdue = overdue.reduce((sum, inv) => sum + inv.amount, 0);
    insights.push({
      id: `overdue-invoices-${Date.now()}`,
      type: 'alert',
      severity: 'warning',
      title: `${overdue.length} invoices overdue`,
      description: `Total of $${totalOverdue.toLocaleString()} is past due`,
      metric: {
        value: totalOverdue,
        change: overdue.length,
        changeType: 'increase',
        period: 'overdue'
      },
      action: {
        label: 'Send Reminders',
        href: '/invoices?filter=overdue'
      },
      createdAt: new Date()
    });
  }
  
  // Due soon (next 7 days)
  const dueSoon = invoices.filter(inv => {
    const dueDate = new Date(inv.due_date);
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return inv.status !== 'paid' && daysUntilDue > 0 && daysUntilDue <= 7;
  });
  
  if (dueSoon.length > 0) {
    const totalDueSoon = dueSoon.reduce((sum, inv) => sum + inv.amount, 0);
    insights.push({
      id: `due-soon-${Date.now()}`,
      type: 'alert',
      severity: 'info',
      title: `$${totalDueSoon.toLocaleString()} due in the next 7 days`,
      description: `${dueSoon.length} invoices coming due soon`,
      action: {
        label: 'View Upcoming',
        href: '/invoices?filter=due-soon'
      },
      createdAt: new Date()
    });
  }
  
  return insights;
}

// Inventory forecasting
export interface ForecastResult {
  productId: string;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  suggestedReorderQty: number;
  suggestedReorderDate: Date;
  confidence: 'high' | 'medium' | 'low';
}

export function forecastInventory(
  items: InventoryItem[],
  salesHistory: { productId: string; date: string; quantity: number }[],
  leadTimeDays: number = 7
): ForecastResult[] {
  const forecasts: ForecastResult[] = [];
  
  for (const item of items) {
    // Get sales for this product in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const productSales = salesHistory.filter(s => 
      s.productId === item.id && 
      new Date(s.date) >= thirtyDaysAgo
    );
    
    if (productSales.length === 0) continue;
    
    // Calculate average daily sales
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const avgDailySales = totalSold / 30;
    
    if (avgDailySales <= 0) continue;
    
    // Days until stockout
    const daysUntilStockout = item.quantity / avgDailySales;
    
    // Suggested reorder date (accounting for lead time)
    const reorderDate = new Date();
    reorderDate.setDate(reorderDate.getDate() + Math.max(0, daysUntilStockout - leadTimeDays));
    
    // Suggested quantity (enough for 30 days + lead time buffer)
    const suggestedQty = Math.ceil(avgDailySales * (30 + leadTimeDays));
    
    // Confidence based on data volume
    const confidence = productSales.length >= 20 ? 'high' : 
                       productSales.length >= 10 ? 'medium' : 'low';
    
    forecasts.push({
      productId: item.id,
      productName: item.name,
      currentStock: item.quantity,
      avgDailySales,
      daysUntilStockout: Math.round(daysUntilStockout),
      suggestedReorderQty: suggestedQty,
      suggestedReorderDate: reorderDate,
      confidence
    });
  }
  
  // Sort by urgency (days until stockout)
  return forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

// Natural language query parser for smart search
export interface ParsedQuery {
  intent: 'list' | 'count' | 'sum' | 'filter' | 'search';
  entity: 'invoices' | 'products' | 'contacts' | 'sales' | 'employees' | 'orders';
  filters: {
    field: string;
    operator: 'equals' | 'gt' | 'lt' | 'contains' | 'between';
    value: string | number | [number, number];
  }[];
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

const ENTITY_KEYWORDS: Record<string, ParsedQuery['entity']> = {
  'invoice': 'invoices', 'invoices': 'invoices', 'bills': 'invoices',
  'product': 'products', 'products': 'products', 'item': 'products', 'items': 'products', 'inventory': 'products',
  'contact': 'contacts', 'contacts': 'contacts', 'customer': 'contacts', 'customers': 'contacts', 'vendor': 'contacts', 'vendors': 'contacts',
  'sale': 'sales', 'sales': 'sales', 'order': 'orders', 'orders': 'orders',
  'employee': 'employees', 'employees': 'employees', 'staff': 'employees', 'team': 'employees'
};

const STATUS_KEYWORDS = ['overdue', 'pending', 'paid', 'draft', 'sent', 'active', 'inactive', 'low stock', 'out of stock'];

export function parseNaturalQuery(query: string): ParsedQuery | null {
  const lowerQuery = query.toLowerCase().trim();
  
  // Detect entity
  let entity: ParsedQuery['entity'] = 'products';
  for (const [keyword, entityType] of Object.entries(ENTITY_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      entity = entityType;
      break;
    }
  }
  
  // Detect intent
  let intent: ParsedQuery['intent'] = 'list';
  if (lowerQuery.startsWith('how many') || lowerQuery.startsWith('count')) {
    intent = 'count';
  } else if (lowerQuery.startsWith('total') || lowerQuery.includes('sum of')) {
    intent = 'sum';
  } else if (lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('find')) {
    intent = 'list';
  }
  
  // Parse filters
  const filters: ParsedQuery['filters'] = [];
  
  // Status filters
  for (const status of STATUS_KEYWORDS) {
    if (lowerQuery.includes(status)) {
      filters.push({
        field: 'status',
        operator: 'equals',
        value: status.replace(' ', '_')
      });
    }
  }
  
  // Price/amount filters
  const underMatch = lowerQuery.match(/under \$?(\d+)/);
  if (underMatch) {
    filters.push({
      field: entity === 'invoices' ? 'amount' : 'price',
      operator: 'lt',
      value: parseInt(underMatch[1])
    });
  }
  
  const overMatch = lowerQuery.match(/over \$?(\d+)/);
  if (overMatch) {
    filters.push({
      field: entity === 'invoices' ? 'amount' : 'price',
      operator: 'gt',
      value: parseInt(overMatch[1])
    });
  }
  
  // "who bought X" pattern
  const whoBoughtMatch = lowerQuery.match(/who bought (.+)/);
  if (whoBoughtMatch) {
    return {
      intent: 'list',
      entity: 'contacts',
      filters: [{
        field: 'purchased_product',
        operator: 'contains',
        value: whoBoughtMatch[1].trim()
      }]
    };
  }
  
  // Limit detection
  let limit: number | undefined;
  const limitMatch = lowerQuery.match(/top (\d+)|first (\d+)|(\d+) (items|results)/);
  if (limitMatch) {
    limit = parseInt(limitMatch[1] || limitMatch[2] || limitMatch[3]);
  }
  
  return {
    intent,
    entity,
    filters,
    limit
  };
}
