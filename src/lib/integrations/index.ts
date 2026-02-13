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
 * Usage in React components:
 * ```tsx
 * import { useInvoiceAccounting, useSalesInventory } from '@/lib/integrations';
 * 
 * function OrderActions({ orderId, orderLines }) {
 *   const { confirmOrder, checkStock, lowStockAlerts } = useSalesInventory();
 *   const { markAsPaid } = useInvoiceAccounting();
 * 
 *   // Check stock before confirming
 *   const stockCheck = checkStock(orderLines);
 *   if (!stockCheck.available) {
 *     // Show shortage warning
 *   }
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

// ===== Types for integration events (future event bus) =====
export type IntegrationEvent =
  | { type: "invoice.paid"; invoiceId: string; journalEntryId: string }
  | { type: "invoice.sent"; invoiceId: string; journalEntryId: string }
  | { type: "salesOrder.confirmed"; orderId: string; stockMovements: string[] }
  | { type: "salesOrder.cancelled"; orderId: string }
  | { type: "purchaseOrder.received"; orderId: string; stockMovements: string[] }
  | { type: "payRun.paid"; payRunId: string; journalEntryId: string }
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
