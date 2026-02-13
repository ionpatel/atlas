/**
 * Atlas ERP - Audit Logging Utility
 * 
 * Comprehensive audit logging for all write operations.
 * Logs create, update, and delete actions with before/after values.
 */

import { createClient } from "@/lib/supabase/client";

export type AuditAction = "create" | "update" | "delete";

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

export interface AuditLogInput {
  orgId: string;
  action: AuditAction;
  tableName: string;
  recordId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

// Map table names to human-readable module names
export const TABLE_TO_MODULE: Record<string, string> = {
  products: "Inventory",
  stock_levels: "Inventory",
  stock_movements: "Inventory",
  locations: "Inventory",
  invoices: "Invoices",
  invoice_items: "Invoices",
  contacts: "Contacts",
  employees: "Employees",
  employee_compensations: "Employees",
  pay_runs: "Payroll",
  pay_stubs: "Payroll",
  sales_orders: "Sales",
  sales_order_lines: "Sales",
  purchase_orders: "Purchase",
  purchase_order_lines: "Purchase",
  bills: "Bills",
  bill_lines: "Bills",
  accounts: "Accounting",
  journal_entries: "Accounting",
  journal_lines: "Accounting",
  tax_configs: "Settings",
  leads: "CRM",
  projects: "Projects",
  organizations: "Settings",
  org_members: "Settings",
  website_pages: "Website",
  roles: "Settings",
  role_permissions: "Settings",
  user_roles: "Settings",
};

// Fields to exclude from audit logs (sensitive data)
const EXCLUDED_FIELDS = [
  "password",
  "password_hash",
  "api_key",
  "secret",
  "token",
  "refresh_token",
];

/**
 * Sanitize values by removing sensitive fields
 */
function sanitizeValues(values: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!values) return null;
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!EXCLUDED_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Calculate the diff between old and new values
 * Returns only the fields that changed
 */
export function calculateDiff(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null
): { changed: string[]; added: string[]; removed: string[] } {
  const changed: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  if (!oldValues && !newValues) return { changed, added, removed };
  
  if (!oldValues) {
    // All fields are new
    return { changed: [], added: Object.keys(newValues || {}), removed: [] };
  }
  
  if (!newValues) {
    // All fields are removed
    return { changed: [], added: [], removed: Object.keys(oldValues) };
  }

  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  for (const key of allKeys) {
    const oldVal = oldValues[key];
    const newVal = newValues[key];

    if (!(key in oldValues)) {
      added.push(key);
    } else if (!(key in newValues)) {
      removed.push(key);
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changed.push(key);
    }
  }

  return { changed, added, removed };
}

/**
 * Format a value for display
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string") {
    // Truncate long strings
    if (value.length > 100) return value.substring(0, 100) + "...";
    return value;
  }
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Log an audit event to the database
 * 
 * @param input - The audit log input
 * @returns The created audit log ID or null if failed
 */
export async function logAuditEvent(input: AuditLogInput): Promise<string | null> {
  // Skip in demo mode
  if (!isSupabaseConfigured()) {
    console.log("[Audit] Demo mode - skipping audit log:", input);
    return null;
  }

  try {
    const supabase = createClient();

    // Sanitize values to remove sensitive data
    const sanitizedOld = sanitizeValues(input.oldValues || null);
    const sanitizedNew = sanitizeValues(input.newValues || null);

    // Get user agent from window if available
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : null;

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        org_id: input.orgId,
        action: input.action,
        table_name: input.tableName,
        record_id: input.recordId,
        old_values: sanitizedOld,
        new_values: sanitizedNew,
        user_agent: userAgent,
        // ip_address is captured server-side via RLS or edge function
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Audit] Failed to log event:", error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error("[Audit] Error logging event:", err);
    return null;
  }
}

/**
 * Fetch audit logs for an organization
 */
export async function fetchAuditLogs(
  orgId: string,
  options: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: AuditAction;
    tableName?: string;
  } = {}
): Promise<{ data: AuditLog[]; count: number } | null> {
  if (!isSupabaseConfigured()) {
    // Return mock data in demo mode
    return { data: getMockAuditLogs(), count: 15 };
  }

  try {
    const supabase = createClient();
    const { limit = 50, offset = 0, startDate, endDate, userId, action, tableName } = options;

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (action) {
      query = query.eq("action", action);
    }
    if (tableName) {
      query = query.eq("table_name", tableName);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[Audit] Failed to fetch logs:", error);
      return null;
    }

    return { data: data || [], count: count || 0 };
  } catch (err) {
    console.error("[Audit] Error fetching logs:", err);
    return null;
  }
}

