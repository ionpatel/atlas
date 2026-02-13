/**
 * React hook for Sales → Inventory integration
 * 
 * Usage:
 * ```tsx
 * function ConfirmOrderButton({ orderId, orderLines }) {
 *   const { confirmOrder, checkStock, isProcessing, lowStockAlerts } = useSalesInventory();
 * 
 *   const handleConfirm = async () => {
 *     const stockCheck = checkStock(orderLines);
 *     if (!stockCheck.available) {
 *       alert('Insufficient stock!');
 *       return;
 *     }
 *     
 *     const result = confirmOrder(orderId, orderLines);
 *     if (result.success) {
 *       toast.success(`Order confirmed! ${result.stockMovements.length} items shipped.`);
 *     }
 *   };
 * 
 *   return <button onClick={handleConfirm} disabled={isProcessing}>Confirm Order</button>;
 * }
 * ```
 */

import { useState, useCallback, useMemo } from "react";
import type { SalesOrderLine } from "@/types";
import {
  processSalesOrderConfirmation,
  reverseSalesOrder,
  checkStockAvailability,
  getLowStockAlerts,
  type SalesInventoryResult,
} from "./sales-inventory";

export interface UseSalesInventoryReturn {
  /** Confirm a sales order and process inventory */
  confirmOrder: (
    orderId: string,
    lines: SalesOrderLine[],
    options?: { createCOGS?: boolean; allowNegativeStock?: boolean }
  ) => SalesInventoryResult;

  /** Cancel/reverse a sales order and restore inventory */
  cancelOrder: (
    orderId: string,
    lines: SalesOrderLine[]
  ) => { success: boolean; error?: string };

  /** Check if all items in the order have sufficient stock */
  checkStock: typeof checkStockAvailability;

  /** Get products with stock below minimum level */
  lowStockAlerts: ReturnType<typeof getLowStockAlerts>;

  /** Processing state for UI feedback */
  isProcessing: boolean;

  /** Last operation result for notifications */
  lastResult: SalesInventoryResult | null;
}

export function useSalesInventory(): UseSalesInventoryReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<SalesInventoryResult | null>(null);

  const confirmOrder = useCallback(
    (
      orderId: string,
      lines: SalesOrderLine[],
      options?: { createCOGS?: boolean; allowNegativeStock?: boolean }
    ): SalesInventoryResult => {
      setIsProcessing(true);
      try {
        const result = processSalesOrderConfirmation(orderId, lines, options);
        setLastResult(result);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const cancelOrder = useCallback(
    (orderId: string, lines: SalesOrderLine[]) => {
      setIsProcessing(true);
      try {
        return reverseSalesOrder(orderId, lines);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const lowStockAlerts = useMemo(() => getLowStockAlerts(), []);

  return {
    confirmOrder,
    cancelOrder,
    checkStock: checkStockAvailability,
    lowStockAlerts,
    isProcessing,
    lastResult,
  };
}
