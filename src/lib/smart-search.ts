/**
 * Atlas ERP - Smart Search Engine
 * 
 * Natural language search across all ERP modules.
 * Parses queries like "overdue invoices over $1000" or "low stock items"
 */

import { createClient } from "./supabase/client";

// Types
export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  icon: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export type SearchResultType =
  | "product"
  | "contact"
  | "invoice"
  | "order"
  | "employee"
  | "project"
  | "report"
  | "setting"
  | "action";

export interface ParsedQuery {
  intent: QueryIntent;
  entities: QueryEntity[];
  filters: QueryFilter[];
  originalQuery: string;
}

export type QueryIntent =
  | "search"
  | "list"
  | "create"
  | "view"
  | "edit"
  | "delete"
  | "report"
  | "navigate";

export interface QueryEntity {
  type: string;
  value: string;
  confidence: number;
}

export interface QueryFilter {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "gte" | "lte" | "between";
  value: string | number | [number, number];
}

// Intent patterns
const INTENT_PATTERNS: { pattern: RegExp; intent: QueryIntent }[] = [
  { pattern: /^(show|list|find|get|display)\s/i, intent: "list" },
  { pattern: /^(create|add|new|make)\s/i, intent: "create" },
  { pattern: /^(edit|update|modify|change)\s/i, intent: "edit" },
  { pattern: /^(delete|remove|trash)\s/i, intent: "delete" },
  { pattern: /^(go to|open|navigate|goto)\s/i, intent: "navigate" },
  { pattern: /^(report|analyze|stats|analytics)\s/i, intent: "report" },
  { pattern: /^(view|see|check)\s/i, intent: "view" },
];

// Entity patterns
const ENTITY_PATTERNS: { pattern: RegExp; type: string }[] = [
  { pattern: /invoice[s]?/i, type: "invoice" },
  { pattern: /order[s]?/i, type: "order" },
  { pattern: /product[s]?|item[s]?|inventory/i, type: "product" },
  { pattern: /customer[s]?|client[s]?/i, type: "customer" },
  { pattern: /vendor[s]?|supplier[s]?/i, type: "vendor" },
  { pattern: /contact[s]?/i, type: "contact" },
  { pattern: /employee[s]?|staff|team/i, type: "employee" },
  { pattern: /project[s]?/i, type: "project" },
  { pattern: /payment[s]?/i, type: "payment" },
  { pattern: /expense[s]?/i, type: "expense" },
  { pattern: /sale[s]?/i, type: "sale" },
];

// Filter patterns
const FILTER_PATTERNS: { pattern: RegExp; field: string; operator: QueryFilter["operator"] }[] = [
  { pattern: /overdue/i, field: "status", operator: "equals" },
  { pattern: /unpaid/i, field: "status", operator: "equals" },
  { pattern: /paid/i, field: "status", operator: "equals" },
  { pattern: /pending/i, field: "status", operator: "equals" },
  { pattern: /low\s*stock/i, field: "stock_status", operator: "equals" },
  { pattern: /out\s*of\s*stock/i, field: "stock_status", operator: "equals" },
  { pattern: /active/i, field: "status", operator: "equals" },
  { pattern: /inactive/i, field: "status", operator: "equals" },
  { pattern: /this\s*week/i, field: "date_range", operator: "equals" },
  { pattern: /this\s*month/i, field: "date_range", operator: "equals" },
  { pattern: /last\s*month/i, field: "date_range", operator: "equals" },
  { pattern: /today/i, field: "date_range", operator: "equals" },
  { pattern: /over\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i, field: "amount", operator: "gt" },
  { pattern: /under\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i, field: "amount", operator: "lt" },
  { pattern: /more\s*than\s*\$?(\d+)/i, field: "amount", operator: "gt" },
  { pattern: /less\s*than\s*\$?(\d+)/i, field: "amount", operator: "lt" },
];