/**
 * Export audit logs to CSV format
 */
export function exportToCSV(logs: AuditLog[]): string {
  const headers = [
    "Date",
    "User",
    "Action",
    "Module",
    "Table",
    "Record ID",
    "Changes",
  ];

  const rows = logs.map((log) => {
    const diff = calculateDiff(log.old_values, log.new_values);
    const changes = [...diff.changed, ...diff.added, ...diff.removed].join("; ");
    const module = TABLE_TO_MODULE[log.table_name] || log.table_name;

    return [
      new Date(log.created_at).toISOString(),
      log.user_email || "System",
      log.action,
      module,
      log.table_name,
      log.record_id,
      changes,
    ].map(escapeCSV);
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Get mock audit logs for demo mode
 */
function getMockAuditLogs(): AuditLog[] {
  const now = new Date();
  return [
    {
      id: "audit-1",
      org_id: "org1",
      user_id: "user1",
      user_email: "harshil@atlas-erp.com",
      action: "update",
      table_name: "products",
      record_id: "p1",
      old_values: { sell_price: 11.99, stock_quantity: 145 },
      new_values: { sell_price: 12.99, stock_quantity: 150 },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "audit-2",
      org_id: "org1",
      user_id: "user2",
      user_email: "sarah@atlas-erp.com",
      action: "create",
      table_name: "invoices",
      record_id: "inv-2024-001",
      old_values: null,
      new_values: { invoice_number: "INV-2024-001", total: 1250.00, status: "draft" },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "audit-3",
      org_id: "org1",
      user_id: "user1",
      user_email: "harshil@atlas-erp.com",
      action: "delete",
      table_name: "contacts",
      record_id: "c10",
      old_values: { name: "Old Vendor Inc.", type: "vendor", email: "old@vendor.com" },
      new_values: null,
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "audit-4",
      org_id: "org1",
      user_id: "user3",
      user_email: "marcus@atlas-erp.com",
      action: "update",
      table_name: "employees",
      record_id: "emp-5",
      old_values: { job_title: "Sales Associate", department: "Sales" },
      new_values: { job_title: "Senior Sales Associate", department: "Sales" },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "audit-5",
      org_id: "org1",
      user_id: "user2",
      user_email: "sarah@atlas-erp.com",
      action: "create",
      table_name: "pay_runs",
      record_id: "pr-2024-02",
      old_values: null,
      new_values: { name: "February 2024 Payroll", status: "draft", total_gross: 45000 },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "audit-6",
      org_id: "org1",
      user_id: "user1",
      user_email: "harshil@atlas-erp.com",
      action: "update",
      table_name: "invoices",
      record_id: "inv-2024-001",
      old_values: { status: "draft" },
      new_values: { status: "sent" },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "audit-7",
      org_id: "org1",
      user_id: "user3",
      user_email: "marcus@atlas-erp.com",
      action: "create",
      table_name: "products",
      record_id: "p9",
      old_values: null,
      new_values: { name: "Aspirin 100mg", sku: "ASP-100", category: "Pain Relief", sell_price: 4.99 },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "audit-8",
      org_id: "org1",
      user_id: "user2",
      user_email: "sarah@atlas-erp.com",
      action: "update",
      table_name: "contacts",
      record_id: "c3",
      old_values: { phone: "(647) 555-0303", address: "" },
      new_values: { phone: "(647) 555-0333", address: "456 Main St, Toronto" },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "audit-9",
      org_id: "org1",
      user_id: "user1",
      user_email: "harshil@atlas-erp.com",
      action: "update",
      table_name: "pay_runs",
      record_id: "pr-2024-02",
      old_values: { status: "draft" },
      new_values: { status: "approved" },
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "audit-10",
      org_id: "org1",
      user_id: "user3",
      user_email: "marcus@atlas-erp.com",
      action: "delete",
      table_name: "products",
      record_id: "p8",
      old_values: { name: "Discontinued Item", sku: "DISC-001", is_active: false },
      new_values: null,
      ip_address: null,
      user_agent: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];
}
