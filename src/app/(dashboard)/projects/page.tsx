"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  X,
  Star,
  ChevronDown,
  List,
  LayoutGrid,
  Flag,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";
import { useProjectsStore } from "@/stores/projects-store";
import { cn } from "@/lib/utils";

/* ─────────── helpers ─────────── */

const tagStyles: Record<string, string> = {
  Architecture: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Internal: "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA] border-[#262626]/20",
  External: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Development: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cloud: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Web: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Mobile: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Compliance: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HR: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Security: "bg-red-500/10 text-red-400 border-red-500/20",
  "E-commerce": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const statusConfig: Record<
  string,
  { label: string; color: string; border: string }
> = {
  on_track: { label: "On Track", color: "#34d399", border: "border-l-emerald-400" },
  at_risk: { label: "At Risk", color: "#fbbf24", border: "border-l-amber-400" },
  off_track: { label: "Off Track", color: "#f87171", border: "border-l-red-400" },
  done: { label: "Done", color: '#FAFAFA', border: "border-l-[#CDB49E]" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
  });
}

/* ═══════════════════════ PROJECTS PAGE ═══════════════════════ */

export default function ProjectsPage() {
  const {
    searchQuery,
    setSearchQuery,
    filteredProjects,
    toggleFavorite,
    filters,
    setFilter,
  } = useProjectsStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const filtered = filteredProjects();

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Projects
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            {filtered.length} projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* New Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showNewMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNewMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#0A0A0A] border border-[#262626] rounded-lg shadow-xl shadow-black/40 z-20 py-1">
                  {["Blank Project", "From Template", "Import"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setShowNewMenu(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search + Filter + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#262626]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#FAFAFA]" />
          <input
            type="text"
            placeholder="Search projects..."
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

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
          className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 transition-colors cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="off_track">Off Track</option>
          <option value="done">Done</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center border border-[#262626] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200",
              viewMode === "grid"
                ? "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA]"
                : "text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200",
              viewMode === "list"
                ? "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA]"
                : "text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            )}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-[#FAFAFA] text-sm">
              No projects found
            </div>
          ) : (
            filtered.map((proj) => {
              const sc = statusConfig[proj.status];
              return (
                <div
                  key={proj.id}
                  className={cn(
                    "bg-[#0A0A0A] border border-[#262626] border-l-4 rounded-xl p-5 hover:border-[#262626]/25 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer group",
                    sc.border
                  )}
                >
                  {/* Top: Star + Name */}
                  <div className="flex items-start gap-2 mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(proj.id);
                      }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      <Star
                        className={cn(
                          "w-4 h-4 transition-colors duration-200",
                          proj.is_favorite
                            ? "fill-[#CDB49E] text-[#FAFAFA]"
                            : "text-[#0A0A0A] hover:text-[#FAFAFA]"
                        )}
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#FAFAFA] leading-tight">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3 h-3 text-[#FAFAFA]" />
                        <span className="text-xs text-[#FAFAFA]">
                          {proj.customer}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calendar className="w-3 h-3 text-[#FAFAFA]" />
                    <span className="text-[11px] text-[#FAFAFA]">
                      {formatDateShort(proj.start_date)} —{" "}
                      {formatDateShort(proj.end_date)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                          tagStyles[tag] ||
                            "bg-[#0A0A0A] text-[#FAFAFA] border-[#262626]"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom: Tasks, Milestones, Status, Avatars */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                    <div className="flex items-center gap-3">
                      {/* Tasks */}
                      <span className="text-xs font-medium text-emerald-400">
                        {proj.task_count} Tasks
                      </span>
                      {/* Milestones */}
                      <span className="flex items-center gap-1 text-xs text-[#FAFAFA]">
                        <Flag className="w-3 h-3" />
                        {proj.milestone_progress}
                      </span>
                      {/* Time */}
                      <Clock className="w-3 h-3 text-[#FAFAFA]" />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status dot */}
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sc.color }}
                        title={sc.label}
                      />
                      {/* Assignee avatars (stacked, max 2) */}
                      <div className="flex -space-x-2">
                        {proj.assigned_to.slice(0, 2).map((name, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-[#262626] flex items-center justify-center"
                            title={name}
                          >
                            <span className="text-[8px] font-bold text-[#FAFAFA]">
                              {getInitials(name)}
                            </span>
                          </div>
                        ))}
                        {proj.assigned_to.length > 2 && (
                          <div className="w-6 h-6 rounded-full bg-[#0A0A0A] border-2 border-[#262626] flex items-center justify-center">
                            <span className="text-[8px] font-bold text-[#FAFAFA]">
                              +{proj.assigned_to.length - 2}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="w-8 px-4 py-4" />
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                  Project
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                  Customer
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                  Tasks
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                  Milestones
                </th>
                <th className="text-left px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                  Timeline
                </th>
                <th className="text-right px-4 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-[#FAFAFA] text-sm"
                  >
                    No projects found
                  </td>
                </tr>
              ) : (
                filtered.map((proj, i) => {
                  const sc = statusConfig[proj.status];
                  return (
                    <tr
                      key={proj.id}
                      className={cn(
                        "hover:bg-[#0A0A0A] transition-colors duration-150 cursor-pointer border-b border-[#262626]/50 last:border-0",
                        i % 2 === 1 && "bg-[#0A0A0A]/40"
                      )}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleFavorite(proj.id)}
                        >
                          <Star
                            className={cn(
                              "w-3.5 h-3.5",
                              proj.is_favorite
                                ? "fill-[#CDB49E] text-[#FAFAFA]"
                                : "text-[#0A0A0A] hover:text-[#FAFAFA]"
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-[#FAFAFA]">
                          {proj.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#FAFAFA]">
                        {proj.customer}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-emerald-400">
                          {proj.task_count}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-sm text-[#FAFAFA]">
                          <Flag className="w-3 h-3" />
                          {proj.milestone_progress}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#FAFAFA]">
                        {formatDateShort(proj.start_date)} —{" "}
                        {formatDateShort(proj.end_date)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="flex items-center justify-end gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sc.color }}
                          />
                          <span className="text-xs text-[#FAFAFA]">
                            {sc.label}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
