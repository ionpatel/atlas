/**
 * Payroll → Accounting Integration
 * 
 * When a pay run is marked as "paid", this creates the corresponding
 * journal entries in the accounting system:
 * 
 * Employee Expense Journal Entry:
 *   Debit:  Salaries Expense (5100)         - Gross pay
 *   Debit:  Employer CPP Expense (5110)     - Employer CPP contribution
 *   Debit:  Employer EI Expense (5120)      - Employer EI contribution (1.4x employee)
 *   Credit: Cash (1000)                     - Net pay to employees
 *   Credit: Federal Tax Payable (2300)      - Withheld federal tax
 *   Credit: Provincial Tax Payable (2310)   - Withheld provincial tax
 *   Credit: CPP Payable (2320)              - Employee + Employer CPP
 *   Credit: EI Payable (2330)               - Employee + Employer EI
 * 
 * This properly records:
 * 1. The expense of paying employees (including employer payroll taxes)
 * 2. The cash outflow to employees
 * 3. The liability to remit source deductions to CRA
 */

import type { JournalEntry, JournalLine } from "@/types";
import type { PayRun, PayStub } from "@/stores/payroll-store";
import { useAccountingStore } from "@/stores/accounting-store";
import { usePayrollStore } from "@/stores/payroll-store";

// Standard account codes for payroll
const ACCOUNTS = {
  CASH: "acc-1000",
  SALARIES_EXPENSE: "acc-5100",
  EMPLOYER_CPP: "acc-5110",
  EMPLOYER_EI: "acc-5120",
  FEDERAL_TAX_PAYABLE: "acc-2300",
  PROVINCIAL_TAX_PAYABLE: "acc-2310",
  CPP_PAYABLE: "acc-2320",
  EI_PAYABLE: "acc-2330",
} as const;

// Employer payroll tax rate multipliers
const EMPLOYER_RATES = {
  CPP: 1.0, // Employer matches employee CPP 1:1
  EI: 1.4, // Employer pays 1.4x employee EI
} as const;

/**
 * Result of processing a payroll payment
 */
export interface PayrollAccountingResult {
  success: boolean;
  journalEntry?: JournalEntry;
  summary?: PayrollSummary;
  error?: string;
}

/**
 * Summary of payroll amounts for reporting
 */
export interface PayrollSummary {
  totalGross: number;
  totalNet: number;
  totalFederalTax: number;
  totalProvincialTax: number;
  totalEmployeeCpp: number;
  totalEmployerCpp: number;
  totalEmployeeEi: number;
  totalEmployerEi: number;
  totalRemittance: number; // Total to send to CRA
  employeeCount: number;
}

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
 * Calculate payroll summary from pay stubs
 */
export function calculatePayrollSummary(payStubs: PayStub[]): PayrollSummary {
  const totalGross = payStubs.reduce((sum, ps) => sum + ps.grossPay, 0);
  const totalNet = payStubs.reduce((sum, ps) => sum + ps.netPay, 0);
  const totalFederalTax = payStubs.reduce((sum, ps) => sum + ps.federalTax, 0);
  const totalProvincialTax = payStubs.reduce((sum, ps) => sum + ps.provincialTax, 0);
  const totalEmployeeCpp = payStubs.reduce((sum, ps) => sum + ps.cpp, 0);
  const totalEmployeeEi = payStubs.reduce((sum, ps) => sum + ps.ei, 0);
  
  const totalEmployerCpp = totalEmployeeCpp * EMPLOYER_RATES.CPP;
  const totalEmployerEi = totalEmployeeEi * EMPLOYER_RATES.EI;
  
  // Total remittance to CRA = all withheld taxes + employee deductions + employer contributions
  const totalRemittance = 
    totalFederalTax + 
    totalProvincialTax + 
    totalEmployeeCpp + 
    totalEmployerCpp + 
    totalEmployeeEi + 
    totalEmployerEi;
  
  return {
    totalGross,
    totalNet,
    totalFederalTax,
    totalProvincialTax,
    totalEmployeeCpp,
    totalEmployerCpp,
    totalEmployeeEi,
    totalEmployerEi,
    totalRemittance,
    employeeCount: payStubs.length,
  };
}

/**
 * Create journal entry for a paid payroll run
 */
