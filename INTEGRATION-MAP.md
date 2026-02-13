# Atlas ERP Integration Map

**Generated:** 2026-02-12  
**Lead:** Nexus (Integration Lead)

## Executive Summary

Atlas ERP has **11 Zustand stores** managing core business data. Currently, each module operates in isolation. This document maps the required integrations to make Atlas a true all-in-one ERP where data flows automatically between modules.

---

## Current Module State

### 1. Invoices (`invoices-store.ts`)
- **Data:** Invoices with line items
- **Statuses:** draft → sent → paid/overdue/cancelled
- **Integration Gap:** No journal entry creation when paid
- **Contact Handling:** Hardcoded `contactNameMap` (not using contacts-store)

### 2. Accounting (`accounting-store.ts`)
- **Data:** Chart of Accounts, Journal Entries, Tax Config
- **Statuses:** draft → posted → cancelled
- **Features:** Trial balance, P&L, Balance Sheet calculations
- **Integration Gap:** No automatic entries from other modules

### 3. Inventory (`inventory-store.ts`)
- **Data:** Products with stock_quantity
- **Features:** Category filtering, bulk delete
- **Integration Gap:** No stock movement tracking from sales/purchases
- **Missing:** StockMovement and StockLevel tracking per types/index.ts

### 4. Sales Orders (`sales-store.ts`)
- **Data:** Sales orders with lines
- **Statuses:** draft → confirmed → invoiced → cancelled
- **Integration Gap:** No inventory deduction on confirm
- **Contact Handling:** Hardcoded `contactNameMap`

### 5. Purchase Orders (`purchase-store.ts`)
- **Data:** Purchase orders with lines
- **Statuses:** draft → sent → received → billed → cancelled
- **Integration Gap:** No inventory increase on receive
- **Vendor Handling:** Hardcoded `vendorNameMap`

### 6. Payroll (`payroll-store.ts`)
- **Data:** Employee compensation, Pay Runs, Pay Stubs
- **Features:** Full Canadian tax calculations (CPP, EI, Federal/Provincial)
- **Integration Gap:** No journal entries created when pay run is paid

### 7. Contacts (`contacts-store.ts`)
- **Data:** Customers, vendors, or both
- **Integration Gap:** Not used by other modules (hardcoded maps everywhere)

### 8. CRM (`crm-store.ts`)
- **Data:** Leads with pipeline stages
- **Statuses:** new → qualified → proposition → won/lost
- **Integration Gap:** Won leads could auto-create contacts or invoices

### 9. Employees (`employees-store.ts`)
- **Data:** Employee info, departments
- **Integration Gap:** Not linked to payroll compensations

### 10. Projects (`projects-store.ts`)
- **Data:** Projects with status tracking
- **Integration Gap:** Could link to invoices for time billing

### 11. Auth (`auth-store.ts`)
- **Data:** User authentication state
- **Status:** Minimal, no integration needed

---

## Required Integrations

### Priority 1: Invoice → Accounting 🔴 CRITICAL
**Trigger:** Invoice status changes to `"paid"`  
**Action:** Auto-create posted journal entry

```
Journal Entry: "Payment received - INV-2026-001"
┌─────────────────────────┬──────────┬──────────┐
│ Account                 │ Debit    │ Credit   │
├─────────────────────────┼──────────┼──────────┤
│ Cash (1000)             │ $2,768.50│          │
│ Accounts Receivable     │          │ $2,450.00│
│ HST/GST Payable (2100)  │          │ $318.50  │
└─────────────────────────┴──────────┴──────────┘
```

**Implementation:** `src/lib/integrations/invoice-accounting.ts`

### Priority 2: Sales Order → Inventory 🟠 HIGH
**Trigger:** Sales order status changes to `"confirmed"`  
**Action:** Reduce stock for each line item, create StockMovement

```typescript
// For each line item:
inventory.updateProduct(productId, { 
  stock_quantity: current - quantity 
});
inventory.addStockMovement({
  type: "sale",
  reference: order.order_number,
  quantity: -quantity
});
```

### Priority 3: Purchase Order → Inventory 🟠 HIGH  
**Trigger:** PO status changes to `"received"`  
**Action:** Increase stock for each line item, create StockMovement

```typescript
// For each line item:
inventory.updateProduct(productId, { 
  stock_quantity: current + quantity 
});
inventory.addStockMovement({
  type: "receipt",
  reference: order.order_number,
  quantity: quantity
});
```

### Priority 4: Payroll → Accounting 🟡 MEDIUM
**Trigger:** Pay run status changes to `"paid"`  
**Action:** Create journal entries for payroll expenses

```
Journal Entry: "Payroll - February 2026 Period 1"
┌─────────────────────────┬──────────┬──────────┐
│ Account                 │ Debit    │ Credit   │
├─────────────────────────┼──────────┼──────────┤
│ Salaries Expense (5100) │ $46,250  │          │
│ Cash (1000)             │          │ $31,600  │
│ Federal Tax Payable     │          │ $X,XXX   │
│ Provincial Tax Payable  │          │ $X,XXX   │
│ CPP Payable             │          │ $X,XXX   │
│ EI Payable              │          │ $X,XXX   │
└─────────────────────────┴──────────┴──────────┘
```

