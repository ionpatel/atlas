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
