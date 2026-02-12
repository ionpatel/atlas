"use client";

import { useState } from "react";
import {
  Settings,
  Building2,
  Users,
  CreditCard,
  Puzzle,
  Link2,
  Receipt,
  Upload,
  Crown,
  Shield,
  UserCog,
  User,
  Plus,
  Check,
  ChevronRight,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────── tab definitions ─────────────────────── */

const tabs = [
  { id: "general", label: "General", icon: Building2 },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "modules", label: "Modules", icon: Puzzle },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "tax", label: "Tax Settings", icon: Receipt },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ─────────────────────── mock data ─────────────────────── */

const mockMembers = [
  {
    name: "Harshil Patel",
    email: "harshil@atlas-erp.com",
    role: "owner" as const,
    avatar: "HP",
  },
  {
    name: "Sarah Chen",
    email: "sarah@atlas-erp.com",
    role: "admin" as const,
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    email: "marcus@atlas-erp.com",
    role: "manager" as const,
    avatar: "MJ",
  },
  {
    name: "Emily Davis",
    email: "emily@atlas-erp.com",
    role: "staff" as const,
    avatar: "ED",
  },
];

const mockModules = [
  { name: "Inventory", description: "Product & stock management", enabled: true },
  { name: "Invoicing", description: "Billing & receivables", enabled: true },
  { name: "Contacts", description: "CRM & contact management", enabled: true },
  { name: "AI Assistant", description: "Natural language queries", enabled: true },
  { name: "Accounting", description: "General ledger & reports", enabled: false },
  { name: "Sales", description: "Quotations & pipeline", enabled: false },
  { name: "Purchase", description: "Purchase orders", enabled: false },
  { name: "Employees", description: "HR directory", enabled: false },
  { name: "Payroll", description: "Salary management", enabled: false },
  { name: "Projects", description: "Task boards & timesheets", enabled: false },
  { name: "Helpdesk", description: "Support tickets", enabled: false },
  { name: "Email Marketing", description: "Campaigns & analytics", enabled: false },
];

const mockIntegrations = [
  {
    name: "Stripe",
    description: "Payment processing & subscriptions",
    status: "available" as const,
    color: "bg-violet-500/10",
    textColor: "text-violet-400",
  },
  {
    name: "QuickBooks",
    description: "Accounting sync & reconciliation",
    status: "available" as const,
    color: "bg-emerald-500/10",
    textColor: "text-emerald-400",
  },
  {
    name: "Shopify",
    description: "E-commerce order sync",
    status: "available" as const,
    color: "bg-[#3a3028]",
    textColor: "text-[#CDB49E]",
  },
  {
    name: "Mailchimp",
    description: "Email marketing automation",
    status: "available" as const,
    color: "bg-blue-500/10",
    textColor: "text-blue-400",
  },
];

const mockTaxRates = [
  { name: "GST", rate: 5, number: "" },
  { name: "HST (Ontario)", rate: 13, number: "" },
  { name: "PST (BC)", rate: 7, number: "" },
];

