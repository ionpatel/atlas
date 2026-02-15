"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  Package,
  FileText,
  ShoppingCart,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  Calendar,
  BarChart3,
  Settings,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { sendTestEmail } from "@/lib/email";

/* ─────────────────────── types ─────────────────────── */

type DigestFrequency = "instant" | "daily" | "weekly";

interface NotificationPreferences {
  low_stock_alerts: boolean;
  invoice_reminders: boolean;
  new_orders: boolean;
  email_digest: DigestFrequency;
}

/* ─────────────────────── toggle switch ─────────────────────── */

function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:ring-offset-2 focus:ring-offset-white",
        enabled ? "bg-white" : "bg-[#F8F9FA]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

/* ─────────────────────── notification row ─────────────────────── */

interface NotificationRowProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function NotificationRow({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  enabled,
  onToggle,
  disabled,
}: NotificationRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#E5E7EB]/50 last:border-0">
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-lg", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#111827]">{title}</h3>
          <p className="text-xs text-[#111827] mt-0.5">{description}</p>
        </div>
      </div>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} disabled={disabled} />
    </div>
  );
}

/* ─────────────────────── digest selector ─────────────────────── */

interface DigestSelectorProps {
  value: DigestFrequency;
  onChange: (value: DigestFrequency) => void;
  disabled?: boolean;
}

function DigestSelector({ value, onChange, disabled }: DigestSelectorProps) {
  const options: { id: DigestFrequency; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    {
      id: "instant",
      label: "Instant",
      icon: Bell,
      description: "Get notified immediately",
    },
    {
      id: "daily",
      label: "Daily",
      icon: Calendar,
      description: "One email per day at 9 AM",
    },
    {
      id: "weekly",
      label: "Weekly",
      icon: BarChart3,
      description: "Summary every Monday",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            value === option.id
              ? "bg-[rgba(156,74,41,0.15)] border-[#E5E7EB]/30 text-[#111827]"
              : "bg-[#F8F9FA] border-[#E5E7EB] text-[#374151] hover:text-[#111827] hover:border-[#3a3a3a]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <option.icon className="w-5 h-5" />
          <span className="text-sm font-medium">{option.label}</span>
          <span className="text-[10px] text-center opacity-70">{option.description}</span>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────── test email modal ─────────────────────── */

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function TestEmailModal({ isOpen, onClose }: TestEmailModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSend = async () => {
    if (!email) return;
    
    setStatus("sending");
    setErrorMessage("");

    try {
      const result = await sendTestEmail(email);
      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          onClose();
          setStatus("idle");
          setEmail("");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to send test email");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Send Test Email</h3>
            <p className="text-xs text-[#111827]">Verify your email configuration</p>
          </div>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-sm text-[#111827]">Test email sent successfully!</p>
            <p className="text-xs text-[#111827] mt-1">Check your inbox</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#111827] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E5E7EB]/40 transition-colors"
                disabled={status === "sending"}
              />
            </div>

            {status === "error" && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{errorMessage}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
                disabled={status === "sending"}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!email || status === "sending"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Test
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    low_stock_alerts: true,
    invoice_reminders: true,
    new_orders: true,
    email_digest: "instant",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load preferences
  useEffect(() => {
    async function loadPreferences() {
      const supabase = createClient();
      
      // Check if we're in demo mode
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      // Get org_id from org_members
      const { data: membership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        setLoading(false);
        return;
      }

      // Load preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("org_id", membership.org_id)
        .single();

      if (prefs) {
        setPreferences({
          low_stock_alerts: prefs.low_stock_alerts,
          invoice_reminders: prefs.invoice_reminders,
          new_orders: prefs.new_orders,
          email_digest: prefs.email_digest,
        });
      }

      setLoading(false);
    }

    loadPreferences();
  }, []);

  // Save preferences
  const handleSave = async () => {
    if (isDemoMode) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return;
    }

    setSaving(true);
    setSaveStatus("idle");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setSaveStatus("error");
      setSaving(false);
      return;
    }

    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      setSaveStatus("error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        org_id: membership.org_id,
        ...preferences,
      }, {
        onConflict: "user_id,org_id",
      });

    if (error) {
      console.error("Failed to save preferences:", error);
      setSaveStatus("error");
    } else {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }

    setSaving(false);
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | DigestFrequency) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#111827]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-[#374151] hover:text-[#111827] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[rgba(156,74,41,0.15)]">
            <Bell className="w-5 h-5 text-[#111827]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Email Notifications
          </h1>
        </div>
        <p className="text-[#111827] text-sm">
          Choose which email notifications you'd like to receive.
        </p>
      </div>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-400">Demo Mode</p>
            <p className="text-xs text-blue-400/70 mt-0.5">
              Preferences are saved locally. Connect Supabase to persist settings.
            </p>
          </div>
        </div>
      )}

      {/* Alert Types */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl mb-6">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Alert Notifications
          </h2>
          <p className="text-xs text-[#111827] mt-1">
            Get notified about important events in your business.
          </p>
        </div>
        <div className="px-6">
          <NotificationRow
            icon={Package}
            iconColor="text-orange-400"
            iconBg="bg-orange-500/10"
            title="Low Stock Alerts"
            description="Get notified when products fall below minimum stock levels"
            enabled={preferences.low_stock_alerts}
            onToggle={() => updatePreference("low_stock_alerts", !preferences.low_stock_alerts)}
          />
          <NotificationRow
            icon={FileText}
            iconColor="text-blue-400"
            iconBg="bg-blue-500/10"
            title="Invoice Reminders"
            description="Reminders at 7 days, 3 days before due, and when overdue"
            enabled={preferences.invoice_reminders}
            onToggle={() => updatePreference("invoice_reminders", !preferences.invoice_reminders)}
          />
          <NotificationRow
            icon={ShoppingCart}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
            title="New Orders"
            description="Get notified when you receive a new order"
            enabled={preferences.new_orders}
            onToggle={() => updatePreference("new_orders", !preferences.new_orders)}
          />
        </div>
      </div>

      {/* Digest Frequency */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl mb-6">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            Email Digest Frequency
          </h2>
          <p className="text-xs text-[#111827] mt-1">
            How often should we send you summary emails?
          </p>
        </div>
        <div className="p-6">
          <DigestSelector
            value={preferences.email_digest}
            onChange={(value) => updatePreference("email_digest", value)}
          />
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl mb-6">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F8F9FA]">
              <Mail className="w-5 h-5 text-[#111827]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#111827]">Test Email Configuration</h3>
              <p className="text-xs text-[#111827] mt-0.5">
                Send a test email to verify your setup is working
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
          >
            <Send className="w-4 h-4" />
            Send Test
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-400">
              <XCircle className="w-4 h-4" />
              Failed to save
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>

      {/* Test Email Modal */}
      <TestEmailModal isOpen={showTestModal} onClose={() => setShowTestModal(false)} />
    </div>
  );
}