### Priority 5: Contact Sync 🟢 LOW
**Action:** Replace all hardcoded contact/vendor maps with contacts-store lookups

**Files to update:**
- `invoices-store.ts` - use contacts-store
- `sales-store.ts` - use contacts-store
- `purchase-store.ts` - use contacts-store

---

## Proposed Event/Hook System

### Architecture: Zustand Middleware + Event Bus

```typescript
// src/lib/integrations/event-bus.ts
type IntegrationEvent = 
  | { type: "invoice.paid"; invoice: Invoice }
  | { type: "salesOrder.confirmed"; order: SalesOrder; lines: SalesOrderLine[] }
  | { type: "purchaseOrder.received"; order: PurchaseOrder; lines: PurchaseOrderLine[] }
  | { type: "payRun.paid"; payRun: PayRun }
  | { type: "contact.updated"; contact: Contact };

const eventBus = createEventBus<IntegrationEvent>();

// Middleware wraps store actions
const withIntegration = (config) => (set, get, api) => {
  const store = config(set, get, api);
  
  // Wrap updateInvoice to emit events
  const originalUpdate = store.updateInvoice;
  store.updateInvoice = (id, data) => {
    const prev = get().invoices.find(i => i.id === id);
    originalUpdate(id, data);
    
    if (data.status === "paid" && prev?.status !== "paid") {
      eventBus.emit({ type: "invoice.paid", invoice: { ...prev, ...data } });
    }
  };
  
  return store;
};
```

### Event Handlers

```typescript
// src/lib/integrations/handlers.ts
eventBus.on("invoice.paid", (event) => {
  createInvoicePaymentJournalEntry(event.invoice);
});

eventBus.on("salesOrder.confirmed", (event) => {
  reduceInventoryForSalesOrder(event.order, event.lines);
});

eventBus.on("purchaseOrder.received", (event) => {
  increaseInventoryForPurchaseOrder(event.order, event.lines);
});

eventBus.on("payRun.paid", (event) => {
  createPayrollJournalEntry(event.payRun);
});
```

---

## Shared Utilities Needed

### 1. `src/lib/integrations/journal-helpers.ts`
```typescript
export function createJournalEntry(params: {
  description: string;
  lines: { accountId: string; debit?: number; credit?: number }[];
}): JournalEntry;

export function getNextEntryNumber(): string;

export function validateBalanced(lines: JournalLine[]): boolean;
```

### 2. `src/lib/integrations/inventory-helpers.ts`
```typescript
export function adjustStock(productId: string, quantity: number, type: StockMovement["type"]): void;

export function checkStockAvailability(productId: string, quantity: number): boolean;

export function createStockMovement(movement: Omit<StockMovement, "id" | "created_at">): void;
```

### 3. `src/lib/integrations/contact-helpers.ts`
```typescript
export function getContactById(id: string): Contact | undefined;

export function getContactName(id: string): string;

export function getContactsByType(type: Contact["type"]): Contact[];
```

---

## Implementation Status

| Integration | Priority | Status | File |
|-------------|----------|--------|------|
| Invoice → Accounting | P1 | ✅ COMPLETE | `src/lib/integrations/invoice-accounting.ts` |
| Sales → Inventory | P2 | ⏳ Pending | - |
| Purchase → Inventory | P3 | ⏳ Pending | - |
| Payroll → Accounting | P4 | ⏳ Pending | - |
| Contact Sync | P5 | ⏳ Pending | - |

### Invoice → Accounting Details

**Files created:**
- `src/lib/integrations/invoice-accounting.ts` - Core integration logic
- `src/lib/integrations/use-invoice-accounting.ts` - React hook
- `src/lib/integrations/index.ts` - Module exports

**Files modified:**
- `src/app/(dashboard)/invoices/page.tsx` - Now uses integration hook

**How it works:**
1. User clicks "Record Payment" on a sent/overdue invoice
2. `useInvoiceAccounting().markAsPaid(invoiceId)` is called
3. Invoice status updates to "paid"
4. Journal entry is auto-created with:
   - Debit: Cash (full amount)
   - Credit: Accounts Receivable (subtotal)
   - Credit: GST/HST Payable (tax amount)
5. Account balances are updated automatically
6. Toast notification shows both invoice and journal entry numbers

---

## Next Steps

1. ✅ Create integration map (this document)
2. ✅ Implement Invoice → Accounting integration
3. Add StockMovement tracking to inventory-store
4. Implement Sales Order → Inventory
5. Implement Purchase Order → Inventory
6. Add payroll expense accounts to chart of accounts
7. Implement Payroll → Accounting
8. Refactor contact lookups across all stores

---

## Account Mapping Reference

| Purpose | Account Code | Account Name | Type |
|---------|--------------|--------------|------|
| Cash receipts | 1000 | Cash | Asset |
| Customer balances | 1100 | Accounts Receivable | Asset |
| Inventory value | 1200 | Inventory | Asset |
| Vendor balances | 2000 | Accounts Payable | Liability |
| Sales tax collected | 2100 | GST/HST Payable | Liability |
| Product sales | 4000 | Sales Revenue | Revenue |
| COGS | 5000 | Cost of Goods Sold | Expense |
| Payroll | 5100 | Salaries | Expense |
