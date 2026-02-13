/**
 * Atlas ERP Integration Layer
 * 
 * This module provides cross-module integrations that make Atlas
 * work as a unified ERP system rather than isolated modules.
 * 
 * Available Integrations:
 * 
 * 1. Invoice → Accounting
 *    - Auto-creates journal entries when invoices are paid
 *    - Updates Cash, Accounts Receivable, and HST Payable
 * 
 * 2. Sales → Inventory
 *    - Auto-reduces stock when sales orders are confirmed
 *    - Creates stock movements for audit trail
 *    - Creates COGS (Cost of Goods Sold) journal entries
 * 
 * 3. Payroll → Accounting
 *    - Auto-creates journal entries when pay runs are paid
 *    - Records salary expense, employer taxes (CPP, EI)
 *    - Tracks source deduction liabilities (CRA remittance)
 *    - Canadian-compliant (CPP, EI, federal/provincial tax)
 * 
 * Usage in React components:
 * ```tsx
 * import { 
 *   useInvoiceAccounting, 
 *   useSalesInventory,
 *   usePayrollAccounting 
 * } from '@/lib/integrations';
 * 
 * function PayrollPage() {
 *   const { processPayment, pendingRemittance } = usePayrollAccounting();
 *   const { confirmOrder, lowStockAlerts } = useSalesInventory();
 *   const { markAsPaid } = useInvoiceAccounting();
 * }
 * ```
 */

// ===== Invoice → Accounting Integration =====
export {
  createInvoicePaymentEntry,
  createInvoiceSentEntry,
  markInvoiceAsPaidWithAccounting,
  validateJournalEntry,
} from "./invoice-accounting";

export { useInvoiceAccounting } from "./use-invoice-accounting";

// ===== Sales → Inventory Integration =====
export {
  processSalesOrderConfirmation,
  reverseSalesOrder,
  checkStockAvailability,
  getLowStockAlerts,
  type SalesInventoryResult,
} from "./sales-inventory";

export { useSalesInventory } from "./use-sales-inventory";

// ===== Payroll → Accounting Integration =====
export {
  processPayrollPayment,
  createRemittancePaymentEntry,
  getPendingRemittance,
  calculatePayrollSummary,
  ensurePayrollAccounts,
  type PayrollAccountingResult,
  type PayrollSummary,
} from "./payroll-accounting";

export { usePayrollAccounting } from "./use-payroll-accounting";

// ===== Types for integration events (future event bus) =====
export type IntegrationEvent =
  | { type: "invoice.paid"; invoiceId: string; journalEntryId: string }
  | { type: "invoice.sent"; invoiceId: string; journalEntryId: string }
  | { type: "salesOrder.confirmed"; orderId: string; stockMovements: string[] }
  | { type: "salesOrder.cancelled"; orderId: string }
  | { type: "purchaseOrder.received"; orderId: string; stockMovements: string[] }
  | { type: "payRun.paid"; payRunId: string; journalEntryId: string }
  | { type: "payRun.remittance"; amount: number; period: string }
  | { type: "inventory.lowStock"; productId: string; currentStock: number; minStock: number };

// ===== Integration status tracking =====
export interface IntegrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  eventType: IntegrationEvent["type"];
  timestamp: string;
}

// ===== Integration utilities =====

/**
 * Format currency for Canadian businesses
 */
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

/**
 * Calculate HST amount (13% for Ontario)
 */
export function calculateHST(subtotal: number, province: string = "ON"): number {
  const rates: Record<string, number> = {
    ON: 0.13,  // Ontario HST
    BC: 0.12,  // BC PST + GST
    AB: 0.05,  // Alberta GST only
    QC: 0.14975, // Quebec QST + GST
    NS: 0.15,  // Nova Scotia HST
    NB: 0.15,  // New Brunswick HST
    NL: 0.15,  // Newfoundland HST
    PE: 0.15,  // PEI HST
    MB: 0.12,  // Manitoba PST + GST
    SK: 0.11,  // Saskatchewan PST + GST
    NT: 0.05,  // NWT GST only
    NU: 0.05,  // Nunavut GST only
    YT: 0.05,  // Yukon GST only
  };
  
  const rate = rates[province] || 0.13;
  return Math.round(subtotal * rate * 100) / 100;
}

/**
 * Format date for Canadian business documents
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Calculate Canadian fiscal quarter
 */
export function getFiscalQuarter(date: Date = new Date()): {
  quarter: 1 | 2 | 3 | 4;
  start: Date;
  end: Date;
  label: string;
} {
  const month = date.getMonth();
  const year = date.getFullYear();
  
  let quarter: 1 | 2 | 3 | 4;
  let start: Date;
  let end: Date;
  
  if (month < 3) {
    quarter = 1;
    start = new Date(year, 0, 1);
    end = new Date(year, 2, 31);
  } else if (month < 6) {
    quarter = 2;
    start = new Date(year, 3, 1);
    end = new Date(year, 5, 30);
  } else if (month < 9) {
    quarter = 3;
    start = new Date(year, 6, 1);
    end = new Date(year, 8, 30);
  } else {
    quarter = 4;
    start = new Date(year, 9, 1);
    end = new Date(year, 11, 31);
  }
  
  return {
    quarter,
    start,
    end,
    label: `Q${quarter} ${year}`,
  };
}
