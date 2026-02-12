export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "manager" | "staff";
}

export interface Product {
  id: string;
  org_id: string;
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  description?: string;
  cost_price: number;
  sell_price: number;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  address?: string;
  type: "store" | "warehouse";
  is_active: boolean;
}

export interface StockLevel {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  org_id: string;
  product_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  type: "receipt" | "transfer" | "adjustment" | "sale";
  reference?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface Contact {
  id: string;
  org_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type: "customer" | "vendor" | "both";
  address?: string;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  org_id: string;
  contact_id: string;
  invoice_number: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Account {
  id: string;
  org_id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  org_id: string;
  entry_number: string;
  date: string;
  description: string;
  status: 'draft' | 'posted' | 'cancelled';
  lines: JournalLine[];
  created_at: string;
}

export interface JournalLine {
  id: string;
  entry_id: string;
  account_id: string;
  account_name?: string;
  description: string;
  debit: number;
  credit: number;
}

export interface TaxConfig {
  id: string;
  org_id: string;
  name: string;
  rate: number;
  is_active: boolean;
}

export interface SalesOrder {
  id: string;
  org_id: string;
  contact_id: string;
  order_number: string;
  status: 'draft' | 'confirmed' | 'invoiced' | 'cancelled';
  order_date: string;
  delivery_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
}

export interface SalesOrderLine {
  id: string;
  order_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  org_id: string;
  vendor_id: string;
  order_number: string;
  status: 'draft' | 'sent' | 'received' | 'billed' | 'cancelled';
  order_date: string;
  expected_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
}

export interface PurchaseOrderLine {
  id: string;
  order_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export interface Bill {
  id: string;
  org_id: string;
  type: 'bill' | 'receipt';
  bill_number: string;
  vendor_id: string;
  vendor_name?: string;
  bill_reference?: string;
  bill_date: string;
  accounting_date: string;
  due_date: string;
  payment_reference?: string;
  status: 'draft' | 'posted' | 'cancelled';
  lines: BillLine[];
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface BillLine {
  id: string;
  bill_id: string;
  label: string;
  account_id: string;
  quantity: number;
  price: number;
  tax_rate: number;
  amount: number;
}
