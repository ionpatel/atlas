/**
 * Invoice → Accounting Integration
 * 
 * When an invoice is marked as "paid", this creates the corresponding
 * journal entry in the accounting system:
 * 
 *   Debit:  Cash (1000)              - Full payment amount
 *   Credit: Accounts Receivable (1100) - Invoice subtotal
 *   Credit: GST/HST Payable (2100)     - Tax collected
 * 
 * This properly recognizes the cash receipt and clears the receivable.
 */

import type { Invoice, JournalEntry, JournalLine } from "@/types";
import { useAccountingStore } from "@/stores/accounting-store";
import { useInvoicesStore } from "@/stores/invoices-store";

// Standard account codes (matching accounting-store)
const ACCOUNTS = {
  CASH: "acc-1000",
  ACCOUNTS_RECEIVABLE: "acc-1100",
  HST_PAYABLE: "acc-2100",
} as const;

/**
 * Generate the next journal entry number
 */
function generateEntryNumber(): string {
  const entries = useAccountingStore.getState().journalEntries;
  const year = new Date().getFullYear();
  const existingNumbers = entries
    .filter((e) => e.entry_number.includes(`JE-${year}`))
    .map((e) => {
      const match = e.entry_number.match(/JE-\d+-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
  
  const nextNum = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  return `JE-${year}-${String(nextNum).padStart(3, "0")}`;
}

/**
 * Create a journal entry for an invoice payment
 */
export function createInvoicePaymentEntry(invoice: Invoice): JournalEntry {
  const entryId = `je-inv-${invoice.id}-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  const contactName = useInvoicesStore.getState().getContactName(invoice.contact_id);
  
  const lines: JournalLine[] = [
    {
      id: `jl-${entryId}-1`,
      entry_id: entryId,
      account_id: ACCOUNTS.CASH,
      account_name: "Cash",
      description: `Payment received from ${contactName}`,
      debit: invoice.total,
      credit: 0,
    },
    {
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: ACCOUNTS.ACCOUNTS_RECEIVABLE,
      account_name: "Accounts Receivable",
      description: `Clear receivable - ${invoice.invoice_number}`,
      debit: 0,
      credit: invoice.subtotal,
    },
  ];

  // Only add tax line if there's tax
  if (invoice.tax > 0) {
    lines.push({
      id: `jl-${entryId}-3`,
      entry_id: entryId,
      account_id: ACCOUNTS.HST_PAYABLE,
      account_name: "GST/HST Payable",
      description: `HST collected - ${invoice.invoice_number}`,
      debit: 0,
      credit: invoice.tax,
    });
  }

  const entry: JournalEntry = {
    id: entryId,
    org_id: invoice.org_id,
    entry_number: entryNumber,
    date: new Date().toISOString().split("T")[0],
    description: `Invoice payment received - ${invoice.invoice_number} (${contactName})`,
    status: "posted", // Auto-post payment entries
    lines,
    created_at: new Date().toISOString(),
  };

  // Add to accounting store
  useAccountingStore.getState().addJournalEntry(entry);

  // Update account balances
  updateAccountBalances(invoice);

  return entry;
}

/**
 * Update account balances after payment
 */
function updateAccountBalances(invoice: Invoice): void {
  const { accounts, updateAccount } = useAccountingStore.getState();
  
  // Increase Cash balance
  const cashAccount = accounts.find((a) => a.id === ACCOUNTS.CASH);
  if (cashAccount) {
    updateAccount(ACCOUNTS.CASH, { 
      balance: cashAccount.balance + invoice.total 
    });
  }

  // Decrease Accounts Receivable balance
  const arAccount = accounts.find((a) => a.id === ACCOUNTS.ACCOUNTS_RECEIVABLE);
  if (arAccount) {
    updateAccount(ACCOUNTS.ACCOUNTS_RECEIVABLE, { 
      balance: Math.max(0, arAccount.balance - invoice.subtotal) 
    });
  }

  // Increase HST Payable (liability increases with credit)
  if (invoice.tax > 0) {
    const hstAccount = accounts.find((a) => a.id === ACCOUNTS.HST_PAYABLE);
    if (hstAccount) {
      updateAccount(ACCOUNTS.HST_PAYABLE, { 
        balance: hstAccount.balance + invoice.tax 
      });
    }
  }
}

/**
 * Hook to wrap invoice updates and trigger accounting integration
 * Call this when marking an invoice as paid
 */
export function markInvoiceAsPaidWithAccounting(
  invoiceId: string
): { invoice: Invoice; journalEntry: JournalEntry } | null {
  const invoicesStore = useInvoicesStore.getState();
  const invoice = invoicesStore.invoices.find((i) => i.id === invoiceId);
  
  if (!invoice) {
    console.error(`Invoice ${invoiceId} not found`);
    return null;
  }

  if (invoice.status === "paid") {
    console.warn(`Invoice ${invoiceId} is already paid`);
    return null;
  }

  // Update invoice status
  invoicesStore.updateInvoice(invoiceId, { status: "paid" });

  // Get updated invoice
  const updatedInvoice = {
    ...invoice,
    status: "paid" as const,
  };

  // Create accounting entry
  const journalEntry = createInvoicePaymentEntry(updatedInvoice);

  console.log(
    `✅ Integration: Invoice ${invoice.invoice_number} paid → Journal Entry ${journalEntry.entry_number} created`
  );

  return { invoice: updatedInvoice, journalEntry };
}

/**
 * Validate that a journal entry is balanced (debits = credits)
 */
export function validateJournalEntry(entry: JournalEntry): boolean {
  const totalDebits = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredits = entry.lines.reduce((sum, l) => sum + l.credit, 0);
  
  // Use small epsilon for floating point comparison
  return Math.abs(totalDebits - totalCredits) < 0.01;
}

/**
 * Create journal entry for invoice sent (creates receivable)
 * Optional: Call this when invoice is first sent
 */
export function createInvoiceSentEntry(invoice: Invoice): JournalEntry {
  const entryId = `je-inv-sent-${invoice.id}-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  const contactName = useInvoicesStore.getState().getContactName(invoice.contact_id);

  const lines: JournalLine[] = [
    {
      id: `jl-${entryId}-1`,
      entry_id: entryId,
      account_id: ACCOUNTS.ACCOUNTS_RECEIVABLE,
      account_name: "Accounts Receivable",
      description: `Invoice sent to ${contactName}`,
      debit: invoice.subtotal,
      credit: 0,
    },
    {
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: "acc-4000", // Sales Revenue
      account_name: "Sales Revenue",
      description: `Sales - ${invoice.invoice_number}`,
      debit: 0,
      credit: invoice.subtotal,
    },
  ];

  const entry: JournalEntry = {
    id: entryId,
    org_id: invoice.org_id,
    entry_number: entryNumber,
    date: invoice.issue_date,
    description: `Invoice sent - ${invoice.invoice_number} (${contactName})`,
    status: "posted",
    lines,
    created_at: new Date().toISOString(),
  };

  useAccountingStore.getState().addJournalEntry(entry);
  return entry;
}
