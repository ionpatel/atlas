/**
 * Atlas ERP - Form Validation & Security
 * Prevents SQL injection, XSS, and validates all inputs
 */

import { z } from 'zod';

// ============================================
// SANITIZATION UTILITIES
// ============================================

// Strip potential XSS vectors
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;');
}

// Remove SQL injection patterns
export function sanitizeSql(input: string): string {
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
    /(--)|(;)|(\/\*)|(\*\/)/g,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
    /(\'|\"|\\)/g
  ];
  
  let sanitized = input;
  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  return sanitized.trim();
}

// General input sanitizer
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return sanitizeHtml(sanitizeSql(input.trim()));
}

// ============================================
// ZOD SCHEMAS - CONTACTS
// ============================================

export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters')
    .transform(sanitizeInput),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .transform(sanitizeInput),
  
  phone: z.string()
    .regex(/^[\d\s\-+().]*$/, 'Invalid phone number format')
    .max(20, 'Phone number too long')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  type: z.enum(['customer', 'vendor', 'both'], {
    errorMap: () => ({ message: 'Invalid contact type' })
  }),
  
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============================================
// ZOD SCHEMAS - PRODUCTS
// ============================================

export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .transform(sanitizeInput),
  
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores')
    .transform(sanitizeInput),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(999999999, 'Price exceeds maximum value'),
  
  cost: z.number()
    .min(0, 'Cost cannot be negative')
    .max(999999999, 'Cost exceeds maximum value')
    .optional(),
  
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity exceeds maximum value'),
  
  reorder_level: z.number()
    .int('Reorder level must be a whole number')
    .min(0, 'Reorder level cannot be negative')
    .max(999999, 'Reorder level exceeds maximum value')
    .optional(),
  
  category: z.string()
    .max(100, 'Category must be less than 100 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  barcode: z.string()
    .regex(/^[a-zA-Z0-9\-]*$/, 'Invalid barcode format')
    .max(50, 'Barcode must be less than 50 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
});

export type ProductInput = z.infer<typeof productSchema>;

// ============================================
// ZOD SCHEMAS - INVOICES
// ============================================

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID').optional(),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .transform(sanitizeInput),
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .max(999999, 'Quantity exceeds maximum value'),
  unit_price: z.number()
    .min(0, 'Price cannot be negative')
    .max(999999999, 'Price exceeds maximum value'),
  tax_rate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .optional()
    .default(0),
});

export const invoiceSchema = z.object({
  contact_id: z.string().uuid('Invalid contact ID'),
  
  invoice_number: z.string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Invoice number contains invalid characters')
    .transform(sanitizeInput),
  
  issue_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  
  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  
  items: z.array(invoiceItemSchema)
    .min(1, 'Invoice must have at least one item')
    .max(100, 'Invoice cannot have more than 100 items'),
  
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  terms: z.string()
    .max(2000, 'Terms must be less than 2000 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid invoice status' })
  }).optional().default('draft'),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// ============================================
// ZOD SCHEMAS - EMPLOYEES
// ============================================

export const employeeSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters')
    .transform(sanitizeInput),
  
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
    .transform(sanitizeInput),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .transform(sanitizeInput),
  
  phone: z.string()
    .regex(/^[\d\s\-+().]*$/, 'Invalid phone number format')
    .max(20, 'Phone number too long')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  position: z.string()
    .max(100, 'Position must be less than 100 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  department: z.string()
    .max(100, 'Department must be less than 100 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  salary: z.number()
    .min(0, 'Salary cannot be negative')
    .max(999999999, 'Salary exceeds maximum value')
    .optional(),
  
  hire_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),
  
  sin: z.string()
    .regex(/^\d{3}-?\d{3}-?\d{3}$/, 'Invalid SIN format (XXX-XXX-XXX)')
    .optional()
    .transform(v => v ? v.replace(/-/g, '') : undefined),
  
  status: z.enum(['active', 'inactive', 'terminated'], {
    errorMap: () => ({ message: 'Invalid employee status' })
  }).optional().default('active'),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

// ============================================
// ZOD SCHEMAS - API KEYS
// ============================================

export const apiKeySchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name contains invalid characters')
    .transform(sanitizeInput),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(v => v ? sanitizeInput(v) : undefined),
  
  permissions: z.array(z.enum(['read', 'write', 'delete']))
    .min(1, 'At least one permission is required'),
  
  expires_in_days: z.number()
    .int('Must be a whole number')
    .min(1, 'Must be at least 1 day')
    .max(365, 'Cannot exceed 365 days')
    .optional(),
});

export type ApiKeyInput = z.infer<typeof apiKeySchema>;

// ============================================
// ZOD SCHEMAS - WEBHOOKS
// ============================================

export const webhookSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeInput),
  
  url: z.string()
    .url('Invalid URL')
    .max(2000, 'URL must be less than 2000 characters')
    .refine(
      (url) => url.startsWith('https://'),
      'Webhook URL must use HTTPS'
    ),
  
  events: z.array(z.string())
    .min(1, 'At least one event is required')
    .max(20, 'Cannot subscribe to more than 20 events'),
  
  is_active: z.boolean().optional().default(true),
});

export type WebhookInput = z.infer<typeof webhookSchema>;

// ============================================
// ZOD SCHEMAS - ORGANIZATION INVITE
// ============================================

export const orgInviteSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .transform(sanitizeInput),
  
  role: z.enum(['admin', 'manager', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Invalid role' })
  }),
});

export type OrgInviteInput = z.infer<typeof orgInviteSchema>;

// ============================================
// ZOD SCHEMAS - SEARCH
// ============================================

export const searchQuerySchema = z.object({
  query: z.string()
    .max(200, 'Search query too long')
    .transform(sanitizeInput),
  
  page: z.number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .default(1),
  
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  for (const error of result.error.errors) {
    const path = error.path.join('.');
    errors[path] = error.message;
  }
  
  return { success: false, errors };
}

// Rate limiting helper (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string, 
  limit: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// CSRF token generation
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}
