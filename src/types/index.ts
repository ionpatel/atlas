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
  stock_quantity: number;
  min_quantity: number;
  weight?: number;
  dimensions?: string;
  internal_notes?: string;
  image_url?: string;
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
  payment_terms?: "net15" | "net30" | "net60" | "due_on_receipt";
  currency?: "CAD" | "USD" | "EUR";
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export type InvoiceLineType = "line" | "section" | "note";

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

export interface Lead {
  id: string;
  org_id: string;
  name: string;
  contact_name: string;
  company: string;
  email: string;
  phone?: string;
  amount: number;
  stage: 'new' | 'qualified' | 'proposition' | 'won' | 'lost';
  priority: 0 | 1 | 2 | 3;
  tags: string[];
  assigned_to: string;
  next_activity?: string;
  next_activity_date?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  org_id: string;
  name: string;
  job_title: string;
  department: string;
  email: string;
  phone: string;
  start_date: string;
  status: 'active' | 'on_leave' | 'terminated';
  tags: string[];
  avatar_color: string;
  created_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  customer: string;
  start_date: string;
  end_date: string;
  tags: string[];
  task_count: number;
  milestone_progress: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'done';
  is_favorite: boolean;
  assigned_to: string[];
  created_at: string;
}

// =============================================================
// ROLES & PERMISSIONS
// =============================================================

export type RoleName = 'admin' | 'manager' | 'employee' | 'viewer';

export type ModuleName = 
  | 'inventory' 
  | 'invoices' 
  | 'contacts' 
  | 'accounting' 
  | 'sales' 
  | 'purchase' 
  | 'crm' 
  | 'employees' 
  | 'payroll' 
  | 'projects' 
  | 'reports' 
  | 'settings' 
  | 'website' 
  | 'pos'
  | 'dashboard'
  | 'apps';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface Role {
  id: string;
  org_id: string | null;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  role_id: string;
  module: ModuleName;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  org_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface UserPermissions {
  module: ModuleName;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// Extended role with permissions populated
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// User with roles populated
export interface UserWithRoles extends User {
  roles: Role[];
}

// =============================================================
// AUDIT LOGS
// =============================================================

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  table_name: string;
  record_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// =============================================================
// TIME TRACKING
// =============================================================

export type TimeEntryStatus = 'running' | 'paused' | 'stopped';

export interface TimeEntry {
  id: string;
  org_id: string;
  user_id: string;
  user_name?: string;
  project_id?: string;
  project_name?: string;
  task: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  billable: boolean;
  notes?: string;
  status: TimeEntryStatus;
  created_at: string;
}

// =============================================================
// LEAVE MANAGEMENT
// =============================================================

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid' | 'bereavement' | 'parental';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  org_id: string;
  user_id: string;
  user_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: LeaveStatus;
  reason?: string;
  approved_by?: string;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  org_id: string;
  user_id: string;
  user_name?: string;
  year: number;
  vacation_days: number;
  sick_days: number;
  personal_days: number;
  used_vacation: number;
  used_sick: number;
  used_personal: number;
  carried_over: number;
}

export interface LeavePolicy {
  id: string;
  org_id: string;
  leave_type: LeaveType;
  default_days: number;
  accrual_rate: number;
  max_carryover: number;
  requires_approval: boolean;
  min_notice_days: number;
  is_active: boolean;
}

// =============================================================
// EXPENSE MANAGEMENT
// =============================================================

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed';

export interface ExpenseCategory {
  id: string;
  org_id?: string;
  name: string;
  icon: string;
  default_limit?: number;
  is_mileage: boolean;
  mileage_rate: number;
  is_active: boolean;
}

export interface Expense {
  id: string;
  org_id: string;
  user_id: string;
  user_name?: string;
  category_id?: string;
  category_name?: string;
  amount: number;
  currency: string;
  expense_date: string;
  description?: string;
  receipt_url?: string;
  receipt_filename?: string;
  vendor?: string;
  is_mileage: boolean;
  mileage_distance?: number;
  mileage_rate?: number;
  project_id?: string;
  project_name?: string;
  report_id?: string;
  status: ExpenseStatus;
  approved_by?: string;
  approver_name?: string;
  approved_at?: string;
  reimbursed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface ExpenseReport {
  id: string;
  org_id: string;
  user_id: string;
  user_name?: string;
  report_number: string;
  title: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  total_amount: number;
  submitted_at?: string;
  approved_by?: string;
  approver_name?: string;
  approved_at?: string;
  reimbursed_at?: string;
  notes?: string;
  expenses?: Expense[];
  created_at: string;
}

// =============================================================
// POS (POINT OF SALE)
// =============================================================

export type POSSessionStatus = 'open' | 'closed' | 'suspended';
export type POSTransactionStatus = 'completed' | 'refunded' | 'voided' | 'pending';
export type POSPaymentMethod = 'cash' | 'card' | 'split' | 'store_credit';

export interface POSSession {
  id: string;
  org_id: string;
  cashier_id: string;
  register_name: string;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  cash_difference?: number;
  status: POSSessionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface POSTransaction {
  id: string;
  org_id: string;
  session_id: string;
  customer_id?: string;
  transaction_number: string;
  items: POSTransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: POSPaymentMethod;
  payment_details?: Record<string, unknown>;
  amount_paid: number;
  change_given: number;
  status: POSTransactionStatus;
  refund_reason?: string;
  refunded_by?: string;
  refunded_at?: string;
  receipt_printed: boolean;
  receipt_emailed: boolean;
  notes?: string;
  created_at: string;
}

export interface POSTransactionItem {
  id: string;
  transaction_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
}

export interface POSCashMovement {
  id: string;
  session_id: string;
  movement_type: 'in' | 'out' | 'drop' | 'pickup';
  amount: number;
  reason: string;
  performed_by: string;
  approved_by?: string;
  created_at: string;
}

// =============================================================
// SUPPORT TICKETS
// =============================================================

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory = 'general' | 'billing' | 'order' | 'product' | 'technical' | 'other';
export type TicketSenderType = 'customer' | 'staff' | 'system';

export interface SupportTicket {
  id: string;
  org_id: string;
  customer_id: string;
  ticket_number: string;
  subject: string;
  description?: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to?: string;
  resolved_by?: string;
  resolved_at?: string;
  first_response_at?: string;
  related_order_id?: string;
  related_invoice_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: TicketSenderType;
  sender_id?: string;
  sender_name: string;
  message: string;
  attachments: TicketAttachment[];
  is_internal: boolean;
  read_at?: string;
  created_at: string;
}

export interface TicketAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

// =============================================================
// CUSTOMER PORTAL
// =============================================================

export interface CustomerPortalSession {
  id: string;
  org_id: string;
  customer_id: string;
  token: string;
  token_hash: string;
  ip_address?: string;
  user_agent?: string;
  last_activity_at: string;
  expires_at: string;
  revoked_at?: string;
  created_at: string;
}

export interface CustomerPortalCredentials {
  id: string;
  org_id: string;
  customer_id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  failed_login_attempts: number;
  locked_until?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================
// BARCODE SCANNING
// =============================================================

export type BarcodeScanType = 'lookup' | 'inventory_in' | 'inventory_out' | 'pos_sale' | 'batch';

export interface BarcodeScanLog {
  id: string;
  org_id: string;
  user_id: string;
  barcode: string;
  scan_type: BarcodeScanType;
  product_id?: string;
  product_found: boolean;
  quantity_adjusted?: number;
  location?: string;
  notes?: string;
  scanned_at: string;
}
