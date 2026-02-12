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
  Development: "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20",
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
            i <= priority ? "fill-[#CDB49E] text-[#CDB49E]" : "text-[#2a2a2a]"
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
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#CDB49E]/30 hover:shadow-lg hover:shadow-[#CDB49E]/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      {/* Top: Name + Amount */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-[#f5f0eb] leading-tight pr-2">
          {lead.name}
        </h4>
        <span className="text-sm font-bold text-[#CDB49E] whitespace-nowrap">
          ${lead.amount.toLocaleString()}
        </span>
      </div>

      {/* Company */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Building2 className="w-3 h-3 text-[#555555]" />
        <span className="text-xs text-[#888888]">{lead.company}</span>
      </div>

      {/* Contact */}
      <p className="text-xs text-[#555555] mb-3">{lead.contact_name}</p>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                tagColors[tag] || "bg-[#222222] text-[#888888] border-[#2a2a2a]"
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom: Stars, Activity icons, Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
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
              <Clock className="w-3 h-3 text-[#2a2a2a]" />
            )}
          </div>
        </div>
        <div
          className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center border border-[#2a2a2a]"
          title={lead.assigned_to}
        >
          <span className="text-[9px] font-bold text-[#888888]">
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
  const color = stageColors[stage] || "#888888";

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Column Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#f5f0eb]">
              {stageLabels[stage]}
            </h3>
            <span className="text-[10px] font-medium text-[#555555] bg-[#222222] px-1.5 py-0.5 rounded">
              {leads.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium" style={{ color }}>
              {formatAmount(totalAmount)}
            </span>
            <button className="p-1 rounded text-[#555555] hover:text-[#f5f0eb] hover:bg-[#222222] transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-[#222222] overflow-hidden">
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
          <div className="border border-dashed border-[#2a2a2a] rounded-lg p-6 text-center">
            <p className="text-xs text-[#555555]">No leads</p>
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

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
            CRM Pipeline
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            Track and manage your sales opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Generate Leads Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGenerateMenu(!showGenerateMenu)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#888888] border border-[#2a2a2a] rounded-lg hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200"
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
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl shadow-black/40 z-20 py-1">
                  {["Import from CSV", "LinkedIn Import", "Email Scanner"].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setShowGenerateMenu(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-colors"
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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200">
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#888888] hover:text-[#f5f0eb]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={getLeadsByStage(stage)}
          />
        ))}
      </div>
    </div>
  );
}
