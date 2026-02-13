/**
 * Sales → Inventory Integration
 * 
 * When a sales order is confirmed, this integration:
 * 1. Reduces stock quantities for each product in the order
 * 2. Creates stock movements (type: 'sale') for audit trail
 * 3. Optionally creates COGS journal entry (Cost of Goods Sold)
 * 
 * Accounting entry when order is confirmed:
 *   Debit:  Cost of Goods Sold (5000)  - Total cost of products sold
 *   Credit: Inventory (1200)           - Reduce inventory asset value
 */

import type { 
  SalesOrder, 
  SalesOrderLine, 
  StockMovement, 
  JournalEntry, 
  JournalLine,
  Product 
} from "@/types";
import { useInventoryStore } from "@/stores/inventory-store";
import { useSalesStore } from "@/stores/sales-store";
import { useAccountingStore } from "@/stores/accounting-store";

// Standard account codes
const ACCOUNTS = {
  INVENTORY: "acc-1200",
  COGS: "acc-5000",
} as const;

// Default location for single-location businesses
const DEFAULT_LOCATION_ID = "loc-main";

/**
 * Result of processing a sales order
 */
export interface SalesInventoryResult {
  success: boolean;
  stockMovements: StockMovement[];
  cogsEntry?: JournalEntry;
  errors: string[];
  warnings: string[];
}

/**
 * Check if sufficient stock is available for all order lines
 */
