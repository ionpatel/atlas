"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Building2,
  Users,
  Package,
  FileText,
  BarChart3,
  Shield,
  Code,
  Globe,
  Crown,
  ChevronRight,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRICING_PLANS,
  getSubscription,
  getPaymentMethods,
  getBillingInvoices,
  createCheckoutSession,
  createPortalSession,
  formatPrice,
  centsToAmount,
  isStripeConfigured,
  type Subscription,
  type PaymentMethod,
  type BillingInvoice,
  type PricingPlan,
} from "@/lib/stripe";

/* ─────────────────────── Plan Card ─────────────────────── */

function PlanCard({
  plan,
  currentPlan,
  onSelect,
  loading,
}: {
  plan: PricingPlan;
  currentPlan: string;
  onSelect: (planId: string) => void;
  loading: boolean;
}) {
  const isCurrent = plan.id === currentPlan;
  const isUpgrade = PRICING_PLANS.findIndex((p) => p.id === plan.id) >
    PRICING_PLANS.findIndex((p) => p.id === currentPlan);

  return (
    <div
      className={cn(
        "relative bg-[#F5F2E8] border rounded-xl p-6 transition-all",
        plan.popular
          ? "border-[#9C4A29] ring-1 ring-[#9C4A29]/20"
          : "border-[#D4CDB8] hover:border-[#3a3a3a]",
        isCurrent && "bg-[#1f1f1f]"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#9C4A29] text-[#E8E3CC] text-xs font-semibold rounded-full">
          Most Popular
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#2D1810]">{plan.name}</h3>
        <p className="text-sm text-[#6B5B4F] mt-1">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-[#2D1810]">
          {plan.price === 0 ? "Free" : formatPrice(plan.price)}
        </span>
        {plan.price > 0 && (
          <span className="text-[#6B5B4F] text-sm">/{plan.interval}</span>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="text-[#cccccc]">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent || loading || plan.id === "free"}
        className={cn(
          "w-full py-2.5 rounded-lg text-sm font-semibold transition-all",
          isCurrent
            ? "bg-[#DDD7C0] text-[#6B5B4F] cursor-default"
            : plan.popular
            ? "bg-[#9C4A29] text-[#E8E3CC] hover:bg-[#B85A35]"
            : "bg-[#DDD7C0] text-[#2D1810] hover:bg-[#D4CDB8]",
          loading && "opacity-50 cursor-wait"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : isCurrent ? (
          "Current Plan"
        ) : isUpgrade ? (
          "Upgrade"
        ) : (
          "Downgrade"
        )}
      </button>
    </div>
  );
}

/* ─────────────────────── Payment Method Card ─────────────────────── */

function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  const brandIcons: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#F5F2E8] border border-[#D4CDB8] rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#DDD7C0] flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#6B5B4F]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#2D1810]">
            {method.cardBrand?.toUpperCase()} •••• {method.cardLast4}
          </p>
          <p className="text-xs text-[#6B5B4F]">
            Expires {method.cardExpMonth}/{method.cardExpYear}
          </p>
        </div>
      </div>
      {method.isDefault && (
        <span className="px-2 py-1 bg-[#9C4A29]/10 text-[#9C4A29] text-xs font-medium rounded">
          Default
        </span>
      )}
    </div>
  );
}

/* ─────────────────────── Invoice Row ─────────────────────── */

function InvoiceRow({ invoice }: { invoice: BillingInvoice }) {
  const statusColors: Record<string, string> = {
    paid: "text-emerald-400 bg-emerald-500/10",
    open: "text-amber-400 bg-amber-500/10",
    draft: "text-[#6B5B4F] bg-[#DDD7C0]",
    void: "text-[#8B7B6F] bg-[#F5F2E8]",
    uncollectible: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#D4CDB8]/50 last:border-0">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-[#2D1810]">
            {formatPrice(centsToAmount(invoice.amountDue), invoice.currency)}
          </p>
          <p className="text-xs text-[#6B5B4F]">
            {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "px-2 py-1 text-xs font-medium rounded capitalize",
            statusColors[invoice.status] || statusColors.draft
          )}
        >
          {invoice.status}
        </span>
        {invoice.invoicePdf && (
          <a
            href={invoice.invoicePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-[#6B5B4F] hover:text-[#2D1810] transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const stripeConfigured = isStripeConfigured();

  useEffect(() => {
    async function loadBillingData() {
      try {
        // In demo mode, use mock data
        const orgId = "00000000-0000-0000-0000-000000000001";
        
        const [sub, methods, invs] = await Promise.all([
          getSubscription(orgId),
          getPaymentMethods(orgId),
          getBillingInvoices(orgId),
        ]);

        setSubscription(sub);
        setPaymentMethods(methods);
        setInvoices(invs);
      } catch (error) {
        console.error("Failed to load billing data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (!stripeConfigured) {
      alert("Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable billing.");
      return;
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan?.stripePriceId) {
      alert("This plan is not available for purchase yet.");
      return;
    }

    setUpgradeLoading(planId);

    try {
      const result = await createCheckoutSession(
        "00000000-0000-0000-0000-000000000001",
        plan.stripePriceId,
        `${window.location.origin}/settings/billing?success=true`,
        `${window.location.origin}/settings/billing?canceled=true`
      );

      if ("url" in result) {
        window.location.href = result.url;
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleManageBilling = async () => {
    if (!stripeConfigured) {
      alert("Stripe is not configured.");
      return;
    }

    setPortalLoading(true);

    try {
      const result = await createPortalSession(
        "00000000-0000-0000-0000-000000000001",
        window.location.href
      );

      if ("url" in result) {
        window.location.href = result.url;
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C4A29]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px]">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm text-[#6B5B4F] hover:text-[#2D1810] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2D1810]">
            Billing & Subscription
          </h1>
          <p className="text-[#6B5B4F] text-sm mt-1">
            Manage your subscription and payment methods
          </p>
        </div>
        {stripeConfigured && subscription?.plan !== "free" && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#DDD7C0] text-[#2D1810] rounded-lg text-sm font-medium hover:bg-[#D4CDB8] transition-all"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Manage Billing
              </>
            )}
          </button>
        )}
      </div>

      {/* Stripe not configured warning */}
      {!stripeConfigured && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">Stripe Not Configured</p>
            <p className="text-xs text-amber-400/70 mt-1">
              Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to enable billing.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="mb-8 p-6 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9C4A29] to-[#a08c75] flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#E8E3CC]" />
            </div>
            <div>
              <p className="text-sm text-[#6B5B4F]">Current Plan</p>
              <p className="text-xl font-semibold text-[#2D1810] capitalize">
                {subscription?.plan || "Free"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#6B5B4F]">Status</p>
            <p className={cn(
              "text-sm font-medium capitalize",
              subscription?.status === "active" ? "text-emerald-400" : "text-amber-400"
            )}>
              {subscription?.status || "Active"}
            </p>
          </div>
        </div>
        {subscription?.currentPeriodEnd && (
          <p className="text-xs text-[#6B5B4F] mt-4">
            {subscription.cancelAtPeriodEnd
              ? `Your subscription will end on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              : `Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#2D1810] mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={subscription?.plan || "free"}
              onSelect={handleSelectPlan}
              loading={upgradeLoading === plan.id}
            />
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2D1810]">Payment Methods</h2>
          {stripeConfigured && (
            <button
              onClick={handleManageBilling}
              className="text-sm text-[#9C4A29] hover:text-[#B85A35] transition-colors"
            >
              Add Payment Method
            </button>
          )}
        </div>
        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard key={method.id} method={method} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl text-center">
            <CreditCard className="w-10 h-10 text-[#8B7B6F] mx-auto mb-3" />
            <p className="text-[#6B5B4F] text-sm">No payment methods on file</p>
            <p className="text-[#8B7B6F] text-xs mt-1">
              Add a payment method to upgrade your plan
            </p>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-lg font-semibold text-[#2D1810] mb-4">Billing History</h2>
        {invoices.length > 0 ? (
          <div className="bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl p-4">
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl text-center">
            <FileText className="w-10 h-10 text-[#8B7B6F] mx-auto mb-3" />
            <p className="text-[#6B5B4F] text-sm">No invoices yet</p>
            <p className="text-[#8B7B6F] text-xs mt-1">
              Your billing history will appear here
            </p>
          </div>
        )}
      </div>

      {/* Features Comparison */}
      <div className="mt-8 p-6 bg-[#F5F2E8] border border-[#D4CDB8] rounded-xl">
        <h2 className="text-lg font-semibold text-[#2D1810] mb-4">Why Upgrade?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#9C4A29]/10">
              <Users className="w-4 h-4 text-[#9C4A29]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2D1810]">Unlimited Users</p>
              <p className="text-xs text-[#6B5B4F] mt-1">
                Add your entire team without per-seat fees
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#9C4A29]/10">
              <Code className="w-4 h-4 text-[#9C4A29]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2D1810]">API Access</p>
              <p className="text-xs text-[#6B5B4F] mt-1">
                Connect Atlas to your other tools
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#9C4A29]/10">
              <Shield className="w-4 h-4 text-[#9C4A29]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2D1810]">Priority Support</p>
              <p className="text-xs text-[#6B5B4F] mt-1">
                Get help when you need it most
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
