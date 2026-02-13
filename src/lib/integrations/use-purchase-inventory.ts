/**
 * React hook for Purchase → Inventory integration
 * 
 * Usage:
 * ```tsx
 * function ReceiveOrderButton({ orderId, orderLines }) {
 *   const { 
 *     receiveOrder, 
 *     payVendor,
 *     pendingPayables,
 *     recoverableHST,
 *     isProcessing 
 *   } = usePurchaseInventory();
 * 
 *   return (
 *     <>
 *       <button onClick={() => receiveOrder(orderId, orderLines)}>
 *         Receive Goods
 *       </button>
 *       <p>Accounts Payable: ${pendingPayables}</p>
 *       <p>HST Recoverable: ${recoverableHST}</p>
 *     </>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo } from "react";
import type { PurchaseOrderLine } from "@/types";
import {
  processPurchaseOrderReceipt,
  createVendorPaymentEntry,
  getPendingPayables,
  getRecoverableHST,
  ensureReceivingAccounts,
  type PurchaseInventoryResult,
} from "./purchase-inventory";

export interface UsePurchaseInventoryReturn {
  /** Receive goods from a purchase order */
  receiveOrder: (
    orderId: string,
    lines: PurchaseOrderLine[]
  ) => PurchaseInventoryResult;

  /** Record a payment to a vendor */
  payVendor: (
    vendorName: string,
    amount: number,
    reference: string
  ) => void;

  /** Total outstanding payables */
  pendingPayables: number;

  /** Total recoverable HST (input tax credits) */
  recoverableHST: number;

  /** Processing state for UI feedback */
  isProcessing: boolean;

  /** Last operation result */
  lastResult: PurchaseInventoryResult | null;
}

export function usePurchaseInventory(): UsePurchaseInventoryReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<PurchaseInventoryResult | null>(null);

  const receiveOrder = useCallback(
    (orderId: string, lines: PurchaseOrderLine[]): PurchaseInventoryResult => {
      setIsProcessing(true);
      try {
        const result = processPurchaseOrderReceipt(orderId, lines);
        setLastResult(result);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const payVendor = useCallback(
    (vendorName: string, amount: number, reference: string): void => {
      setIsProcessing(true);
      try {
        createVendorPaymentEntry(vendorName, amount, reference);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const pendingPayables = useMemo(() => getPendingPayables(), [lastResult]);
  const recoverableHST = useMemo(() => getRecoverableHST(), [lastResult]);

  // Ensure accounts exist on mount
  useMemo(() => ensureReceivingAccounts(), []);

  return {
    receiveOrder,
    payVendor,
    pendingPayables,
    recoverableHST,
    isProcessing,
    lastResult,
  };
}
