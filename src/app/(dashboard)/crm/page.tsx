"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  X,
  Star,
  Phone,
  Mail,
  Clock,
  Building2,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useCRMStore } from "@/stores/crm-store";
import { cn } from "@/lib/utils";
import { ActivityTimeline, mockActivities } from "@/components/crm/activity-timeline";

/* ─────────── helpers ─────────── */

const STAGES = ["new", "qualified", "proposition", "won"] as const;

const stageLabels: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  proposition: "Proposition",
  won: "Won",
};

const stageColors: Record<string, string> = {
  new: "#60a5fa",
  qualified: "#fbbf24",
  proposition: "#a78bfa",
  won: "#34d399",
};

const tagColors: Record<string, string> = {
  Enterprise: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Software: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Cloud: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Web: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Support: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Healthcare: "bg-red-500/10 text-red-400 border-red-500/20",
  Mobile: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Development: "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA] border-[#262626]/20",
  Analytics: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  SaaS: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Productivity: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Security: "bg-red-500/10 text-red-400 border-red-500/20",
  Compliance: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  HR: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Integration: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "E-commerce": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function formatAmount(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

/* ─────────── components ─────────── */

function StarRating({ priority }: { priority: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i <= priority ? "fill-[#CDB49E] text-[#FAFAFA]" : "text-[#0A0A0A]"
          )}
        />
      ))}
    </div>
  );
}

function LeadCard({
  lead,
}: {
  lead: {
    id: string;
    name: string;
    amount: number;
    company: string;
    contact_name: string;
    tags: string[];
    priority: number;
    assigned_to: string;
    next_activity?: string;
  };
}) {
  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 hover:border-[#262626]/30 hover:shadow-lg hover:shadow-[#CDB49E]/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      {/* Top: Name + Amount */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-[#FAFAFA] leading-tight pr-2">
          {lead.name}
        </h4>
        <span className="text-sm font-bold text-[#FAFAFA] whitespace-nowrap">
          ${lead.amount.toLocaleString()}
        </span>
      </div>

      {/* Company */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Building2 className="w-3 h-3 text-[#FAFAFA]" />
        <span className="text-xs text-[#FAFAFA]">{lead.company}</span>
      </div>

      {/* Contact */}
      <p className="text-xs text-[#FAFAFA] mb-3">{lead.contact_name}</p>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                tagColors[tag] || "bg-[#0A0A0A] text-[#FAFAFA] border-[#262626]"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom: Stars, Activity icons, Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
        <div className="flex items-center gap-3">
          <StarRating priority={lead.priority} />
          <div className="flex items-center gap-1.5">
            {lead.next_activity === "call" && (
              <Phone className="w-3 h-3 text-[#60a5fa]" />
            )}
            {lead.next_activity === "email" && (
              <Mail className="w-3 h-3 text-[#34d399]" />
            )}
            {lead.next_activity === "meeting" && (
              <Clock className="w-3 h-3 text-[#fbbf24]" />
            )}
            {!lead.next_activity && (
              <Clock className="w-3 h-3 text-[#0A0A0A]" />
            )}
          </div>
        </div>
        <div
          className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center border border-[#262626]"
          title={lead.assigned_to}
        >
          <span className="text-[9px] font-bold text-[#FAFAFA]">
            {getInitials(lead.assigned_to)}
          </span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
}: {
  stage: string;
  leads: Array<{
    id: string;
    name: string;
    amount: number;
    company: string;
    contact_name: string;
    tags: string[];
    priority: number;
    assigned_to: string;
    next_activity?: string;
  }>;
}) {
  const totalAmount = leads.reduce((sum, l) => sum + l.amount, 0);
  const color = stageColors[stage] || "#CDB49E";

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Column Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA]">
              {stageLabels[stage]}
            </h3>
            <span className="text-[10px] font-medium text-[#FAFAFA] bg-[#0A0A0A] px-1.5 py-0.5 rounded">
              {leads.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color }}>
              {formatAmount(totalAmount)}
            </span>
            <button className="p-1 rounded text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-[#0A0A0A] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (leads.length / 4) * 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className="border border-dashed border-[#262626] rounded-lg p-6 text-center">
            <p className="text-xs text-[#FAFAFA]">No leads</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ CRM PAGE ═══════════════════════ */

export default function CRMPage() {
  const { searchQuery, setSearchQuery, getLeadsByStage } = useCRMStore();
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(true);

  return (
    <div className="space-y-6 max-w-[1800px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            CRM Pipeline
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            Track and manage your sales opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Activity Panel Toggle */}
          <button
            onClick={() => setShowActivityPanel(!showActivityPanel)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-lg transition-all duration-200",
              showActivityPanel
                ? "border-[#262626]/30 text-[#FAFAFA] bg-[rgba(156,74,41,0.15)]/50"
                : "border-[#262626] text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            )}
          >
            <Clock className="w-4 h-4" />
            Activity
          </button>

          {/* Generate Leads Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGenerateMenu(!showGenerateMenu)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#FAFAFA] border border-[#262626] rounded-lg hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              Generate Leads
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showGenerateMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowGenerateMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#0A0A0A] border border-[#262626] rounded-lg shadow-xl shadow-black/40 z-20 py-1">
                  {["Import from CSV", "LinkedIn Import", "Email Scanner"].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setShowGenerateMenu(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-colors"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* New Button */}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200">
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#262626]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#FAFAFA]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#FAFAFA] placeholder:text-[#FAFAFA]/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#FAFAFA] hover:text-[#FAFAFA]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Kanban + Activity Panel */}
      <div className="flex gap-6">
        {/* Kanban Board */}
        <div className={cn(
          "flex gap-4 overflow-x-auto pb-4 transition-all duration-300",
          showActivityPanel ? "flex-1" : "w-full"
        )}>
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={getLeadsByStage(stage)}
            />
          ))}
        </div>

        {/* Activity Timeline Panel */}
        {showActivityPanel && (
          <div className="w-80 flex-shrink-0 bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 h-[calc(100vh-280px)] sticky top-4">
            <ActivityTimeline
              activities={mockActivities}
              onAddActivity={() => {
                // TODO: Open activity form
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
