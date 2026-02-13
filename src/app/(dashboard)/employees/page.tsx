"use client";

import { useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  X,
  Mail,
  Phone,
  Clock,
  List,
  LayoutGrid,
  Calendar,
} from "lucide-react";
import { useEmployeesStore } from "@/stores/employees-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

/* ─────────── helpers ─────────── */

const tagStyles: Record<string, string> = {
  Manager: "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20",
  Employee: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Remote: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Executive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const statusBadge: Record<string, { label: string; style: string }> = {
  active: {
    label: "Active",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  on_leave: {
    label: "On Leave",
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  terminated: {
    label: "Terminated",
    style: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─────────── department sidebar ─────────── */

function DepartmentSidebar({
  departments,
  selected,
  onSelect,
  statusFilter,
  onStatusChange,
  statusCounts,
}: {
  departments: { name: string; count: number }[];
  selected: string;
  onSelect: (d: string) => void;
  statusFilter: string;
  onStatusChange: (s: string) => void;
  statusCounts: Record<string, number>;
}) {
  return (
    <div className="w-56 flex-shrink-0 space-y-6">
      {/* Department filter */}
      <div>
        <h3 className="text-[10px] font-semibold text-[#555555] uppercase tracking-widest mb-3">
          Department
        </h3>
        <div className="space-y-0.5">
          <button
            onClick={() => onSelect("")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
              !selected
                ? "bg-[#3a3028] text-[#CDB49E]"
                : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
            )}
          >
            <span>All</span>
            <span className="text-xs text-[#555555]">
              {departments.reduce((s, d) => s + d.count, 0)}
            </span>
          </button>
          {departments.map((d) => (
            <button
              key={d.name}
              onClick={() => onSelect(d.name)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
                selected === d.name
                  ? "bg-[#3a3028] text-[#CDB49E]"
                  : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
              )}
            >
              <span>{d.name}</span>
              <span className="text-xs text-[#555555]">{d.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div>
        <h3 className="text-[10px] font-semibold text-[#555555] uppercase tracking-widest mb-3">
          Status
        </h3>
        <div className="space-y-0.5">
          <button
            onClick={() => onStatusChange("")}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
              !statusFilter
                ? "bg-[#3a3028] text-[#CDB49E]"
                : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
            )}
          >
            <span>All</span>
          </button>
          {(["active", "on_leave", "terminated"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200",
                statusFilter === s
                  ? "bg-[#3a3028] text-[#CDB49E]"
                  : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
              )}
            >
              <span>{statusBadge[s].label}</span>
              <span className="text-xs text-[#555555]">
                {statusCounts[s] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ EMPLOYEES PAGE ═══════════════════════ */

export default function EmployeesPage() {
  const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";
  
  const {
    employees,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    filteredEmployees,
    fetchEmployees,
    loading,
  } = useEmployeesStore();

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees(DEMO_ORG_ID);
  }, [fetchEmployees]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const filtered = filteredEmployees();

  const departments = useMemo(() => {
    const deptMap: Record<string, number> = {};
    employees.forEach((e) => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });
    return Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach((e) => {
      map[e.status] = (map[e.status] || 0) + 1;
    });
    return map;
  }, [employees]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
            Employees
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            {filtered.length} of {employees.length} employees
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200">
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search employees..."
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

        <div className="flex items-center border border-[#2a2a2a] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200",
              viewMode === "grid"
                ? "bg-[#3a3028] text-[#CDB49E]"
                : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200",
              viewMode === "list"
                ? "bg-[#3a3028] text-[#CDB49E]"
                : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
            )}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <DepartmentSidebar
          departments={departments}
          selected={filters.department}
          onSelect={(d) => setFilter("department", d)}
          statusFilter={filters.status}
          onStatusChange={(s) => setFilter("status", s)}
          statusCounts={statusCounts}
        />

        {/* Content */}
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-16 text-[#888888] text-sm">
                  No employees found
                </div>
              ) : (
                filtered.map((emp) => {
                  const sb = statusBadge[emp.status];
                  return (
                    <div
                      key={emp.id}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#CDB49E]/25 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#2a2a2a] group-hover:border-[#CDB49E]/30 transition-colors duration-200"
                          style={{ backgroundColor: emp.avatar_color + "18" }}
                        >
                          <span
                            className="text-lg font-bold"
                            style={{ color: emp.avatar_color }}
                          >
                            {getInitials(emp.name)}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="text-sm font-semibold text-[#f5f0eb]">
                                {emp.name}
                              </h3>
                              <p className="text-xs text-[#888888]">
                                {emp.job_title}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                sb.style
                              )}
                            >
                              {sb.label}
                            </span>
                          </div>

                          <div className="mt-2.5 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-[#888888]">
                              <Mail className="w-3 h-3 text-[#555555]" />
                              <span className="truncate">{emp.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#888888]">
                              <Phone className="w-3 h-3 text-[#555555]" />
                              <span>{emp.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#888888]">
                              <Calendar className="w-3 h-3 text-[#555555]" />
                              <span>{formatDate(emp.start_date)}</span>
                            </div>
                          </div>

                          {/* Tags + Activity */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#2a2a2a]">
                            <div className="flex flex-wrap gap-1">
                              {emp.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                    tagStyles[tag] ||
                                      "bg-[#222222] text-[#888888] border-[#2a2a2a]"
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <Clock className="w-3.5 h-3.5 text-[#555555] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                      Employee
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                      Department
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                      Phone
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                      Start Date
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center text-[#888888] text-sm"
                      >
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp, i) => {
                      const sb = statusBadge[emp.status];
                      return (
                        <tr
                          key={emp.id}
                          className={cn(
                            "hover:bg-[#222222] transition-colors duration-150 cursor-pointer border-b border-[#2a2a2a]/50 last:border-0",
                            i % 2 === 1 && "bg-[#111111]/40"
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: emp.avatar_color + "18",
                                }}
                              >
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: emp.avatar_color }}
                                >
                                  {getInitials(emp.name)}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-[#f5f0eb]">
                                  {emp.name}
                                </span>
                                <p className="text-[11px] text-[#888888]">
                                  {emp.job_title}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#888888]">
                            {emp.department}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#888888]">
                            {emp.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#888888]">
                            {emp.phone}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#888888]">
                            {formatDate(emp.start_date)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-[11px] font-medium border",
                                sb.style
                              )}
                            >
                              {sb.label}
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
      </div>
    </div>
  );
}