function createPayrollJournalEntry(payRun: PayRun): JournalEntry {
  const summary = calculatePayrollSummary(payRun.payStubs);
  const entryId = `je-payroll-${payRun.id}-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  
  const lines: JournalLine[] = [];
  
  // DEBITS (Expenses)
  
  // Salaries Expense - Total gross pay
  lines.push({
    id: `jl-${entryId}-1`,
    entry_id: entryId,
    account_id: ACCOUNTS.SALARIES_EXPENSE,
    account_name: "Salaries Expense",
    description: `Gross wages - ${payRun.name}`,
    debit: summary.totalGross,
    credit: 0,
  });
  
  // Employer CPP Expense
  if (summary.totalEmployerCpp > 0) {
    lines.push({
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: ACCOUNTS.EMPLOYER_CPP,
      account_name: "Employer CPP Expense",
      description: `Employer CPP contribution - ${payRun.name}`,
      debit: summary.totalEmployerCpp,
      credit: 0,
    });
  }
  
  // Employer EI Expense
  if (summary.totalEmployerEi > 0) {
    lines.push({
      id: `jl-${entryId}-3`,
      entry_id: entryId,
      account_id: ACCOUNTS.EMPLOYER_EI,
      account_name: "Employer EI Expense",
      description: `Employer EI contribution - ${payRun.name}`,
      debit: summary.totalEmployerEi,
      credit: 0,
    });
  }
  
  // CREDITS (Cash outflow + Liabilities)
  
  // Cash - Net pay to employees
  lines.push({
    id: `jl-${entryId}-4`,
    entry_id: entryId,
    account_id: ACCOUNTS.CASH,
    account_name: "Cash",
    description: `Net pay to ${summary.employeeCount} employees - ${payRun.name}`,
    debit: 0,
    credit: summary.totalNet,
  });
  
  // Federal Tax Payable
  if (summary.totalFederalTax > 0) {
    lines.push({
      id: `jl-${entryId}-5`,
      entry_id: entryId,
      account_id: ACCOUNTS.FEDERAL_TAX_PAYABLE,
      account_name: "Federal Tax Payable",
      description: `Federal income tax withheld - ${payRun.name}`,
      debit: 0,
      credit: summary.totalFederalTax,
    });
  }
  
  // Provincial Tax Payable
  if (summary.totalProvincialTax > 0) {
    lines.push({
      id: `jl-${entryId}-6`,
      entry_id: entryId,
      account_id: ACCOUNTS.PROVINCIAL_TAX_PAYABLE,
      account_name: "Provincial Tax Payable",
      description: `Provincial income tax withheld - ${payRun.name}`,
      debit: 0,
      credit: summary.totalProvincialTax,
    });
  }
  
  // CPP Payable (Employee + Employer)
  const totalCpp = summary.totalEmployeeCpp + summary.totalEmployerCpp;
  if (totalCpp > 0) {
    lines.push({
      id: `jl-${entryId}-7`,
      entry_id: entryId,
      account_id: ACCOUNTS.CPP_PAYABLE,
      account_name: "CPP Payable",
      description: `CPP (EE + ER) - ${payRun.name}`,
      debit: 0,
      credit: totalCpp,
    });
  }
  
  // EI Payable (Employee + Employer)
  const totalEi = summary.totalEmployeeEi + summary.totalEmployerEi;
  if (totalEi > 0) {
    lines.push({
      id: `jl-${entryId}-8`,
      entry_id: entryId,
      account_id: ACCOUNTS.EI_PAYABLE,
      account_name: "EI Payable",
      description: `EI (EE + ER) - ${payRun.name}`,
      debit: 0,
      credit: totalEi,
    });
  }
  
  const entry: JournalEntry = {
    id: entryId,
    org_id: payRun.orgId,
    entry_number: entryNumber,
    date: payRun.payDate,
    description: `Payroll - ${payRun.name} (${summary.employeeCount} employees)`,
    status: "posted",
    lines,
    created_at: new Date().toISOString(),
  };
  
  return entry;
}

/**
 * Ensure all required payroll accounts exist
 */
export function ensurePayrollAccounts(): void {
  const { accounts, addAccount } = useAccountingStore.getState();
  const now = new Date().toISOString();
  
  const requiredAccounts = [
    { id: ACCOUNTS.EMPLOYER_CPP, code: "5110", name: "Employer CPP Expense", type: "expense" as const },
    { id: ACCOUNTS.EMPLOYER_EI, code: "5120", name: "Employer EI Expense", type: "expense" as const },
    { id: ACCOUNTS.FEDERAL_TAX_PAYABLE, code: "2300", name: "Federal Tax Payable", type: "liability" as const },
    { id: ACCOUNTS.PROVINCIAL_TAX_PAYABLE, code: "2310", name: "Provincial Tax Payable", type: "liability" as const },
    { id: ACCOUNTS.CPP_PAYABLE, code: "2320", name: "CPP Payable", type: "liability" as const },
    { id: ACCOUNTS.EI_PAYABLE, code: "2330", name: "EI Payable", type: "liability" as const },
  ];
  
  for (const acct of requiredAccounts) {
    if (!accounts.find((a) => a.id === acct.id)) {
      addAccount({
        id: acct.id,
        org_id: "org1",
        code: acct.code,
        name: acct.name,
        type: acct.type,
        balance: 0,
        is_active: true,
        created_at: now,
      });
    }
  }
}

/**
 * Update account balances after payroll
 */
function updatePayrollAccountBalances(summary: PayrollSummary): void {
  const { accounts, updateAccount } = useAccountingStore.getState();
  
  // Decrease Cash
  const cashAccount = accounts.find((a) => a.id === ACCOUNTS.CASH);
  if (cashAccount) {
    updateAccount(ACCOUNTS.CASH, { 
      balance: Math.max(0, cashAccount.balance - summary.totalNet) 
    });
  }
  
  // Increase Salaries Expense
  const salariesAccount = accounts.find((a) => a.id === ACCOUNTS.SALARIES_EXPENSE);
  if (salariesAccount) {
    updateAccount(ACCOUNTS.SALARIES_EXPENSE, { 
      balance: salariesAccount.balance + summary.totalGross 
    });
  }
  
  // Increase Employer CPP Expense
  const employerCppAccount = accounts.find((a) => a.id === ACCOUNTS.EMPLOYER_CPP);
  if (employerCppAccount && summary.totalEmployerCpp > 0) {
    updateAccount(ACCOUNTS.EMPLOYER_CPP, { 
      balance: employerCppAccount.balance + summary.totalEmployerCpp 
    });
  }
  
  // Increase Employer EI Expense
  const employerEiAccount = accounts.find((a) => a.id === ACCOUNTS.EMPLOYER_EI);
  if (employerEiAccount && summary.totalEmployerEi > 0) {
    updateAccount(ACCOUNTS.EMPLOYER_EI, { 
      balance: employerEiAccount.balance + summary.totalEmployerEi 
    });
  }
  
  // Increase liabilities (payables)
  const federalTaxAccount = accounts.find((a) => a.id === ACCOUNTS.FEDERAL_TAX_PAYABLE);
  if (federalTaxAccount && summary.totalFederalTax > 0) {
    updateAccount(ACCOUNTS.FEDERAL_TAX_PAYABLE, { 
      balance: federalTaxAccount.balance + summary.totalFederalTax 
    });
  }
  
  const provincialTaxAccount = accounts.find((a) => a.id === ACCOUNTS.PROVINCIAL_TAX_PAYABLE);
  if (provincialTaxAccount && summary.totalProvincialTax > 0) {
    updateAccount(ACCOUNTS.PROVINCIAL_TAX_PAYABLE, { 
      balance: provincialTaxAccount.balance + summary.totalProvincialTax 
    });
  }
  
  const cppPayableAccount = accounts.find((a) => a.id === ACCOUNTS.CPP_PAYABLE);
  if (cppPayableAccount) {
    const totalCpp = summary.totalEmployeeCpp + summary.totalEmployerCpp;
    updateAccount(ACCOUNTS.CPP_PAYABLE, { 
      balance: cppPayableAccount.balance + totalCpp 
    });
  }
  
  const eiPayableAccount = accounts.find((a) => a.id === ACCOUNTS.EI_PAYABLE);
  if (eiPayableAccount) {
    const totalEi = summary.totalEmployeeEi + summary.totalEmployerEi;
    updateAccount(ACCOUNTS.EI_PAYABLE, { 
      balance: eiPayableAccount.balance + totalEi 
    });
  }
}

/**
 * Process a payroll run payment and create accounting entries
 */
export function processPayrollPayment(payRunId: string): PayrollAccountingResult {
  const payRun = usePayrollStore.getState().payRuns.find((pr) => pr.id === payRunId);
  
  if (!payRun) {
    return { success: false, error: `Pay run ${payRunId} not found` };
  }
  
  if (payRun.status === "paid") {
    return { success: false, error: `Pay run ${payRunId} is already paid` };
  }
  
  if (payRun.status !== "approved") {
    return { success: false, error: `Pay run must be approved before payment` };
  }
  
  // Ensure all required accounts exist
  ensurePayrollAccounts();
  
  // Calculate summary
  const summary = calculatePayrollSummary(payRun.payStubs);
  
  // Create journal entry
  const journalEntry = createPayrollJournalEntry(payRun);
  useAccountingStore.getState().addJournalEntry(journalEntry);
  
  // Update account balances
  updatePayrollAccountBalances(summary);
  
  // Mark pay run as paid
  usePayrollStore.getState().markAsPaid(payRunId);
  
  console.log(
    `✅ Integration: Pay Run ${payRun.name} paid → Journal Entry ${journalEntry.entry_number} created\n` +
    `   💰 Net Pay: $${summary.totalNet.toFixed(2)} | 📋 Remittance: $${summary.totalRemittance.toFixed(2)}`
  );
  
  return {
    success: true,
    journalEntry,
    summary,
  };
}

/**
 * Create journal entry for CRA remittance payment
 * Call this when actually sending the source deductions to CRA
 */
export function createRemittancePaymentEntry(
  amount: number,
  remittancePeriod: string
): JournalEntry {
  const entryId = `je-remit-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  
  // For simplicity, split remittance proportionally (in real world, you'd track exact amounts)
  const federalPortion = amount * 0.45; // Approximate
  const provincialPortion = amount * 0.20;
  const cppPortion = amount * 0.20;
  const eiPortion = amount * 0.15;
  
  const lines: JournalLine[] = [
    {
      id: `jl-${entryId}-1`,
      entry_id: entryId,
      account_id: ACCOUNTS.FEDERAL_TAX_PAYABLE,
      account_name: "Federal Tax Payable",
      description: `CRA remittance - ${remittancePeriod}`,
      debit: federalPortion,
      credit: 0,
    },
    {
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: ACCOUNTS.PROVINCIAL_TAX_PAYABLE,
      account_name: "Provincial Tax Payable",
      description: `CRA remittance - ${remittancePeriod}`,
      debit: provincialPortion,
      credit: 0,
    },
    {
      id: `jl-${entryId}-3`,
      entry_id: entryId,
      account_id: ACCOUNTS.CPP_PAYABLE,
      account_name: "CPP Payable",
      description: `CRA remittance - ${remittancePeriod}`,
      debit: cppPortion,
      credit: 0,
    },
    {
      id: `jl-${entryId}-4`,
      entry_id: entryId,
      account_id: ACCOUNTS.EI_PAYABLE,
      account_name: "EI Payable",
      description: `CRA remittance - ${remittancePeriod}`,
      debit: eiPortion,
      credit: 0,
    },
    {
      id: `jl-${entryId}-5`,
      entry_id: entryId,
      account_id: ACCOUNTS.CASH,
      account_name: "Cash",
      description: `CRA remittance payment - ${remittancePeriod}`,
      debit: 0,
      credit: amount,
    },
  ];
  
  const entry: JournalEntry = {
    id: entryId,
    org_id: "org1",
    entry_number: entryNumber,
    date: new Date().toISOString().split("T")[0],
    description: `CRA Source Deductions Remittance - ${remittancePeriod}`,
    status: "posted",
    lines,
    created_at: new Date().toISOString(),
  };
  
  useAccountingStore.getState().addJournalEntry(entry);
  
  return entry;
}

/**
 * Get pending remittance amount (total payables to CRA)
 */
export function getPendingRemittance(): {
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  total: number;
} {
  const accounts = useAccountingStore.getState().accounts;
  
  const federalTax = accounts.find((a) => a.id === ACCOUNTS.FEDERAL_TAX_PAYABLE)?.balance ?? 0;
  const provincialTax = accounts.find((a) => a.id === ACCOUNTS.PROVINCIAL_TAX_PAYABLE)?.balance ?? 0;
  const cpp = accounts.find((a) => a.id === ACCOUNTS.CPP_PAYABLE)?.balance ?? 0;
  const ei = accounts.find((a) => a.id === ACCOUNTS.EI_PAYABLE)?.balance ?? 0;
  
  return {
    federalTax,
    provincialTax,
    cpp,
    ei,
    total: federalTax + provincialTax + cpp + ei,
  };
}
