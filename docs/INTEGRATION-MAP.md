# Atlas ERP Integration Map

## Overview

Atlas ERP features a fully integrated module system where actions in one module automatically trigger updates across related modules. This eliminates double-entry, ensures data consistency, and provides real-time financial visibility.

## Active Integrations (4 Total)

### 1. Invoice → Accounting ✅
**Trigger:** Invoice marked as "paid"

**What happens:**
- Creates journal entry (Cash, AR, HST)
- Updates account balances
- Records revenue recognition

**Journal Entry:**
```
Debit:  Cash (1000)              - Total payment
Credit: Accounts Receivable (1100) - Invoice subtotal
Credit: GST/HST Payable (2100)     - Tax collected
```

**Usage:**
```tsx
import { useInvoiceAccounting } from '@/lib/integrations';

const { markAsPaid } = useInvoiceAccounting();
markAsPaid(invoiceId);
```

---

### 2. Sales → Inventory ✅
**Trigger:** Sales order confirmed

**What happens:**
- Reduces stock quantities for each product
- Creates stock movements (type: 'sale')
- Creates COGS journal entry
- Validates stock availability before confirming

**Journal Entry (COGS):**
```
Debit:  Cost of Goods Sold (5000) - Total cost at cost_price
Credit: Inventory (1200)          - Reduce inventory asset
```

**Usage:**
```tsx
import { useSalesInventory } from '@/lib/integrations';

const { confirmOrder, checkStock, lowStockAlerts } = useSalesInventory();

// Check stock before confirming
const stockCheck = checkStock(orderLines);
if (stockCheck.available) {
  const result = confirmOrder(orderId, orderLines);
}
```

**Features:**
- Stock availability check before confirmation
- Low stock alerts (products below min_quantity)
- Order reversal restores inventory

---

### 3. Payroll → Accounting ✅
**Trigger:** Pay run marked as "paid"

**What happens:**
- Records salary expense
- Records employer payroll taxes (CPP, EI)
- Creates source deduction liabilities
- Tracks CRA remittance obligations

**Journal Entry:**
```
Debit:  Salaries Expense (5100)      - Gross pay
Debit:  Employer CPP Expense (5110)  - Employer CPP (1:1 match)
Debit:  Employer EI Expense (5120)   - Employer EI (1.4x rate)
Credit: Cash (1000)                  - Net pay to employees
Credit: Federal Tax Payable (2300)   - Withheld federal tax
Credit: Provincial Tax Payable (2310) - Withheld provincial tax
Credit: CPP Payable (2320)           - Employee + Employer CPP
Credit: EI Payable (2330)            - Employee + Employer EI
```

**Usage:**
```tsx
import { usePayrollAccounting } from '@/lib/integrations';

const { processPayment, pendingRemittance } = usePayrollAccounting();

const result = processPayment(payRunId);
console.log(`CRA Remittance Due: $${pendingRemittance.total}`);
```

**Features:**
- 2026 Canadian tax rates (CPP 5.95%, EI 1.63%)
- CRA remittance tracking
- Remittance payment recording

---

### 4. Purchase → Inventory ✅
**Trigger:** Purchase order received

**What happens:**
- Increases stock quantities for each product
- Creates stock movements (type: 'receipt')
- Records inventory asset increase
- Creates accounts payable liability
- Tracks HST input tax credits

**Journal Entry:**
```
Debit:  Inventory (1200)         - Goods received value
Debit:  GST/HST Recoverable (1300) - Input tax credit
Credit: Accounts Payable (2000)  - Amount owed to vendor
```

**Usage:**
```tsx
import { usePurchaseInventory } from '@/lib/integrations';

const { receiveOrder, payVendor, pendingPayables, recoverableHST } = usePurchaseInventory();

const result = receiveOrder(orderId, orderLines);
// Later: payVendor('GlobalPharma Inc.', 9605, 'PO-2026-001');
```

**Features:**
- HST recoverable tracking (input tax credits)
- Vendor payment recording
- Outstanding payables summary

