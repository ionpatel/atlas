/**
 * React hook for Invoice → Accounting integration
 * 
 * Provides a clean interface for marking invoices as paid
 * with automatic journal entry creation.
 */

import { useState, useCallback } from "react";
import { useInvoicesStore } from "@/stores/invoices-store";
import { useAccountingStore } from "@/stores/accounting-store";
import { 
  markInvoiceAsPaidWithAccounting, 
  createInvoiceSentEntry 
} from "./invoice-accounting";
import type { Invoice, JournalEntry } from "@/types";

interface UseInvoiceAccountingReturn {
  /**
   * Mark an invoice as paid and create the corresponding journal entry
   */
  markAsPaid: (invoiceId: string) => Promise<{
    invoice: Invoice;
    journalEntry: JournalEntry;
  } | null>;
  
  /**
   * Record an invoice as sent (creates A/R entry)
   */
  recordSent: (invoiceId: string) => JournalEntry | null;
  
  /**
   * Whether an integration operation is in progress
   */
  isProcessing: boolean;
  
  /**
   * Last error message, if any
   */
  error: string | null;
  
  /**
   * Get journal entries related to a specific invoice
   */
  getInvoiceJournalEntries: (invoiceId: string) => JournalEntry[];
}

export function useInvoiceAccounting(): UseInvoiceAccountingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const invoices = useInvoicesStore((s) => s.invoices);
  const journalEntries = useAccountingStore((s) => s.journalEntries);

  const markAsPaid = useCallback(async (invoiceId: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = markInvoiceAsPaidWithAccounting(invoiceId);
      
      if (!result) {
        setError("Failed to mark invoice as paid");
        return null;
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const recordSent = useCallback((invoiceId: string) => {
    setError(null);
    
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) {
      setError(`Invoice ${invoiceId} not found`);
      return null;
    }
    
    try {
      return createInvoiceSentEntry(invoice);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    }
  }, [invoices]);

  const getInvoiceJournalEntries = useCallback((invoiceId: string) => {
    // Find entries that reference this invoice
    return journalEntries.filter((entry) => 
      entry.id.includes(invoiceId) || 
      entry.description.toLowerCase().includes(invoiceId.toLowerCase())
    );
  }, [journalEntries]);

  return {
    markAsPaid,
    recordSent,
    isProcessing,
    error,
    getInvoiceJournalEntries,
  };
}
