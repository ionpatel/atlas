"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  XCircle,
  Clock,
  Palmtree,
  Stethoscope,
  User,
  Settings,
  Download,
  AlertCircle,
  Users,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { useLeaveStore, LEAVE_TYPE_LABELS, LEAVE_STATUS_STYLES } from "@/stores/leave-store";
import { useToastStore } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus, LeavePolicy } from "@/types";

/* ─────────── constants ─────────── */

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const LEAVE_TYPE_ICONS: Record<LeaveType, React.ComponentType<{ className?: string }>> = {
  vacation: Palmtree,
  sick: Stethoscope,
  personal: User,
  unpaid: Clock,
  bereavement: CalendarDays,
  parental: Users,
};

/* ─────────── helpers ─────────── */

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthStart(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/* ─────────── Status Badge ─────────── */

function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const style = LEAVE_STATUS_STYLES[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${style.bgColor} ${style.textColor} ${style.borderColor}`}>
      {style.label}
    </span>
  );
}

/* ─────────── Type Badge ─────────── */

function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const { label, color } = LEAVE_TYPE_LABELS[type];
  const Icon = LEAVE_TYPE_ICONS[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ─────────── Balance Card ─────────── */

function BalanceCard({ balance }: { balance: LeaveBalance }) {
  const vacationRemaining = balance.vacation_days + balance.carried_over - balance.used_vacation;
  const sickRemaining = balance.sick_days - balance.used_sick;
  const personalRemaining = balance.personal_days - balance.used_personal;

  const BalanceItem = ({ label, used, total, color }: { label: string; used: number; total: number; color: string }) => {
    const remaining = total - used;
    const pct = total > 0 ? (remaining / total) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#FAFAFA]">{label}</span>
          <span className="text-sm font-medium text-[#FAFAFA]">{remaining} / {total} days</span>
        </div>
        <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5 space-y-4">
      <h3 className="text-lg font-semibold text-[#FAFAFA]">Leave Balance ({balance.year})</h3>
      <BalanceItem label="Vacation" used={balance.used_vacation} total={balance.vacation_days + balance.carried_over} color="#CDB49E" />
      <BalanceItem label="Sick Leave" used={balance.used_sick} total={balance.sick_days} color="#f87171" />
      <BalanceItem label="Personal" used={balance.used_personal} total={balance.personal_days} color="#a78bfa" />
      {balance.carried_over > 0 && (
        <p className="text-xs text-[#FAFAFA]">
          Includes {balance.carried_over} days carried over from previous year
        </p>
      )}
    </div>
  );
}

/* ─────────── Request Form ─────────── */

function LeaveRequestForm({ onSubmit, onClose }: {
  onSubmit: (data: Omit<LeaveRequest, "id" | "created_at" | "status">) => void;
  onClose: () => void;
}) {
  const [leaveType, setLeaveType] = useState<LeaveType>("vacation");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  const daysRequested = calculateDays(startDate, endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      org_id: DEMO_ORG_ID,
      user_id: "e1",
      user_name: "Alexandra Mitchell",
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days_requested: daysRequested,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0A0A0A] border border-[#262626] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <h2 className="text-xl font-semibold text-[#FAFAFA]">Request Leave</h2>
          <button onClick={onClose} className="text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Leave Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => {
                const { label, color } = LEAVE_TYPE_LABELS[type];
                const Icon = LEAVE_TYPE_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLeaveType(type)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                      leaveType === type
                        ? "border-[#262626] bg-[#161616]/10"
                        : "border-[#262626] bg-[#0A0A0A] hover:border-[#262626]/50"
                    )}
                  >
                    <span style={{ color: leaveType === type ? color : "#CDB49E" }}><Icon className="w-5 h-5" /></span>
                    <span className={cn("text-xs", leaveType === type ? "text-[#FAFAFA]" : "text-[#FAFAFA]")}>
                      {label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                required
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
              />
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-3 text-center">
            <span className="text-2xl font-bold text-[#FAFAFA]">{daysRequested}</span>
            <span className="text-sm text-[#FAFAFA] ml-2">day{daysRequested !== 1 ? "s" : ""} requested</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add a reason for your leave request..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#0A0A0A] hover:bg-[#0A0A0A] text-[#FAFAFA] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#CDB49E] to-[#B89B78] hover:from-[#CDB49E]/90 hover:to-[#B89B78]/90 text-[#0A0A0A] font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Request Card ─────────── */

function RequestCard({ request, onApprove, onReject, onCancel, isManager }: {
  request: LeaveRequest;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  isManager?: boolean;
}) {
  const Icon = LEAVE_TYPE_ICONS[request.leave_type];

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5 hover:border-[#262626]/20 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${LEAVE_TYPE_LABELS[request.leave_type].color}15` }}
          >
            <span style={{ color: LEAVE_TYPE_LABELS[request.leave_type].color }}><Icon className="w-5 h-5" /></span>
          </div>
          <div>
            <h4 className="font-medium text-[#FAFAFA]">{request.user_name}</h4>
            <LeaveTypeBadge type={request.leave_type} />
          </div>
        </div>
        <LeaveStatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs text-[#FAFAFA]">Dates</span>
          <p className="text-sm text-[#FAFAFA]">
            {formatDateShort(request.start_date)} - {formatDateShort(request.end_date)}
          </p>
        </div>
        <div>
          <span className="text-xs text-[#FAFAFA]">Duration</span>
          <p className="text-sm text-[#FAFAFA]">{request.days_requested} day{request.days_requested !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {request.reason && (
        <div className="mb-4">
          <span className="text-xs text-[#FAFAFA]">Reason</span>
          <p className="text-sm text-[#FAFAFA]">{request.reason}</p>
        </div>
      )}

      {request.status === "approved" && request.approver_name && (
        <p className="text-xs text-[#FAFAFA]">
          Approved by {request.approver_name} on {formatDate(request.approved_at!)}
        </p>
      )}

      {request.status === "rejected" && request.rejection_reason && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400">{request.rejection_reason}</p>
        </div>
      )}

      {/* Action Buttons */}
      {request.status === "pending" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#262626]">
          {isManager ? (
            <>
              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : (
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0A0A0A] hover:bg-[#0A0A0A] text-[#FAFAFA] rounded-lg transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────── Calendar View ─────────── */

function TeamCalendar({ requests, selectedMonth, onPrevMonth, onNextMonth }: {
  requests: LeaveRequest[];
  selectedMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = getMonthStart(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: monthStart }, (_, i) => i);

  const getRequestsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return requests.filter((r) => {
      const start = r.start_date;
      const end = r.end_date;
      return dateStr >= start && dateStr <= end;
    });
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-[#262626]">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-[#0A0A0A] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#FAFAFA]" />
        </button>
        <h3 className="text-lg font-semibold text-[#FAFAFA]">
          {selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-[#0A0A0A] rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[#FAFAFA]" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[#262626]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-3 text-center text-xs font-medium text-[#FAFAFA]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="p-2 min-h-[100px] border-r border-b border-[#262626]" />
        ))}
        {days.map((day) => {
          const dayRequests = getRequestsForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={day}
              className={cn(
                "p-2 min-h-[100px] border-r border-b border-[#262626] last:border-r-0",
                isToday && "bg-[#161616]/5"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-[#FAFAFA]" : "text-[#FAFAFA]"
                )}
              >
                {day}
              </div>
              <div className="space-y-1">
                {dayRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="text-[10px] px-1.5 py-0.5 rounded truncate"
                    style={{
                      backgroundColor: `${LEAVE_TYPE_LABELS[req.leave_type].color}20`,
                      color: LEAVE_TYPE_LABELS[req.leave_type].color,
                    }}
                  >
                    {req.user_name?.split(" ")[0]}
                  </div>
                ))}
                {dayRequests.length > 3 && (
                  <div className="text-[10px] text-[#FAFAFA]">
                    +{dayRequests.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Policy Settings ─────────── */

function PolicySettings({ policies, onUpdate }: {
  policies: LeavePolicy[];
  onUpdate: (id: string, data: Partial<LeavePolicy>) => void;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5">
      <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">Leave Policies</h3>
      <div className="space-y-4">
        {policies.map((policy) => {
          const { label, color } = LEAVE_TYPE_LABELS[policy.leave_type];
          const Icon = LEAVE_TYPE_ICONS[policy.leave_type];
          return (
            <div key={policy.id} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <span style={{ color }}><Icon className="w-4 h-4" /></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#FAFAFA]">{label}</p>
                  <p className="text-xs text-[#FAFAFA]">
                    {policy.default_days} days • {policy.requires_approval ? "Requires approval" : "Auto-approved"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={policy.is_active}
                      onChange={(e) => onUpdate(policy.id, { is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#0A0A0A] rounded-full peer-checked:bg-[#161616] transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */

type TabId = "requests" | "calendar" | "balance" | "settings";

export default function LeavePage() {
  const {
    requests,
    balances,
    policies,
    loading,
    selectedMonth,
    fetchRequests,
    fetchBalances,
    fetchPolicies,
    submitRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    updatePolicy,
    setSelectedMonth,
    filteredRequests,
    getUserBalance,
    getTeamCalendar,
  } = useLeaveStore();

  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<TabId>("requests");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchRequests(DEMO_ORG_ID);
    fetchBalances(DEMO_ORG_ID);
    fetchPolicies(DEMO_ORG_ID);
  }, [fetchRequests, fetchBalances, fetchPolicies]);

  const userBalance = getUserBalance("e1");
  const teamCalendarRequests = getTeamCalendar();
  const filtered = filteredRequests();

  // Apply local filters
  const displayedRequests = filtered.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesType = !typeFilter || r.leave_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleSubmitRequest = async (data: Omit<LeaveRequest, "id" | "created_at" | "status">) => {
    const result = await submitRequest(data);
    if (result) {
      toast.addToast({ type: "success", message: "Leave request submitted!" });
    }
  };

  const handleApprove = async (id: string) => {
    const result = await approveRequest(id, "e1");
    if (result) {
      toast.addToast({ type: "success", message: "Request approved!" });
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      const result = await rejectRequest(id, reason);
      if (result) {
        toast.addToast({ type: "info", message: "Request rejected" });
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      const result = await cancelRequest(id);
      if (result) {
        toast.addToast({ type: "info", message: "Request cancelled" });
      }
    }
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setSelectedMonth(newMonth);
  };

  const tabs = [
    { id: "requests" as TabId, label: "Requests", icon: Clock, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "calendar" as TabId, label: "Team Calendar", icon: Calendar },
    { id: "balance" as TabId, label: "My Balance", icon: Palmtree },
    { id: "settings" as TabId, label: "Policies", icon: Settings },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA]">Leave Management</h1>
          <p className="text-[#FAFAFA] mt-1">Request time off and manage leave balances</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#CDB49E] to-[#B89B78] hover:from-[#CDB49E]/90 hover:to-[#B89B78]/90 text-[#0A0A0A] font-medium rounded-lg transition-all shadow-lg shadow-[#CDB49E]/20"
        >
          <Plus className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#161616]/10 flex items-center justify-center">
              <Palmtree className="w-5 h-5 text-[#FAFAFA]" />
            </div>
            <span className="text-sm text-[#FAFAFA]">Vacation Left</span>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">
            {userBalance ? (userBalance.vacation_days + userBalance.carried_over - userBalance.used_vacation).toFixed(1) : "--"} days
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-[#FAFAFA]">Sick Leave Left</span>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">
            {userBalance ? (userBalance.sick_days - userBalance.used_sick).toFixed(1) : "--"} days
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-[#FAFAFA]">Pending</span>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">{pendingCount}</div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-[#FAFAFA]">Days Taken</span>
          </div>
          <div className="text-2xl font-bold text-[#FAFAFA]">
            {userBalance ? (userBalance.used_vacation + userBalance.used_sick + userBalance.used_personal).toFixed(1) : "--"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#262626] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#161616] text-[#0A0A0A]"
                : "text-[#FAFAFA] hover:text-[#FAFAFA]"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30"
            >
              <option value="">All Types</option>
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => (
                <option key={type} value={type}>{LEAVE_TYPE_LABELS[type].label}</option>
              ))}
            </select>
          </div>

          {/* Request List */}
          {displayedRequests.length === 0 ? (
            <div className="text-center py-12 text-[#FAFAFA]">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isManager={true}
                  onApprove={() => handleApprove(request.id)}
                  onReject={() => handleReject(request.id)}
                  onCancel={() => handleCancel(request.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "calendar" && (
        <TeamCalendar
          requests={teamCalendarRequests}
          selectedMonth={selectedMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      )}

      {activeTab === "balance" && userBalance && (
        <div className="max-w-md">
          <BalanceCard balance={userBalance} />
        </div>
      )}

      {activeTab === "settings" && (
        <PolicySettings
          policies={policies}
          onUpdate={(id, data) => updatePolicy(id, data)}
        />
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <LeaveRequestForm
          onSubmit={handleSubmitRequest}
          onClose={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
}