---

## Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ATLAS ERP                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐     confirms      ┌───────────┐                      │
│  │  SALES   │ ─────────────────►│ INVENTORY │◄───────────────┐     │
│  │  ORDER   │                   │  LEVELS   │                │     │
│  └────┬─────┘                   └─────┬─────┘          receives    │
│       │                               │                      │     │
│       │ invoices                      │ COGS               ┌─┴────┐│
│       ▼                               ▼                    │PURCH-││
│  ┌──────────┐     pays         ┌───────────┐               │ASE   ││
│  │ INVOICES │ ────────────────►│ACCOUNTING │◄──────────────│ORDER ││
│  └──────────┘                  │           │               └──────┘│
│                                │  - Cash   │                       │
│  ┌──────────┐     pays         │  - AR/AP  │                       │
│  │ PAYROLL  │ ────────────────►│  - HST    │                       │
│  │          │                  │  - CPP/EI │                       │
│  └──────────┘                  └───────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Chart of Accounts (Auto-Created)

| Code | Name | Type | Created By |
|------|------|------|------------|
| 1000 | Cash | Asset | Default |
| 1100 | Accounts Receivable | Asset | Default |
| 1200 | Inventory | Asset | Default |
| 1300 | GST/HST Recoverable | Asset | Purchase Integration |
| 2000 | Accounts Payable | Liability | Default |
| 2100 | GST/HST Payable | Liability | Default |
| 2300 | Federal Tax Payable | Liability | Payroll Integration |
| 2310 | Provincial Tax Payable | Liability | Payroll Integration |
| 2320 | CPP Payable | Liability | Payroll Integration |
| 2330 | EI Payable | Liability | Payroll Integration |
| 4000 | Sales Revenue | Revenue | Default |
| 5000 | Cost of Goods Sold | Expense | Default |
| 5100 | Salaries Expense | Expense | Default |
| 5110 | Employer CPP Expense | Expense | Payroll Integration |
| 5120 | Employer EI Expense | Expense | Payroll Integration |

## Canadian Tax Compliance

### GST/HST Rates by Province
```typescript
ON: 13%   // Ontario HST
BC: 12%   // BC PST + GST
AB: 5%    // Alberta GST only
QC: 14.975% // Quebec QST + GST
NS: 15%   // Nova Scotia HST
NB: 15%   // New Brunswick HST
NL: 15%   // Newfoundland HST
PE: 15%   // PEI HST
MB: 12%   // Manitoba PST + GST
SK: 11%   // Saskatchewan PST + GST
NT/NU/YT: 5% // Territories GST only
```

### 2026 Payroll Tax Constants
```typescript
CPP: {
  maxPensionableEarnings: $71,300
  basicExemption: $3,500
  employeeRate: 5.95%
  maxContribution: $4,034.10
}

EI: {
  maxInsurableEarnings: $65,700
  employeeRate: 1.63%
  employerRate: 2.282% (1.4x employee)
  maxEmployeeContribution: $1,071.51
}
```

## Future Integrations (Planned)

### CRM → Sales
- Convert won deals to sales orders
- Auto-create contacts from leads

### Projects → Invoicing
- Time tracking to invoice line items
- Project budget vs actual from accounting

### Bills → Accounting
- Vendor bill posting
- Automatic expense categorization

---

## Quick Reference

```typescript
import {
  // Invoice → Accounting
  useInvoiceAccounting,
  markInvoiceAsPaidWithAccounting,
  
  // Sales → Inventory
  useSalesInventory,
  checkStockAvailability,
  getLowStockAlerts,
  
  // Payroll → Accounting
  usePayrollAccounting,
  getPendingRemittance,
  
  // Purchase → Inventory
  usePurchaseInventory,
  getPendingPayables,
  getRecoverableHST,
  
  // Utilities
  formatCAD,
  calculateHST,
  formatDate,
  getFiscalQuarter,
} from '@/lib/integrations';
```
