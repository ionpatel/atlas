"use client";

import { useState, useEffect, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  User,
  FileText,
  Package,
  Users,
  DollarSign,
  Settings,
  ArrowRight,
  X,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchAuditLogs,
  exportToCSV,
  calculateDiff,
  formatValue,
  TABLE_TO_MODULE,
  type AuditLog,
  type AuditAction,
} from "@/lib/audit";

/* ─────────────────────── Constants ─────────────────────── */

const ACTION_LABELS: Record<AuditAction, { label: string; color: string; icon: typeof Plus }> = {
  create: { label: "Created", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Plus },
  update: { label: "Updated", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Pencil },
  delete: { label: "Deleted", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: Trash2 },
};

const MODULE_ICONS: Record<string, typeof Package> = {
  Inventory: Package,
  Invoices: FileText,
  Contacts: Users,
  Employees: User,
  Payroll: DollarSign,
  Settings: Settings,
  Sales: FileText,
  Purchase: FileText,
  Bills: FileText,
  Accounting: DollarSign,
  CRM: Users,
  Projects: FileText,
};

/* ─────────────────────── Helper Components ─────────────────────── */

function ActionBadge({ action }: { action: AuditAction }) {
  const config = ACTION_LABELS[action];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
        config.color
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function ModuleBadge({ tableName }: { tableName: string }) {
  const moduleName = TABLE_TO_MODULE[tableName] || tableName;
  const Icon = MODULE_ICONS[moduleName] || FileText;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D8CAC0] text-[#4A5654] text-[11px] font-medium border border-[#C9BAB0]">
      <Icon className="w-3 h-3" />
      {moduleName}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) return "Just now";
  // Less than 1 hour
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  // Less than 24 hours
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  // Less than 7 days
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────── Expandable Row ─────────────────────── */

function AuditLogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);

  const diff = useMemo(
    () => calculateDiff(log.old_values, log.new_values),
    [log.old_values, log.new_values]
  );

  const hasChanges = diff.changed.length > 0 || diff.added.length > 0 || diff.removed.length > 0;

  return (
    <div className="border-b border-[#C9BAB0]/50 last:border-b-0">
      {/* Main Row */}
      <div
        className={cn(
          "px-6 py-4 flex items-center gap-4 transition-colors",
          hasChanges && "cursor-pointer hover:bg-[#D8CAC0]/50"
        )}
        onClick={() => hasChanges && setExpanded(!expanded)}
      >
        {/* Expand icon */}
        <div className="w-5 flex-shrink-0">
          {hasChanges ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-[#4A5654]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#4A5654]" />
            )
          ) : null}
        </div>

        {/* Date */}
        <div className="w-28 flex-shrink-0">
          <p className="text-sm text-[#1A2726]">{formatDate(log.created_at)}</p>
          <p className="text-[10px] text-[#6B7876] mt-0.5">
            {new Date(log.created_at).toLocaleTimeString("en-CA", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* User */}
        <div className="w-40 flex-shrink-0">
          <p className="text-sm text-[#1A2726] truncate">
            {log.user_email?.split("@")[0] || "System"}
          </p>
          <p className="text-[10px] text-[#6B7876] truncate mt-0.5">
            {log.user_email || "Automated"}
          </p>
        </div>

        {/* Action */}
        <div className="w-24 flex-shrink-0">
          <ActionBadge action={log.action} />
        </div>

        {/* Module */}
        <div className="w-28 flex-shrink-0">
          <ModuleBadge tableName={log.table_name} />
        </div>

        {/* Record ID */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#4A5654] font-mono truncate">
            {log.record_id.substring(0, 8)}...
          </p>
        </div>

        {/* Changes summary */}
        <div className="w-40 flex-shrink-0 text-right">
          {diff.changed.length > 0 && (
            <span className="text-xs text-blue-400">
              {diff.changed.length} changed
            </span>
          )}
          {diff.added.length > 0 && (
            <span className="text-xs text-emerald-400 ml-2">
              {diff.added.length} added
            </span>
          )}
          {diff.removed.length > 0 && (
            <span className="text-xs text-red-400 ml-2">
              {diff.removed.length} removed
            </span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && hasChanges && (
        <div className="px-6 pb-4 ml-11">
          <div className="bg-[#E6D4C7] border border-[#C9BAB0] rounded-lg p-4">
            <p className="text-[10px] text-[#6B7876] uppercase tracking-wider mb-3">
              Changes
            </p>

            <div className="space-y-2">
              {/* Changed fields */}
              {diff.changed.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-32 text-[#4A5654] font-medium truncate">
                    {field}
                  </span>
                  <span className="text-red-400/70 line-through">
                    {formatValue(log.old_values?.[field])}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#6B7876]" />
                  <span className="text-emerald-400">
                    {formatValue(log.new_values?.[field])}
                  </span>
                </div>
              ))}

              {/* Added fields */}
              {diff.added.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-32 text-[#4A5654] font-medium truncate">
                    {field}
                  </span>
                  <span className="text-emerald-400">
                    {formatValue(log.new_values?.[field])}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    new
                  </span>
                </div>
              ))}

              {/* Removed fields */}
              {diff.removed.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-32 text-[#4A5654] font-medium truncate">
                    {field}
                  </span>
                  <span className="text-red-400/70 line-through">
                    {formatValue(log.old_values?.[field])}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                    removed
                  </span>
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="mt-4 pt-3 border-t border-[#C9BAB0] flex items-center gap-6 text-[10px] text-[#6B7876]">
              <span>Record: {log.record_id}</span>
              <span>Table: {log.table_name}</span>
              <span>{formatFullDate(log.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Filters ─────────────────────── */

interface FiltersProps {
  filters: {
    search: string;
    action: string;
    module: string;
    dateRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

function Filters({ filters, onFilterChange, onReset }: FiltersProps) {
  const hasFilters =
    filters.search || filters.action || filters.module || filters.dateRange;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7876]" />
        <input
          type="text"
          placeholder="Search logs..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-9 pr-4 py-2 w-56 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] placeholder-[#6B7876] focus:outline-none focus:border-[#273B3A]/40 transition-colors"
        />
      </div>

      {/* Action filter */}
      <select
        value={filters.action}
        onChange={(e) => onFilterChange("action", e.target.value)}
        className="px-3 py-2 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:border-[#273B3A]/40 transition-colors"
      >
        <option value="">All Actions</option>
        <option value="create">Created</option>
        <option value="update">Updated</option>
        <option value="delete">Deleted</option>
      </select>

      {/* Module filter */}
      <select
        value={filters.module}
        onChange={(e) => onFilterChange("module", e.target.value)}
        className="px-3 py-2 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:border-[#273B3A]/40 transition-colors"
      >
        <option value="">All Modules</option>
        <option value="products">Inventory</option>
        <option value="invoices">Invoices</option>
        <option value="contacts">Contacts</option>
        <option value="employees">Employees</option>
        <option value="pay_runs">Payroll</option>
        <option value="sales_orders">Sales</option>
        <option value="purchase_orders">Purchase</option>
      </select>

      {/* Date range filter */}
      <select
        value={filters.dateRange}
        onChange={(e) => onFilterChange("dateRange", e.target.value)}
        className="px-3 py-2 bg-[#F0E6E0] border border-[#C9BAB0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:border-[#273B3A]/40 transition-colors"
      >
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">Past Week</option>
        <option value="month">Past Month</option>
        <option value="quarter">Past 3 Months</option>
      </select>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#4A5654] hover:text-[#1A2726] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    module: "",
    dateRange: "",
  });

  // Fetch audit logs
  useEffect(() => {
    async function loadLogs() {
      setLoading(true);

      // Calculate date range
      let startDate: string | undefined;
      const now = new Date();

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "quarter":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }

      const result = await fetchAuditLogs("org1", {
        limit: 100,
        startDate,
        action: filters.action as AuditAction | undefined,
        tableName: filters.module || undefined,
      });

      if (result) {
        setLogs(result.data);
        setTotalCount(result.count);
      }

      setLoading(false);
    }

    loadLogs();
  }, [filters.action, filters.module, filters.dateRange]);

  // Filter logs by search
  const filteredLogs = useMemo(() => {
    if (!filters.search) return logs;

    const search = filters.search.toLowerCase();
    return logs.filter(
      (log) =>
        log.user_email?.toLowerCase().includes(search) ||
        log.table_name.toLowerCase().includes(search) ||
        log.record_id.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search)
    );
  }, [logs, filters.search]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ search: "", action: "", module: "", dateRange: "" });
  };

  // Export to CSV
  const handleExport = () => {
    const csv = exportToCSV(filteredLogs);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgba(156,74,41,0.15)]">
              <History className="w-5 h-5 text-[#273B3A]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#1A2726]">
                Audit Logs
              </h1>
              <p className="text-[#4A5654] text-sm mt-0.5">
                Track all changes made to your organization&apos;s data
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#C9BAB0] rounded-lg text-sm text-[#4A5654] hover:text-[#1A2726] hover:bg-[#F0E6E0] transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Logs", value: totalCount, color: "text-[#273B3A]" },
          {
            label: "Creates",
            value: logs.filter((l) => l.action === "create").length,
            color: "text-emerald-400",
          },
          {
            label: "Updates",
            value: logs.filter((l) => l.action === "update").length,
            color: "text-blue-400",
          },
          {
            label: "Deletes",
            value: logs.filter((l) => l.action === "delete").length,
            color: "text-red-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl p-4"
          >
            <p className="text-[10px] text-[#6B7876] uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#F0E6E0] border border-[#C9BAB0] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 bg-[#E6D4C7] border-b border-[#C9BAB0] flex items-center gap-4 text-[10px] text-[#6B7876] uppercase tracking-wider">
          <div className="w-5 flex-shrink-0" />
          <div className="w-28 flex-shrink-0">Date</div>
          <div className="w-40 flex-shrink-0">User</div>
          <div className="w-24 flex-shrink-0">Action</div>
          <div className="w-28 flex-shrink-0">Module</div>
          <div className="flex-1">Record</div>
          <div className="w-40 flex-shrink-0 text-right">Changes</div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#6B7876] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#4A5654]">Loading audit logs...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredLogs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <History className="w-8 h-8 text-[#6B7876] mx-auto mb-3" />
            <p className="text-sm text-[#4A5654]">No audit logs found</p>
            <p className="text-xs text-[#6B7876] mt-1">
              Activity will appear here as changes are made
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading &&
          filteredLogs.map((log) => <AuditLogRow key={log.id} log={log} />)}
      </div>

      {/* Footer */}
      {filteredLogs.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-[#6B7876]">
          <span>
            Showing {filteredLogs.length} of {totalCount} logs
          </span>
          <span>Audit logs are retained for 90 days</span>
        </div>
      )}
    </div>
  );
}
