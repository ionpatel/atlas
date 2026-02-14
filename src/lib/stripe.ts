/**
 * Atlas ERP - Stripe Integration
 * 
 * Payment processing, subscriptions, and billing management.
 * Uses Stripe API for all payment operations.
 */

import { createClient } from "./supabase/client";

// Types
export interface StripeConfig {
  publishableKey: string;
  isConfigured: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  stripePriceId?: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  orgId: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "past_due" | "canceled" | "trialing" | "incomplete";
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  isDefault: boolean;
}

export interface BillingInvoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

// Pricing plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For individuals and small projects",
    price: 0,
    currency: "CAD",
    interval: "month",
    features: [
      "1 user",
      "100 products",
      "50 invoices/month",
      "Basic reports",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    description: "For growing businesses",
    price: 29,
    currency: "CAD",
    interval: "month",
    features: [
      "5 users",
      "1,000 products",
      "Unlimited invoices",
      "Advanced reports",
      "Email support",
      "Data import/export",
      "Custom branding",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For established businesses",
    price: 49,
    currency: "CAD",
    interval: "month",
    features: [
      "Unlimited users",
      "Unlimited products",
      "Unlimited invoices",
      "All reports + analytics",
      "Priority support",
      "API access",
      "Custom integrations",
      "Audit logs",
      "Multi-location",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: 199,
    currency: "CAD",
    interval: "month",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom development",
      "SLA guarantee",
      "On-premise option",
      "SSO/SAML",
      "Advanced security",
      "White-label",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  },
];

/**
 * Get Stripe configuration
 */
export function getStripeConfig(): StripeConfig {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  return {
    publishableKey,
    isConfigured: !!publishableKey,
  };
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/**
 * Get the current subscription for an organization
 */
export async function getSubscription(orgId: string): Promise<Subscription | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .single();

  if (error || !data) {
    // Return free plan if no subscription exists
    return {
      id: "default",
      orgId,
      plan: "free",
      status: "active",
      cancelAtPeriodEnd: false,
    };
  }

  return {
    id: data.id,
    orgId: data.org_id,
    plan: data.plan,
    status: data.status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    trialEnd: data.trial_end,
  };
}

/**
 * Get payment methods for an organization
 */
export async function getPaymentMethods(orgId: string): Promise<PaymentMethod[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("org_id", orgId)
    .order("is_default", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((pm: any) => ({
    id: pm.id,
    type: pm.type,
    cardBrand: pm.card_brand,
    cardLast4: pm.card_last4,
    cardExpMonth: pm.card_exp_month,
    cardExpYear: pm.card_exp_year,
    isDefault: pm.is_default,
  }));
}

/**
 * Get billing invoices for an organization
 */
export async function getBillingInvoices(orgId: string): Promise<BillingInvoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("billing_invoices")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data.map((inv: any) => ({
    id: inv.id,
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    invoicePdf: inv.invoice_pdf,
    hostedInvoiceUrl: inv.hosted_invoice_url,
    dueDate: inv.due_date,
    paidAt: inv.paid_at,
    createdAt: inv.created_at,
  }));
}

/**
 * Create a checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  orgId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string } | { error: string }> {
  try {
    const response = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        priceId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || "Failed to create checkout session" };
    }

    return await response.json();
  } catch (error) {
    console.error("[Stripe] Checkout error:", error);
    return { error: "Failed to create checkout session" };
  }
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createPortalSession(
  orgId: string,
  returnUrl: string
): Promise<{ url: string } | { error: string }> {
  try {
    const response = await fetch("/api/stripe/create-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || "Failed to create portal session" };
    }

    return await response.json();
  } catch (error) {
    console.error("[Stripe] Portal error:", error);
    return { error: "Failed to create portal session" };
  }
}

/**
 * Create a payment link for a customer invoice
 */
export async function createPaymentLink(
  orgId: string,
  invoiceId: string,
  amount: number,
  currency: string = "cad",
  description?: string
): Promise<{ url: string; paymentLinkId: string } | { error: string }> {
  try {
    const response = await fetch("/api/stripe/create-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        invoiceId,
        amount,
        currency,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || "Failed to create payment link" };
    }

    return await response.json();
  } catch (error) {
    console.error("[Stripe] Payment link error:", error);
    return { error: "Failed to create payment link" };
  }
}

/**
 * Get plan limits based on subscription
 */
export function getPlanLimits(plan: string): {
  maxUsers: number;
  maxProducts: number;
  maxInvoicesPerMonth: number;
  hasApi: boolean;
  hasAuditLogs: boolean;
  hasMultiLocation: boolean;
} {
  switch (plan) {
    case "enterprise":
      return {
        maxUsers: Infinity,
        maxProducts: Infinity,
        maxInvoicesPerMonth: Infinity,
        hasApi: true,
        hasAuditLogs: true,
        hasMultiLocation: true,
      };
    case "pro":
      return {
        maxUsers: Infinity,
        maxProducts: Infinity,
        maxInvoicesPerMonth: Infinity,
        hasApi: true,
        hasAuditLogs: true,
        hasMultiLocation: true,
      };
    case "starter":
      return {
        maxUsers: 5,
        maxProducts: 1000,
        maxInvoicesPerMonth: Infinity,
        hasApi: false,
        hasAuditLogs: false,
        hasMultiLocation: false,
      };
    default: // free
      return {
        maxUsers: 1,
        maxProducts: 100,
        maxInvoicesPerMonth: 50,
        hasApi: false,
        hasAuditLogs: false,
        hasMultiLocation: false,
      };
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Format cents to dollars
 */
export function centsToAmount(cents: number): number {
  return cents / 100;
}

/**
 * Format dollars to cents
 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}