export function checkStockAvailability(
  lines: SalesOrderLine[]
): { available: boolean; shortages: Array<{ productId: string; required: number; available: number }> } {
  const products = useInventoryStore.getState().products;
  const shortages: Array<{ productId: string; required: number; available: number }> = [];

  for (const line of lines) {
    if (!line.product_id) continue;
    
    const product = products.find((p) => p.id === line.product_id);
    if (!product) {
      shortages.push({
        productId: line.product_id,
        required: line.quantity,
        available: 0,
      });
      continue;
    }

    if (product.stock_quantity < line.quantity) {
      shortages.push({
        productId: line.product_id,
        required: line.quantity,
        available: product.stock_quantity,
      });
    }
  }

  return {
    available: shortages.length === 0,
    shortages,
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
 * Create stock movements for a sales order
 */
function createStockMovements(
  order: SalesOrder,
  lines: SalesOrderLine[],
  products: Product[]
): StockMovement[] {
  const movements: StockMovement[] = [];
  const now = new Date().toISOString();

  for (const line of lines) {
    if (!line.product_id) continue;

    const product = products.find((p) => p.id === line.product_id);
    if (!product) continue;

    const movement: StockMovement = {
      id: `sm-${order.id}-${line.id}-${Date.now()}`,
      org_id: order.org_id,
      product_id: line.product_id,
      from_location_id: DEFAULT_LOCATION_ID,
      to_location_id: undefined, // Sale = goes out
      quantity: line.quantity,
      type: "sale",
      reference: order.order_number,
      notes: `Sales order ${order.order_number} - ${product.name}`,
      created_by: "system",
      created_at: now,
    };

    movements.push(movement);
  }

  return movements;
}

/**
 * Create COGS journal entry for a sales order
 */
function createCOGSEntry(
  order: SalesOrder,
  lines: SalesOrderLine[],
  products: Product[]
): JournalEntry | null {
  // Calculate total cost of goods sold
  let totalCOGS = 0;

  for (const line of lines) {
    if (!line.product_id) continue;
    const product = products.find((p) => p.id === line.product_id);
    if (!product) continue;
    totalCOGS += product.cost_price * line.quantity;
  }

  if (totalCOGS === 0) return null;

  const entryId = `je-cogs-${order.id}-${Date.now()}`;
  const entryNumber = generateEntryNumber();
  const contactName = useSalesStore.getState().getContactName(order.contact_id);

  const journalLines: JournalLine[] = [
    {
      id: `jl-${entryId}-1`,
      entry_id: entryId,
      account_id: ACCOUNTS.COGS,
      account_name: "Cost of Goods Sold",
      description: `COGS for ${order.order_number}`,
      debit: totalCOGS,
      credit: 0,
    },
    {
      id: `jl-${entryId}-2`,
      entry_id: entryId,
      account_id: ACCOUNTS.INVENTORY,
      account_name: "Inventory",
      description: `Inventory reduction - ${order.order_number}`,
      debit: 0,
      credit: totalCOGS,
    },
  ];

  const entry: JournalEntry = {
    id: entryId,
    org_id: order.org_id,
    entry_number: entryNumber,
    date: order.order_date,
    description: `Cost of Goods Sold - ${order.order_number} (${contactName})`,
    status: "posted",
    lines: journalLines,
    created_at: new Date().toISOString(),
  };

  return entry;
}

/**
 * Update inventory quantities
 */
function reduceInventory(lines: SalesOrderLine[]): void {
  const { products, updateProduct } = useInventoryStore.getState();

  for (const line of lines) {
    if (!line.product_id) continue;

    const product = products.find((p) => p.id === line.product_id);
    if (!product) continue;

    const newQuantity = Math.max(0, product.stock_quantity - line.quantity);
    updateProduct(line.product_id, { stock_quantity: newQuantity });
  }
}

/**
 * Process a sales order confirmation
 * - Reduces inventory
 * - Creates stock movements
 * - Creates COGS journal entry
 */
export function processSalesOrderConfirmation(
  orderId: string,
  orderLines: SalesOrderLine[],
  options: { createCOGS?: boolean; allowNegativeStock?: boolean } = {}
): SalesInventoryResult {
  const { createCOGS = true, allowNegativeStock = false } = options;

  const result: SalesInventoryResult = {
    success: false,
    stockMovements: [],
    errors: [],
    warnings: [],
  };

  // Get order
  const order = useSalesStore.getState().orders.find((o) => o.id === orderId);
  if (!order) {
    result.errors.push(`Order ${orderId} not found`);
    return result;
  }

  // Get products
  const products = useInventoryStore.getState().products;

  // Check stock availability
  if (!allowNegativeStock) {
    const stockCheck = checkStockAvailability(orderLines);
    if (!stockCheck.available) {
      for (const shortage of stockCheck.shortages) {
        const product = products.find((p) => p.id === shortage.productId);
        const productName = product?.name || shortage.productId;
        result.errors.push(
          `Insufficient stock for ${productName}: need ${shortage.required}, have ${shortage.available}`
        );
      }
      return result;
    }
  }

  // Create stock movements
  result.stockMovements = createStockMovements(order, orderLines, products);

  // Reduce inventory quantities
  reduceInventory(orderLines);

  // Create COGS journal entry
  if (createCOGS) {
    const cogsEntry = createCOGSEntry(order, orderLines, products);
    if (cogsEntry) {
      useAccountingStore.getState().addJournalEntry(cogsEntry);
      result.cogsEntry = cogsEntry;

      // Update account balances
      const { accounts, updateAccount } = useAccountingStore.getState();
      const totalCOGS = cogsEntry.lines[0].debit;

      // Increase COGS (expense)
      const cogsAccount = accounts.find((a) => a.id === ACCOUNTS.COGS);
      if (cogsAccount) {
        updateAccount(ACCOUNTS.COGS, { balance: cogsAccount.balance + totalCOGS });
      }

      // Decrease Inventory (asset)
      const invAccount = accounts.find((a) => a.id === ACCOUNTS.INVENTORY);
      if (invAccount) {
        updateAccount(ACCOUNTS.INVENTORY, { 
          balance: Math.max(0, invAccount.balance - totalCOGS) 
        });
      }
    }
  }

  // Update order status
  useSalesStore.getState().updateOrder(orderId, { status: "confirmed" });

  result.success = true;

  console.log(
    `✅ Integration: Sales Order ${order.order_number} confirmed → ` +
    `${result.stockMovements.length} stock movements` +
    (result.cogsEntry ? ` + Journal Entry ${result.cogsEntry.entry_number}` : "")
  );

  return result;
}

/**
 * Reverse a sales order (e.g., when cancelled)
 * Restores inventory quantities
 */
export function reverseSalesOrder(
  orderId: string,
  orderLines: SalesOrderLine[]
): { success: boolean; error?: string } {
  const { products, updateProduct } = useInventoryStore.getState();
  const order = useSalesStore.getState().orders.find((o) => o.id === orderId);

  if (!order) {
    return { success: false, error: `Order ${orderId} not found` };
  }

  // Restore inventory
  for (const line of orderLines) {
    if (!line.product_id) continue;

    const product = products.find((p) => p.id === line.product_id);
    if (!product) continue;

    const newQuantity = product.stock_quantity + line.quantity;
    updateProduct(line.product_id, { stock_quantity: newQuantity });
  }

  console.log(`✅ Integration: Sales Order ${order.order_number} reversed → Inventory restored`);

  return { success: true };
}

/**
 * Get low stock alerts based on current inventory
 */
export function getLowStockAlerts(): Array<{
  product: Product;
  currentStock: number;
  minStock: number;
  deficit: number;
}> {
  const products = useInventoryStore.getState().products;
  
  return products
    .filter((p) => p.is_active && p.stock_quantity < p.min_quantity)
    .map((p) => ({
      product: p,
      currentStock: p.stock_quantity,
      minStock: p.min_quantity,
      deficit: p.min_quantity - p.stock_quantity,
    }))
    .sort((a, b) => b.deficit - a.deficit);
}
