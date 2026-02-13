/**
 * Purchase → Inventory Integration
 * 
 * When a purchase order is marked as "received", this integration:
 * 1. Increases stock quantities for each product in the order
 * 2. Creates stock movements (type: 'receipt') for audit trail
 * 3. Updates Inventory asset account
 * 4. Creates Accounts Payable journal entry
 * 
 * Accounting entry when goods are received:
 *   Debit:  Inventory (1200)          - Value of goods received
 *   Credit: Accounts Payable (2000)   - Amount owed to vendor
 * 
 * HST on purchases is recorded separately:
 *   Debit:  GST/HST Recoverable (1300) - Input tax credit
 *   Credit: Accounts Payable (2000)    - Tax portion owed
 */

import type { 
  PurchaseOrder, 
  PurchaseOrderLine, 
  StockMovement, 
  JournalEntry, 
  JournalLine,
  Product 
} from "@/types";
import { useInventoryStore } from "@/stores/inventory-store";
import { usePurchaseStore } from "@/stores/purchase-store";
import { useAccountingStore } from "@/stores/accounting-store";

// Standard account codes
const ACCOUNTS = {
  INVENTORY: "acc-1200",
  ACCOUNTS_PAYABLE: "acc-2000",
  HST_RECOVERABLE: "acc-1300",
} as const;

// Default location for receiving
const DEFAULT_LOCATION_ID = "loc-main";

/**
 * Result of processing a purchase order receipt
 */