/* ─────────────────────── role badge ─────────────────────── */

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    owner: "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20",
    admin: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    manager: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    staff: "bg-[#222222] text-[#888888] border-[#2a2a2a]",
  };

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    owner: Crown,
    admin: Shield,
    manager: UserCog,
    staff: User,
  };

  const Icon = icons[role] || User;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[role] || styles.staff}`}
    >
      <Icon className="w-3 h-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

/* ─────────────────────── toggle switch ─────────────────────── */

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex-shrink-0 focus:outline-none"
    >
      {enabled ? (
        <ToggleRight className="w-8 h-8 text-[#CDB49E]" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-[#555555]" />
      )}
    </button>
  );
}

/* ─────────────────────── section components ─────────────────────── */

function GeneralSection() {
  const [orgName, setOrgName] = useState("Atlas Demo");
  const [orgSlug, setOrgSlug] = useState("atlas-demo");
  const [timezone, setTimezone] = useState("America/Toronto");
  const [currency, setCurrency] = useState("CAD");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#f5f0eb]">General</h2>
        <p className="text-sm text-[#888888] mt-1">
          Manage your organization settings.
        </p>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-[#f5f0eb] mb-3">
          Organization Logo
        </label>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-[#222222] border-2 border-dashed border-[#2a2a2a] flex items-center justify-center">
            <span className="text-2xl font-bold text-[#CDB49E]">A</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200">
            <Upload className="w-4 h-4" />
            Upload Logo
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wider mb-2">
            Organization Name
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:border-[#CDB49E]/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wider mb-2">
            Slug
          </label>
          <input
            type="text"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:border-[#CDB49E]/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wider mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:border-[#CDB49E]/40 transition-colors"
          >
            <option value="America/Toronto">America/Toronto (EST)</option>
            <option value="America/Vancouver">America/Vancouver (PST)</option>
            <option value="America/Edmonton">America/Edmonton (MST)</option>
            <option value="America/Winnipeg">America/Winnipeg (CST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#888888] uppercase tracking-wider mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:border-[#CDB49E]/40 transition-colors"
          >
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-[#2a2a2a]">
        <button className="px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function UsersSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#f5f0eb]">
            Users &amp; Roles
          </h2>
          <p className="text-sm text-[#888888] mt-1">
            Manage team members and their permissions.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {mockMembers.map((member, i) => (
          <div
            key={member.email}
            className={cn(
              "px-6 py-4 flex items-center justify-between transition-colors hover:bg-[#222222]/50",
              i < mockMembers.length - 1 && "border-b border-[#2a2a2a]/50"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#222222] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#CDB49E]">
                  {member.avatar}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#f5f0eb]">
                  {member.name}
                </p>
                <p className="text-xs text-[#888888] mt-0.5">
                  {member.email}
                </p>
              </div>
            </div>
            <RoleBadge role={member.role} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#f5f0eb]">Billing</h2>
        <p className="text-sm text-[#888888] mt-1">
          Manage your subscription and usage.
        </p>
      </div>

      {/* Current plan */}
      <div className="bg-[#1a1a1a] border border-[#CDB49E]/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-[#f5f0eb]">
                Business Plan
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#3a3028] text-[#CDB49E] text-[10px] font-semibold uppercase tracking-wider">
                Current
              </span>
            </div>
            <p className="text-sm text-[#888888]">
              $49/month · Billed monthly
            </p>
          </div>
          <button className="px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200">
            Change Plan
          </button>
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Users", used: 4, limit: 10 },
          { label: "Products", used: 48, limit: 500 },
          { label: "Invoices / mo", used: 23, limit: 200 },
        ].map((stat) => {
          const pct = (stat.used / stat.limit) * 100;
          return (
            <div
              key={stat.label}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5"
            >
              <p className="text-xs text-[#888888] uppercase tracking-wider mb-3">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-[#f5f0eb]">
                {stat.used}{" "}
                <span className="text-sm font-normal text-[#555555]">
                  / {stat.limit}
                </span>
              </p>
              <div className="mt-3 h-1.5 bg-[#222222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#CDB49E] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            name: "Starter",
            price: "$19",
            features: ["3 users", "100 products", "50 invoices/mo"],
            current: false,
          },
          {
            name: "Business",
            price: "$49",
            features: [
              "10 users",
              "500 products",
              "200 invoices/mo",
              "All integrations",
            ],
            current: true,
          },
          {
            name: "Enterprise",
            price: "$149",
            features: [
              "Unlimited users",
              "Unlimited products",
              "Unlimited invoices",
              "Priority support",
              "Custom modules",
            ],
            current: false,
          },
        ].map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "bg-[#1a1a1a] border rounded-xl p-5",
              plan.current
                ? "border-[#CDB49E]/30"
                : "border-[#2a2a2a]"
            )}
          >
            <h4 className="text-sm font-semibold text-[#f5f0eb]">
              {plan.name}
            </h4>
            <p className="text-2xl font-bold text-[#f5f0eb] mt-1">
              {plan.price}
              <span className="text-sm font-normal text-[#555555]">
                /mo
              </span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-xs text-[#888888]"
                >
                  <Check className="w-3 h-3 text-[#CDB49E]" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.current && (
              <div className="mt-4 text-center text-[11px] font-medium text-[#CDB49E]">
                Current plan
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModulesSection() {
  const [modules, setModules] = useState(mockModules);

  const toggleModule = (index: number) => {
    setModules((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, enabled: !m.enabled } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#f5f0eb]">Modules</h2>
        <p className="text-sm text-[#888888] mt-1">
          Enable or disable modules for your organization.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {modules.map((mod, i) => (
          <div
            key={mod.name}
            className={cn(
              "px-6 py-4 flex items-center justify-between",
              i < modules.length - 1 && "border-b border-[#2a2a2a]/50"
            )}
          >
            <div>
              <p className="text-sm font-medium text-[#f5f0eb]">
                {mod.name}
              </p>
              <p className="text-xs text-[#888888] mt-0.5">
                {mod.description}
              </p>
            </div>
            <ToggleSwitch
              enabled={mod.enabled}
              onToggle={() => toggleModule(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#f5f0eb]">Integrations</h2>
        <p className="text-sm text-[#888888] mt-1">
          Connect third-party services to your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockIntegrations.map((integration) => (
          <div
            key={integration.name}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-start justify-between hover:border-[#CDB49E]/20 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-xl flex-shrink-0",
                  integration.color
                )}
              >
                <Link2
                  className={cn("w-5 h-5", integration.textColor)}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#f5f0eb]">
                  {integration.name}
                </p>
                <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                  {integration.description}
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2a2a2a] rounded-lg text-[11px] font-medium text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all duration-200 flex-shrink-0 ml-4">
              Connect
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxSection() {
  const [taxRates, setTaxRates] = useState(mockTaxRates);
  const [businessNumber, setBusinessNumber] = useState("");

  const updateTaxNumber = (index: number, value: string) => {
    setTaxRates((prev) =>
      prev.map((t, i) => (i === index ? { ...t, number: value } : t))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#f5f0eb]">Tax Settings</h2>
        <p className="text-sm text-[#888888] mt-1">
          Configure tax rates and registration numbers.
        </p>
      </div>

      {/* Business number */}
      <div>
        <label className="block text-xs font-medium text-[#888888] uppercase tracking-wider mb-2">
          Business / GST Number
        </label>
        <input
          type="text"
          value={businessNumber}
          onChange={(e) => setBusinessNumber(e.target.value)}
          placeholder="e.g. 123456789 RT0001"
          className="w-full max-w-md px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder-[#555555] focus:outline-none focus:border-[#CDB49E]/40 transition-colors"
        />
      </div>

      {/* Tax rates */}
      <div>
        <h3 className="text-sm font-medium text-[#f5f0eb] mb-4">
          Tax Rates
        </h3>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {taxRates.map((tax, i) => (
            <div
              key={tax.name}
              className={cn(
                "px-6 py-4 flex items-center justify-between gap-4",
                i < taxRates.length - 1 && "border-b border-[#2a2a2a]/50"
              )}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div>
                  <p className="text-sm font-medium text-[#f5f0eb]">
                    {tax.name}
                  </p>
                  <p className="text-xs text-[#888888] mt-0.5">
                    {tax.rate}%
                  </p>
                </div>
              </div>
              <input
                type="text"
                value={tax.number}
                onChange={(e) => updateTaxNumber(i, e.target.value)}
                placeholder="Tax registration #"
                className="w-52 px-3 py-2 bg-[#222222] border border-[#2a2a2a] rounded-lg text-xs text-[#f5f0eb] placeholder-[#555555] focus:outline-none focus:border-[#CDB49E]/40 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#2a2a2a]">
        <button className="px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200">
          Save Tax Settings
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── section map ─────────────────────── */

const sectionComponents: Record<TabId, React.ComponentType> = {
  general: GeneralSection,
  users: UsersSection,
  billing: BillingSection,
  modules: ModulesSection,
  integrations: IntegrationsSection,
  tax: TaxSection,
};

/* ════════════════════════ SETTINGS PAGE ════════════════════════ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const ActiveSection = sectionComponents[activeTab];

  return (
    <div className="max-w-[1400px]">
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
          Settings
        </h1>
        <p className="text-[#888888] text-sm mt-1">
          Configure your organization and workspace.
        </p>
      </div>

      {/* ── Layout: sidebar tabs + content ── */}
      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="w-56 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 text-left",
                  isActive
                    ? "bg-[#CDB49E] text-[#111111]"
                    : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
                )}
              >
                <tab.icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    isActive && "text-[#111111]"
                  )}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <ActiveSection />
        </div>
      </div>
    </div>
  );
}