// Quick actions
const QUICK_ACTIONS: SearchResult[] = [
  {
    id: "action-new-invoice",
    type: "action",
    title: "Create New Invoice",
    subtitle: "Generate a new invoice",
    href: "/invoices/new",
    icon: "FileText",
    relevance: 0.9,
  },
  {
    id: "action-new-product",
    type: "action",
    title: "Add New Product",
    subtitle: "Add item to inventory",
    href: "/inventory/new",
    icon: "Package",
    relevance: 0.9,
  },
  {
    id: "action-new-contact",
    type: "action",
    title: "Add New Contact",
    subtitle: "Create customer or vendor",
    href: "/contacts/new",
    icon: "Users",
    relevance: 0.9,
  },
  {
    id: "action-new-order",
    type: "action",
    title: "Create Sales Order",
    subtitle: "Start a new sale",
    href: "/sales/new",
    icon: "ShoppingCart",
    relevance: 0.9,
  },
  {
    id: "action-run-payroll",
    type: "action",
    title: "Run Payroll",
    subtitle: "Process employee payments",
    href: "/payroll/new",
    icon: "DollarSign",
    relevance: 0.9,
  },
];

// Navigation shortcuts
const NAVIGATION_SHORTCUTS: Record<string, string> = {
  dashboard: "/",
  home: "/",
  inventory: "/inventory",
  products: "/inventory",
  invoices: "/invoices",
  contacts: "/contacts",
  customers: "/contacts?type=customer",
  vendors: "/contacts?type=vendor",
  sales: "/sales",
  orders: "/sales",
  purchases: "/purchase",
  accounting: "/accounting",
  employees: "/employees",
  payroll: "/payroll",
  projects: "/projects",
  reports: "/reports",
  settings: "/settings",
  crm: "/crm",
  website: "/website",
};

/**
 * Parse natural language query into structured format
 */
export function parseQuery(query: string): ParsedQuery {
  const normalizedQuery = query.trim().toLowerCase();
  
  // Detect intent
  let intent: QueryIntent = "search";
  for (const { pattern, intent: detectedIntent } of INTENT_PATTERNS) {
    if (pattern.test(normalizedQuery)) {
      intent = detectedIntent;
      break;
    }
  }

  // Extract entities
  const entities: QueryEntity[] = [];
  for (const { pattern, type } of ENTITY_PATTERNS) {
    if (pattern.test(normalizedQuery)) {
      entities.push({
        type,
        value: type,
        confidence: 0.9,
      });
    }
  }

  // Extract filters
  const filters: QueryFilter[] = [];
  for (const { pattern, field, operator } of FILTER_PATTERNS) {
    const match = normalizedQuery.match(pattern);
    if (match) {
      let value: string | number = match[1] || field;
      
      // Parse numeric values
      if (field === "amount" && match[1]) {
        value = parseFloat(match[1].replace(/,/g, ""));
      }
      
      filters.push({ field, operator, value });
    }
  }

  return {
    intent,
    entities,
    filters,
    originalQuery: query,
  };
}

/**
 * Execute smart search
 */