export interface PurchaseInventoryResult {
  success: boolean;
  stockMovements: StockMovement[];
  journalEntry?: JournalEntry;
  errors: string[];
  warnings: string[];
  summary?: {
    itemsReceived: number;
    totalQuantity: number;
    totalValue: number;
    totalTax: number;
  };
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
 * Create stock movements for received goods
 */
function createReceiptMovements(
  order: PurchaseOrder,
  lines: PurchaseOrderLine[],
  products: Product[]
): StockMovement[] {
  const movements: StockMovement[] = [];
  const now = new Date().toISOString();

  for (const line of lines) {
    if (!line.product_id) continue;

    const product = products.find((p) => p.id === line.product_id);
    
    const movement: StockMovement = {
      id: `sm-${order.id}-${line.id}-${Date.now()}`,
      org_id: order.org_id,
      product_id: line.product_id,
      from_location_id: undefined, // Receipt = comes in
      to_location_id: DEFAULT_LOCATION_ID,
      quantity: line.quantity,
      type: "receipt",
      reference: order.order_number,
      notes: `Purchase order ${order.order_number} - ${product?.name || line.description}`,
      created_by: "system",
      created_at: now,
    };

    movements.push(movement);
  }

  return movements;
}

/**
 * Create journal entry for goods received
 */
function createReceiptJournalEntry(
  order: PurchaseOrder,
  lines: PurchaseOrderLine[],
  products: Product[]
): JournalEntry {
  const entryId = `je-receipt-${order.id}-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  const vendorName = usePurchaseStore.getState().getVendorName(order.vendor_id);
  
  // Calculate total inventory value (at cost)
  let totalInventoryValue = 0;
  for (const line of lines) {
    if (!line.product_id) continue;
    const product = products.find((p) => p.id === line.product_id);
    // Use line unit_price as cost, or product cost_price
    const unitCost = product?.cost_price || line.unit_price;
    totalInventoryValue += unitCost * line.quantity;
  }
  
  const journalLines: JournalLine[] = [
    // Debit Inventory
    {
      id: `jl-${entryId}-1`,
      entry_id: entryId,
      account_id: ACCOUNTS.INVENTORY,
      account_name: "Inventory",
      description: `Goods received - ${order.order_number}`,
      debit: order.subtotal,
      credit: 0,
    },
  ];
  
  // Debit HST Recoverable (input tax credit) if there's tax
  if (order.tax > 0) {
    journalLines.push({
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: ACCOUNTS.HST_RECOVERABLE,
      account_name: "GST/HST Recoverable",
      description: `Input tax credit - ${order.order_number}`,
      debit: order.tax,
      credit: 0,
    });
  }
  
  // Credit Accounts Payable (full amount including tax)
  journalLines.push({
    id: `jl-${entryId}-3`,
    entry_id: entryId,
    account_id: ACCOUNTS.ACCOUNTS_PAYABLE,
    account_name: "Accounts Payable",
    description: `Amount owed to ${vendorName}`,
    debit: 0,
    credit: order.total,
  });
  
  const entry: JournalEntry = {
    id: entryId,
    org_id: order.org_id,
    entry_number: entryNumber,
    date: new Date().toISOString().split("T")[0],
    description: `Goods received - ${order.order_number} (${vendorName})`,
    status: "posted",
    lines: journalLines,
    created_at: new Date().toISOString(),
  };
  
  return entry;
}

/**
 * Update inventory quantities for received goods
 */
function increaseInventory(lines: PurchaseOrderLine[]): void {
  const { products, updateProduct } = useInventoryStore.getState();

  for (const line of lines) {
    if (!line.product_id) continue;

    const product = products.find((p) => p.id === line.product_id);
    if (!product) continue;

    const newQuantity = product.stock_quantity + line.quantity;
    updateProduct(line.product_id, { stock_quantity: newQuantity });
  }
}

/**
 * Update account balances after receiving goods
 */
function updateReceiptAccountBalances(order: PurchaseOrder): void {
  const { accounts, updateAccount } = useAccountingStore.getState();
  
  // Increase Inventory (asset)
  const inventoryAccount = accounts.find((a) => a.id === ACCOUNTS.INVENTORY);
  if (inventoryAccount) {
    updateAccount(ACCOUNTS.INVENTORY, { 
      balance: inventoryAccount.balance + order.subtotal 
    });
  }
  
  // Increase HST Recoverable (asset) if there's tax
  if (order.tax > 0) {
    const hstRecoverableAccount = accounts.find((a) => a.id === ACCOUNTS.HST_RECOVERABLE);
    if (hstRecoverableAccount) {
      updateAccount(ACCOUNTS.HST_RECOVERABLE, { 
        balance: hstRecoverableAccount.balance + order.tax 
      });
    }
  }
  
  // Increase Accounts Payable (liability)
  const apAccount = accounts.find((a) => a.id === ACCOUNTS.ACCOUNTS_PAYABLE);
  if (apAccount) {
    updateAccount(ACCOUNTS.ACCOUNTS_PAYABLE, { 
      balance: apAccount.balance + order.total 
    });
  }
}

/**
 * Ensure HST Recoverable account exists
 */
export function ensureReceivingAccounts(): void {
  const { accounts, addAccount } = useAccountingStore.getState();
  const now = new Date().toISOString();
  
  if (!accounts.find((a) => a.id === ACCOUNTS.HST_RECOVERABLE)) {
    addAccount({
      id: ACCOUNTS.HST_RECOVERABLE,
      org_id: "org1",
      code: "1300",
      name: "GST/HST Recoverable",
      type: "asset",
      balance: 0,
      is_active: true,
      created_at: now,
    });
  }
}

/**
 * Process a purchase order receipt
 * - Increases inventory
 * - Creates stock movements
 * - Creates accounting journal entry
 */
export function processPurchaseOrderReceipt(
  orderId: string,
  orderLines: PurchaseOrderLine[]
): PurchaseInventoryResult {
  const result: PurchaseInventoryResult = {
    success: false,
    stockMovements: [],
    errors: [],
    warnings: [],
  };

  // Get order
  const order = usePurchaseStore.getState().orders.find((o) => o.id === orderId);
  if (!order) {
    result.errors.push(`Order ${orderId} not found`);
    return result;
  }

  if (order.status === "received") {
    result.errors.push(`Order ${order.order_number} is already received`);
    return result;
  }

  if (order.status === "cancelled") {
    result.errors.push(`Cannot receive cancelled order`);
    return result;
  }

  // Ensure required accounts exist
  ensureReceivingAccounts();

  // Get products
  const products = useInventoryStore.getState().products;

  // Validate products exist
  for (const line of orderLines) {
    if (line.product_id) {
      const product = products.find((p) => p.id === line.product_id);
      if (!product) {
        result.warnings.push(`Product ${line.product_id} not found, will skip stock update`);
      }
    }
  }

  // Create stock movements
  result.stockMovements = createReceiptMovements(order, orderLines, products);

  // Increase inventory quantities
  increaseInventory(orderLines);

  // Create journal entry
  const journalEntry = createReceiptJournalEntry(order, orderLines, products);
  useAccountingStore.getState().addJournalEntry(journalEntry);
  result.journalEntry = journalEntry;

  // Update account balances
  updateReceiptAccountBalances(order);

  // Update order status
  usePurchaseStore.getState().updateOrder(orderId, { status: "received" });

  // Calculate summary
  const totalQuantity = orderLines.reduce((sum, l) => sum + l.quantity, 0);
  result.summary = {
    itemsReceived: orderLines.length,
    totalQuantity,
    totalValue: order.subtotal,
    totalTax: order.tax,
  };

  result.success = true;

  console.log(
    `✅ Integration: Purchase Order ${order.order_number} received → ` +
    `${result.stockMovements.length} items added to inventory + ` +
    `Journal Entry ${journalEntry.entry_number}`
  );

  return result;
}

/**
 * Create payment journal entry when paying a vendor bill
 */
export function createVendorPaymentEntry(
  vendorName: string,
  amount: number,
  reference: string
): JournalEntry {
  const entryId = `je-vendor-pay-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  
  const lines: JournalLine[] = [
    {
      id: `jl-${entryId}-1`,
      entry_id: entryId,
      account_id: ACCOUNTS.ACCOUNTS_PAYABLE,
      account_name: "Accounts Payable",
      description: `Payment to ${vendorName}`,
      debit: amount,
      credit: 0,
    },
    {
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: "acc-1000", // Cash
      account_name: "Cash",
      description: `Vendor payment - ${reference}`,
      debit: 0,
      credit: amount,
    },
  ];
  
  const entry: JournalEntry = {
    id: entryId,
    org_id: "org1",
    entry_number: entryNumber,
    date: new Date().toISOString().split("T")[0],
    description: `Vendor payment - ${vendorName} (${reference})`,
    status: "posted",
    lines,
    created_at: new Date().toISOString(),
  };
  
  useAccountingStore.getState().addJournalEntry(entry);
  
  // Update account balances
  const { accounts, updateAccount } = useAccountingStore.getState();
  
  const apAccount = accounts.find((a) => a.id === ACCOUNTS.ACCOUNTS_PAYABLE);
  if (apAccount) {
    updateAccount(ACCOUNTS.ACCOUNTS_PAYABLE, { 
      balance: Math.max(0, apAccount.balance - amount) 
    });
  }
  
  const cashAccount = accounts.find((a) => a.id === "acc-1000");
  if (cashAccount) {
    updateAccount("acc-1000", { 
      balance: Math.max(0, cashAccount.balance - amount) 
    });
  }
  
  return entry;
}

/**
 * Get pending payables (amounts owed to vendors)
 */
export function getPendingPayables(): number {
  const accounts = useAccountingStore.getState().accounts;
  const apAccount = accounts.find((a) => a.id === ACCOUNTS.ACCOUNTS_PAYABLE);
  return apAccount?.balance ?? 0;
}

/**
 * Get total recoverable HST (input tax credits)
 */
export function getRecoverableHST(): number {
  const accounts = useAccountingStore.getState().accounts;
  const hstAccount = accounts.find((a) => a.id === ACCOUNTS.HST_RECOVERABLE);
  return hstAccount?.balance ?? 0;
}
