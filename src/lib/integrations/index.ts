/**
 * Atlas ERP Integration Layer
 * 
 * This module provides cross-module integrations that make Atlas
 * work as a unified ERP system rather than isolated modules.
 * 
 * Usage in React components:
 * ```tsx
 * import { useInvoiceAccounting } from '@/lib/integrations';
 * 
 * function PaymentButton({ invoiceId }) {
 *   const { markAsPaid, isProcessing } = useInvoiceAccounting();
 *   return (
 *     <button onClick={() => markAsPaid(invoiceId)}>
 *       Record Payment
 *     </button>
 *   );
 * }
 * ```
 */

// Invoice → Accounting Integration
export {
  createInvoicePaymentEntry,
  createInvoiceSentEntry,
  markInvoiceAsPaidWithAccounting,
  validateJournalEntry,
} from "./invoice-accounting";

// React hook for invoice-accounting integration
export { useInvoiceAccounting } from "./use-invoice-accounting";

// Types for integration events (future event bus)
export type IntegrationEvent =
  | { type: "invoice.paid"; invoiceId: string; journalEntryId: string }
  | { type: "invoice.sent"; invoiceId: string; journalEntryId: string }
  | { type: "salesOrder.confirmed"; orderId: string; stockMovements: string[] }
  | { type: "purchaseOrder.received"; orderId: string; stockMovements: string[] }
  | { type: "payRun.paid"; payRunId: string; journalEntryId: string };

// Integration status tracking
export interface IntegrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  eventType: IntegrationEvent["type"];
  timestamp: string;
}
