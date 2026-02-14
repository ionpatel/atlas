/**
 * Atlas ERP Integration Framework
 * Standardized interface for third-party integrations
 */

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'accounting' | 'ecommerce' | 'automation' | 'payments';
  status: 'available' | 'coming_soon' | 'connected';
  features: string[];
  setupUrl?: string;
}

export interface IntegrationConnection {
  id: string;
  integration_id: string;
  org_id: string;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  last_sync_at: string | null;
  status: 'active' | 'error' | 'disconnected';
  created_at: string;
}

// Available integrations
export const INTEGRATIONS: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync contacts, invoices, and expenses with QuickBooks Online',
    icon: '/integrations/quickbooks.svg',
    category: 'accounting',
    status: 'available',
    features: [
      'Two-way contact sync',
      'Invoice sync',
      'Expense tracking',
      'Chart of accounts mapping'
    ]
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Connect your Xero account for seamless accounting',
    icon: '/integrations/xero.svg',
    category: 'accounting',
    status: 'available',
    features: [
      'Contact sync',
      'Invoice sync',
      'Bank reconciliation',
      'Tax rate mapping'
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products, orders, and inventory with your Shopify store',
    icon: '/integrations/shopify.svg',
    category: 'ecommerce',
    status: 'available',
    features: [
      'Product catalog sync',
      'Order import',
      'Inventory sync',
      'Customer sync'
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Connect your WordPress store with Atlas',
    icon: '/integrations/woocommerce.svg',
    category: 'ecommerce',
    status: 'coming_soon',
    features: [
      'Product sync',
      'Order management',
      'Stock updates',
      'Customer import'
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    icon: '/integrations/stripe.svg',
    category: 'payments',
    status: 'available',
    features: [
      'Payment processing',
      'Invoice payments',
      'Subscription billing',
      'Payment links'
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect Atlas to 5000+ apps with Zapier',
    icon: '/integrations/zapier.svg',
    category: 'automation',
    status: 'available',
    features: [
      'Trigger on new invoice',
      'Trigger on new order',
      'Trigger on low stock',
      'Create records from other apps'
    ]
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    description: 'Build powerful automations with Make',
    icon: '/integrations/make.svg',
    category: 'automation',
    status: 'coming_soon',
    features: [
      'Visual workflow builder',
      'Multi-step automations',
      'Data transformation',
      'Error handling'
    ]
  },
  {
    id: 'square',
    name: 'Square',
    description: 'POS integration for in-person sales',
    icon: '/integrations/square.svg',
    category: 'payments',
    status: 'coming_soon',
    features: [
      'Transaction sync',
      'Inventory updates',
      'Customer sync',
      'Sales reporting'
    ]
  }
];

// Integration sync status
export interface SyncStatus {
  lastSync: Date | null;
  nextSync: Date | null;
  recordsSynced: number;
  errors: string[];
  status: 'idle' | 'syncing' | 'error' | 'success';
}

// Base integration class
export abstract class BaseIntegration {
  protected connection: IntegrationConnection;

  constructor(connection: IntegrationConnection) {
    this.connection = connection;
  }

  abstract connect(credentials: Record<string, string>): Promise<boolean>;
  abstract disconnect(): Promise<boolean>;
  abstract sync(): Promise<SyncStatus>;
  abstract testConnection(): Promise<boolean>;
}

// Webhook payload for Zapier/Make
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export function createWebhookPayload(event: string, data: Record<string, any>): WebhookPayload {
  return {
    event,
    timestamp: new Date().toISOString(),
    data
  };
}

// Integration events
export const INTEGRATION_EVENTS = {
  // Invoices
  'invoice.created': 'New invoice created',
  'invoice.sent': 'Invoice sent to customer',
  'invoice.paid': 'Invoice payment received',
  'invoice.overdue': 'Invoice became overdue',
  
  // Orders
  'order.created': 'New order placed',
  'order.fulfilled': 'Order fulfilled',
  'order.cancelled': 'Order cancelled',
  
  // Inventory
  'product.created': 'New product added',
  'product.updated': 'Product updated',
  'product.low_stock': 'Product low on stock',
  'product.out_of_stock': 'Product out of stock',
  
  // Contacts
  'contact.created': 'New contact added',
  'contact.updated': 'Contact updated',
  
  // Payments
  'payment.received': 'Payment received',
  'payment.failed': 'Payment failed',
  
  // Sales
  'sale.completed': 'Sale completed'
} as const;

// Invoice-Accounting integration hook
export function useInvoiceAccounting() {
  const syncToAccounting = async (invoiceId: string) => {
    // Placeholder for invoice -> accounting sync
    console.log(`Syncing invoice ${invoiceId} to accounting`);
    return { success: true };
  };

  const createJournalEntry = async (invoiceId: string, amount: number) => {
    // Placeholder for journal entry creation
    console.log(`Creating journal entry for invoice ${invoiceId}: $${amount}`);
    return { success: true, entryId: `JE-${Date.now()}` };
  };

  const markAsPaid = async (invoiceId: string) => {
    // Placeholder for marking invoice as paid
    console.log(`Marking invoice ${invoiceId} as paid`);
    return { 
      success: true, 
      journalEntry: { 
        entry_number: `JE-${Date.now()}` 
      }
    };
  };

  return {
    syncToAccounting,
    createJournalEntry,
    markAsPaid,
    isEnabled: true
  };
}