export async function smartSearch(query: string): Promise<SearchResult[]> {
  const parsed = parseQuery(query);
  const results: SearchResult[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  // Handle navigation intent
  if (parsed.intent === "navigate") {
    for (const [key, href] of Object.entries(NAVIGATION_SHORTCUTS)) {
      if (normalizedQuery.includes(key)) {
        results.push({
          id: `nav-${key}`,
          type: "action",
          title: `Go to ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          href,
          icon: "ArrowRight",
          relevance: 1,
        });
      }
    }
    if (results.length > 0) return results;
  }

  // Handle create intent
  if (parsed.intent === "create") {
    const createActions = QUICK_ACTIONS.filter((a) => a.title.toLowerCase().includes("create") || a.title.toLowerCase().includes("add"));
    for (const action of createActions) {
      const entityMatch = parsed.entities.some((e) => action.title.toLowerCase().includes(e.type));
      if (entityMatch || parsed.entities.length === 0) {
        results.push({ ...action, relevance: entityMatch ? 1 : 0.7 });
      }
    }
    if (results.length > 0) return results.slice(0, 5);
  }

  // Search across modules based on entities
  const supabase = createClient();

  // If no specific entity, search everything
  const searchEntities = parsed.entities.length > 0 
    ? parsed.entities.map((e: any) => e.type)
    : ["product", "contact", "invoice"];

  for (const entityType of searchEntities) {
    switch (entityType) {
      case "product":
      case "item":
        const products = await searchProducts(supabase, normalizedQuery, parsed.filters);
        results.push(...products);
        break;
      case "contact":
      case "customer":
      case "vendor":
        const contacts = await searchContacts(supabase, normalizedQuery, parsed.filters);
        results.push(...contacts);
        break;
      case "invoice":
        const invoices = await searchInvoices(supabase, normalizedQuery, parsed.filters);
        results.push(...invoices);
        break;
      case "employee":
        const employees = await searchEmployees(supabase, normalizedQuery, parsed.filters);
        results.push(...employees);
        break;
    }
  }

  // Add relevant quick actions
  const relevantActions = QUICK_ACTIONS.filter((action) => {
    const actionWords = action.title.toLowerCase().split(" ");
    return actionWords.some((word) => normalizedQuery.includes(word));
  });
  results.push(...relevantActions.map((a: any) => ({ ...a, relevance: 0.6 })));

  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);

  return results.slice(0, 10);
}

// Search functions for each module
async function searchProducts(
  supabase: ReturnType<typeof createClient>,
  query: string,
  filters: QueryFilter[]
): Promise<SearchResult[]> {
  try {
    let dbQuery = supabase
      .from("products")
      .select("id, name, sku, sell_price, stock_quantity, min_quantity")
      .limit(5);

    // Apply text search
    const searchTerms = query.split(" ").filter((t) => t.length > 2);
    if (searchTerms.length > 0) {
      dbQuery = dbQuery.or(
        searchTerms.map((term: any) => `name.ilike.%${term}%,sku.ilike.%${term}%`).join(",")
      );
    }

    // Apply filters
    for (const filter of filters) {
      if (filter.field === "stock_status") {
        if (filter.value === "low stock") {
          dbQuery = dbQuery.lt("stock_quantity", supabase.rpc("get_min_quantity"));
        } else if (filter.value === "out of stock") {
          dbQuery = dbQuery.eq("stock_quantity", 0);
        }
      }
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: `product-${p.id}`,
      type: "product" as const,
      title: p.name,
      subtitle: p.sku,
      description: `$${p.sell_price?.toFixed(2) || "0.00"} • ${p.stock_quantity || 0} in stock`,
      href: `/inventory/${p.id}`,
      icon: "Package",
      relevance: 0.8,
      metadata: { price: p.sell_price, stock: p.stock_quantity },
    }));
  } catch {
    return getMockProductResults(query);
  }
}

async function searchContacts(
  supabase: ReturnType<typeof createClient>,
  query: string,
  filters: QueryFilter[]
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, email, company, type")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .limit(5);

    if (error || !data) return [];

    return data.map((c: any) => ({
      id: `contact-${c.id}`,
      type: "contact" as const,
      title: c.name,
      subtitle: c.company || c.email,
      description: c.type?.charAt(0).toUpperCase() + c.type?.slice(1),
      href: `/contacts/${c.id}`,
      icon: "Users",
      relevance: 0.8,
    }));
  } catch {
    return getMockContactResults(query);
  }
}

async function searchInvoices(
  supabase: ReturnType<typeof createClient>,
  query: string,
  filters: QueryFilter[]
): Promise<SearchResult[]> {
  try {
    let dbQuery = supabase
      .from("invoices")
      .select("id, invoice_number, total, status, due_date, contacts(name)")
      .limit(5);

    // Apply filters
    for (const filter of filters) {
      if (filter.field === "status") {
        dbQuery = dbQuery.eq("status", filter.value);
      }
      if (filter.field === "amount" && typeof filter.value === "number") {
        if (filter.operator === "gt") {
          dbQuery = dbQuery.gt("total", filter.value);
        } else if (filter.operator === "lt") {
          dbQuery = dbQuery.lt("total", filter.value);
        }
      }
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((inv: Record<string, unknown>) => ({
      id: `invoice-${inv.id}`,
      type: "invoice" as const,
      title: inv.invoice_number as string,
      subtitle: (inv.contacts as { name: string } | null)?.name || "Unknown",
      description: `$${(inv.total as number)?.toFixed(2) || "0.00"} • ${inv.status}`,
      href: `/invoices/${inv.id}`,
      icon: "FileText",
      relevance: 0.8,
      metadata: { total: inv.total, status: inv.status },
    }));
  } catch {
    return getMockInvoiceResults(query, filters);
  }
}

async function searchEmployees(
  supabase: ReturnType<typeof createClient>,
  query: string,
  filters: QueryFilter[]
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email, job_title, department")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5);

    if (error || !data) return [];

    return data.map((e: any) => ({
      id: `employee-${e.id}`,
      type: "employee" as const,
      title: `${e.first_name} ${e.last_name}`,
      subtitle: e.job_title,
      description: e.department,
      href: `/employees/${e.id}`,
      icon: "User",
      relevance: 0.8,
    }));
  } catch {
    return [];
  }
}

// Mock results for demo mode
function getMockProductResults(query: string): SearchResult[] {
  const mockProducts = [
    { id: "1", name: "Premium Widget", sku: "WDG-001", price: 29.99, stock: 45 },
    { id: "2", name: "Basic Widget", sku: "WDG-002", price: 14.99, stock: 0 },
    { id: "3", name: "Deluxe Package", sku: "PKG-001", price: 99.99, stock: 12 },
  ];

  return mockProducts
    .filter((p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query))
    .map((p: any) => ({
      id: `product-${p.id}`,
      type: "product" as const,
      title: p.name,
      subtitle: p.sku,
      description: `$${p.price.toFixed(2)} • ${p.stock} in stock`,
      href: `/inventory/${p.id}`,
      icon: "Package",
      relevance: 0.8,
    }));
}

function getMockContactResults(query: string): SearchResult[] {
  const mockContacts = [
    { id: "1", name: "John Smith", company: "Acme Corp", type: "customer" },
    { id: "2", name: "Jane Doe", company: "Tech Inc", type: "vendor" },
  ];

  return mockContacts
    .filter((c) => c.name.toLowerCase().includes(query) || c.company.toLowerCase().includes(query))
    .map((c: any) => ({
      id: `contact-${c.id}`,
      type: "contact" as const,
      title: c.name,
      subtitle: c.company,
      description: c.type.charAt(0).toUpperCase() + c.type.slice(1),
      href: `/contacts/${c.id}`,
      icon: "Users",
      relevance: 0.8,
    }));
}

function getMockInvoiceResults(query: string, filters: QueryFilter[]): SearchResult[] {
  const mockInvoices = [
    { id: "1", number: "INV-2024-001", customer: "Acme Corp", total: 1250, status: "paid" },
    { id: "2", number: "INV-2024-002", customer: "Tech Inc", total: 3500, status: "overdue" },
    { id: "3", number: "INV-2024-003", customer: "Global Ltd", total: 890, status: "pending" },
  ];

  let results = mockInvoices;

  // Apply filters
  for (const filter of filters) {
    if (filter.field === "status" && typeof filter.value === "string") {
      results = results.filter((inv: any) => inv.status === filter.value);
    }
    if (filter.field === "amount" && typeof filter.value === "number") {
      if (filter.operator === "gt") {
        results = results.filter((inv: any) => inv.total > filter.value);
      } else if (filter.operator === "lt") {
        results = results.filter((inv: any) => inv.total < (filter.value as number));
      }
    }
  }

  return results.map((inv: any) => ({
    id: `invoice-${inv.id}`,
    type: "invoice" as const,
    title: inv.number,
    subtitle: inv.customer,
    description: `$${inv.total.toFixed(2)} • ${inv.status}`,
    href: `/invoices/${inv.id}`,
    icon: "FileText",
    relevance: 0.8,
  }));
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(partial: string): string[] {
  const suggestions = [
    "overdue invoices",
    "low stock items",
    "create new invoice",
    "customers this month",
    "sales report",
    "pending orders",
    "out of stock products",
    "invoices over $1000",
    "active projects",
    "run payroll",
  ];

  if (!partial) return suggestions.slice(0, 5);

  return suggestions
    .filter((s) => s.toLowerCase().includes(partial.toLowerCase()))
    .slice(0, 5);
}
