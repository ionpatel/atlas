/**
 * React hook for Payroll → Accounting integration
 * 
 * Usage:
 * ```tsx
 * function PayrollActions({ payRunId }) {
 *   const { 
 *     processPayment, 
 *     recordRemittance,
 *     pendingRemittance,
 *     isProcessing 
 *   } = usePayrollAccounting();
 * 
 *   return (
 *     <>
 *       <button onClick={() => processPayment(payRunId)}>
 *         Process Payment
 *       </button>
 *       <p>Pending CRA Remittance: ${pendingRemittance.total}</p>
 *     </>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo } from "react";
import {
  processPayrollPayment,
  createRemittancePaymentEntry,
  getPendingRemittance,
  calculatePayrollSummary,
  ensurePayrollAccounts,
  type PayrollAccountingResult,
  type PayrollSummary,
} from "./payroll-accounting";
import { usePayrollStore } from "@/stores/payroll-store";

export interface UsePayrollAccountingReturn {
  /** Process a pay run and create accounting entries */
  processPayment: (payRunId: string) => PayrollAccountingResult;
  
  /** Record a CRA remittance payment */
  recordRemittance: (amount: number, period: string) => void;
  
  /** Get summary for a specific pay run */
  getPayRunSummary: (payRunId: string) => PayrollSummary | null;
  
  /** Current pending remittance amounts */
  pendingRemittance: ReturnType<typeof getPendingRemittance>;
  
  /** Processing state for UI feedback */
  isProcessing: boolean;
  
  /** Last operation result */
  lastResult: PayrollAccountingResult | null;
}

export function usePayrollAccounting(): UsePayrollAccountingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<PayrollAccountingResult | null>(null);
  
  const payRuns = usePayrollStore((state) => state.payRuns);

  const processPayment = useCallback(
    (payRunId: string): PayrollAccountingResult => {
      setIsProcessing(true);
      try {
        const result = processPayrollPayment(payRunId);
        setLastResult(result);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const recordRemittance = useCallback(
    (amount: number, period: string): void => {
      setIsProcessing(true);
      try {
        createRemittancePaymentEntry(amount, period);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const getPayRunSummary = useCallback(
    (payRunId: string): PayrollSummary | null => {
      const payRun = payRuns.find((pr) => pr.id === payRunId);
      if (!payRun) return null;
      return calculatePayrollSummary(payRun.payStubs);
    },
    [payRuns]
  );

  const pendingRemittance = useMemo(() => getPendingRemittance(), [lastResult]);

  // Ensure accounts exist on mount
  useMemo(() => ensurePayrollAccounts(), []);

  return {
    processPayment,
    recordRemittance,
    getPayRunSummary,
    pendingRemittance,
    isProcessing,
    lastResult,
  };
}
