"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, X, Settings, Users, DollarSign, FileText, Calendar,
  ChevronRight, ChevronDown, Trash2, Edit2, Copy, ToggleLeft, ToggleRight,
  GripVertical, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight,
  Building2, User, Shield, Briefcase, Mail, MoreHorizontal,
} from "lucide-react";
import { useApprovalsStore } from "@/stores/approvals-store";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/components/ui/toast";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import type { ApprovalWorkflow, ApprovalStep, ApprovalRequest, ApproverType } from "@/types";

const APPLIES_TO_OPTIONS = [
  { value: "expenses", label: "Expenses", icon: DollarSign, color: "#9C4A29" },
  { value: "purchase_orders", label: "Purchase Orders", icon: FileText, color: "#34D399" },
  { value: "contracts", label: "Contracts", icon: FileText, color: "#A78BFA" },
  { value: "leave", label: "Leave Requests", icon: Calendar, color: "#FBBF24" },
  { value: "invoices", label: "Invoices", icon: FileText, color: "#F472B6" },
];

const APPROVER_TYPE_OPTIONS: { value: ApproverType; label: string; icon: React.ElementType }[] = [
  { value: "manager", label: "Direct Manager", icon: User },
  { value: "department", label: "Department", icon: Building2 },
  { value: "role", label: "Role", icon: Shield },
  { value: "user", label: "Specific User", icon: User },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    in_progress: { bg: "bg-[#9C4A29]/10", text: "text-[#9C4A29]", border: "border-[#9C4A29]/20" },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    rejected: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    cancelled: { bg: "bg-[#F5F2E8]", text: "text-[#8B7B6F]", border: "border-[#DDD7C0]" },
  };
  const s = styles[status] || styles.pending;
  const label = status.replace("_", " ");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize ${s.bg} ${s.text} ${s.border}`}>
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: { bg: "bg-[#9C4A29]/10", iconBg: "bg-[#9C4A29]/20", text: "text-[#9C4A29]" },
    green: { bg: "bg-emerald-500/10", iconBg: "bg-emerald-500/20", text: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", iconBg: "bg-amber-500/20", text: "text-amber-400" },
    red: { bg: "bg-red-500/10", iconBg: "bg-red-500/20", text: "text-red-400" },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} border border-[#F5F2E8] rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#8B7B6F] uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{value}</div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  onEdit,
  onToggle,
  onDelete,
}: {
  workflow: ApprovalWorkflow;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const appliesTo = APPLIES_TO_OPTIONS.find((o) => o.value === workflow.applies_to);
  const Icon = appliesTo?.icon || FileText;

  return (
    <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl p-5 hover:border-[#9C4A29]/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${appliesTo?.color || "#9C4A29"}20` }}
          >
            <span style={{ color: appliesTo?.color || "#9C4A29" }}><Icon className="w-5 h-5" /></span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D1810]">{workflow.name}</h3>
            <p className="text-xs text-[#8B7B6F] capitalize">{workflow.applies_to.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="flex-shrink-0"
            title={workflow.is_active ? "Disable" : "Enable"}
          >
            {workflow.is_active ? (
              <ToggleRight className="w-8 h-8 text-[#9C4A29]" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-[#DDD7C0]" />
            )}
          </button>
        </div>
      </div>

      {workflow.description && (
        <p className="text-xs text-[#6B5B4F] mb-4">{workflow.description}</p>
      )}

      {/* Steps preview */}
      <div className="flex items-center gap-2 mb-4">
        {workflow.steps?.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#E8E3CC] rounded-lg">
              <span className="w-4 h-4 rounded-full bg-[#9C4A29]/20 text-[#9C4A29] text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-xs text-[#6B5B4F]">{step.approver_name || step.approver_type}</span>
            </div>
            {i < (workflow.steps?.length || 0) - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-[#DDD7C0]" />
            )}
          </div>
        ))}
        {(!workflow.steps || workflow.steps.length === 0) && (
          <span className="text-xs text-[#8B7B6F]">No steps configured</span>
        )}
      </div>

      {/* Rules */}
      {Object.keys(workflow.rules).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {workflow.rules.amount_min !== undefined && (
            <span className="px-2 py-1 bg-[#E8E3CC] text-[10px] text-[#8B7B6F] rounded">
              Min: {formatCurrency(workflow.rules.amount_min)}
            </span>
          )}
          {workflow.rules.amount_max !== undefined && (
            <span className="px-2 py-1 bg-[#E8E3CC] text-[10px] text-[#8B7B6F] rounded">
              Max: {formatCurrency(workflow.rules.amount_max)}
            </span>
          )}
          {workflow.rules.department && (
            <span className="px-2 py-1 bg-[#E8E3CC] text-[10px] text-[#8B7B6F] rounded capitalize">
              {workflow.rules.department}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#DDD7C0]/50">
        <span className="text-xs text-[#8B7B6F]">Priority: {workflow.priority}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-[#8B7B6F] hover:text-[#9C4A29] hover:bg-[#9C4A29]/10"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-[#8B7B6F] hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowBuilderModal({
  workflow,
  open,
  onClose,
  onSave,
}: {
  workflow?: ApprovalWorkflow;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<ApprovalWorkflow>) => void;
}) {
  const [formData, setFormData] = useState({
    name: workflow?.name || "",
    description: workflow?.description || "",
    applies_to: workflow?.applies_to || "expenses",
    rules: workflow?.rules || {},
    is_active: workflow?.is_active ?? true,
    priority: workflow?.priority || 1,
    steps: workflow?.steps || [],
  });

  const [amountMin, setAmountMin] = useState(formData.rules.amount_min?.toString() || "");
  const [amountMax, setAmountMax] = useState(formData.rules.amount_max?.toString() || "");

  const addStep = () => {
    const newStep: ApprovalStep = {
      id: crypto.randomUUID(),
      workflow_id: workflow?.id || "",
      step_order: formData.steps.length + 1,
      name: `Step ${formData.steps.length + 1}`,
      approver_type: "manager",
      approver_name: "Direct Manager",
      can_delegate: false,
      notify_on_pending: true,
      created_at: new Date().toISOString(),
    };
    setFormData((d) => ({ ...d, steps: [...d.steps, newStep] }));
  };

  const updateStep = (index: number, updates: Partial<ApprovalStep>) => {
    setFormData((d) => ({
      ...d,
      steps: d.steps.map((s, i) => (i === index ? { ...s, ...updates } : s)),
    }));
  };

  const removeStep = (index: number) => {
    setFormData((d) => ({
      ...d,
      steps: d.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rules: ApprovalWorkflow["rules"] = {};
    if (amountMin) rules.amount_min = parseFloat(amountMin);
    if (amountMax) rules.amount_max = parseFloat(amountMax);

    onSave({
      ...formData,
      rules,
      applies_to: formData.applies_to as ApprovalWorkflow["applies_to"],
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={workflow ? "Edit Workflow" : "New Workflow"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#8B7B6F] mb-1.5">Workflow Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#8B7B6F] mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8B7B6F] mb-1.5">Applies To</label>
            <select
              value={formData.applies_to}
              onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
            >
              {APPLIES_TO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8B7B6F] mb-1.5">Priority</label>
            <input
              type="number"
              min={1}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
            />
          </div>
        </div>

        {/* Rules */}
        <div>
          <h3 className="text-sm font-semibold text-[#2D1810] mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#9C4A29]" />
            Conditions (When to apply)
          </h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#E8E3CC] rounded-lg">
            <div>
              <label className="block text-xs font-medium text-[#8B7B6F] mb-1.5">Minimum Amount ($)</label>
              <input
                type="number"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                placeholder="No minimum"
                className="w-full px-4 py-2.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8B7B6F] mb-1.5">Maximum Amount ($)</label>
              <input
                type="number"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                placeholder="No maximum"
                className="w-full px-4 py-2.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#2D1810] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9C4A29]" />
              Approval Steps
            </h3>
            <button
              type="button"
              onClick={addStep}
              className="text-xs text-[#9C4A29] hover:text-[#7DD3FC]"
            >
              + Add Step
            </button>
          </div>

          {formData.steps.length === 0 ? (
            <div className="p-8 bg-[#E8E3CC] rounded-lg text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-[#DDD7C0]" />
              <p className="text-sm text-[#8B7B6F] mb-3">No approval steps defined</p>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add First Step
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.steps.map((step, i) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-4 bg-[#E8E3CC] rounded-lg group"
                >
                  <div className="flex items-center gap-2 pt-2">
                    <GripVertical className="w-4 h-4 text-[#DDD7C0] cursor-grab" />
                    <div className="w-8 h-8 rounded-full bg-[#9C4A29]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#9C4A29]">{i + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#8B7B6F] mb-1">Step Name</label>
                      <input
                        type="text"
                        value={step.name || ""}
                        onChange={(e) => updateStep(i, { name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-xs text-[#2D1810]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8B7B6F] mb-1">Approver Type</label>
                      <select
                        value={step.approver_type}
                        onChange={(e) => {
                          const type = e.target.value as ApproverType;
                          const option = APPROVER_TYPE_OPTIONS.find((o) => o.value === type);
                          updateStep(i, {
                            approver_type: type,
                            approver_name: option?.label,
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-xs text-[#2D1810]"
                      >
                        {APPROVER_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8B7B6F] mb-1">Auto-approve (days)</label>
                      <input
                        type="number"
                        value={step.auto_approve_after_days || ""}
                        onChange={(e) => updateStep(i, { auto_approve_after_days: parseInt(e.target.value) || undefined })}
                        placeholder="Never"
                        className="w-full px-3 py-2 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-xs text-[#2D1810]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-1.5 text-[10px] text-[#8B7B6F]">
                      <input
                        type="checkbox"
                        checked={step.can_delegate}
                        onChange={(e) => updateStep(i, { can_delegate: e.target.checked })}
                        className="w-3 h-3 rounded border-[#DDD7C0] bg-[#E8E3CC] text-[#9C4A29]"
                      />
                      Delegate
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-[#8B7B6F]">
                      <input
                        type="checkbox"
                        checked={step.notify_on_pending}
                        onChange={(e) => updateStep(i, { notify_on_pending: e.target.checked })}
                        className="w-3 h-3 rounded border-[#DDD7C0] bg-[#E8E3CC] text-[#9C4A29]"
                      />
                      Notify
                    </label>
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="p-1.5 rounded-lg text-[#8B7B6F] hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-[#E8E3CC] rounded-lg">
          <div>
            <p className="text-sm font-medium text-[#2D1810]">Workflow Status</p>
            <p className="text-xs text-[#8B7B6F]">Enable or disable this workflow</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
          >
            {formData.is_active ? (
              <ToggleRight className="w-10 h-10 text-[#9C4A29]" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-[#DDD7C0]" />
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD7C0]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#DDD7C0] rounded-lg text-sm font-medium text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#7DD3FC]"
          >
            {workflow ? "Save Changes" : "Create Workflow"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ApprovalRequestCard({
  request,
  onApprove,
  onReject,
}: {
  request: ApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending = request.status === "pending" || request.status === "in_progress";

  return (
    <div className="flex items-center justify-between p-4 bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl hover:border-[#9C4A29]/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#9C4A29]/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-[#9C4A29]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#2D1810]">{request.record_title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#8B7B6F]">{request.submitted_by_name}</span>
            <span className="text-xs text-[#DDD7C0]">•</span>
            <span className="text-xs text-[#8B7B6F] capitalize">{request.record_type.replace("_", " ")}</span>
            {request.record_amount && (
              <>
                <span className="text-xs text-[#DDD7C0]">•</span>
                <span className="text-xs text-[#9C4A29] font-medium">
                  {formatCurrency(request.record_amount)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-[#8B7B6F]">
            Step {request.current_step} of {request.total_steps}
          </p>
        </div>

        {isPending && (
          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/10"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const {
    workflows,
    requests,
    filterStatus,
    filterType,
    setFilterStatus,
    setFilterType,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    approveRequest,
    rejectRequest,
    filteredRequests,
    getPendingRequests,
    getStats,
  } = useApprovalsStore();

  const addToast = useToastStore((s) => s.addToast);
  const stats = getStats();
  const pendingRequests = getPendingRequests();
  const allRequests = filteredRequests();

  const [activeTab, setActiveTab] = useState<"workflows" | "requests" | "history">("workflows");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleCreateWorkflow = (data: Partial<ApprovalWorkflow>) => {
    const workflow: ApprovalWorkflow = {
      id: crypto.randomUUID(),
      org_id: "org1",
      name: data.name || "",
      description: data.description,
      applies_to: data.applies_to || "expenses",
      rules: data.rules || {},
      is_active: data.is_active ?? true,
      priority: data.priority || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      steps: data.steps,
    };
    addWorkflow(workflow);
    setBuilderOpen(false);
    addToast("Workflow created successfully");
  };

  const handleUpdateWorkflow = (data: Partial<ApprovalWorkflow>) => {
    if (!editingWorkflow) return;
    updateWorkflow(editingWorkflow.id, data);
    setEditingWorkflow(null);
    addToast("Workflow updated successfully");
  };

  const handleToggleWorkflow = (workflow: ApprovalWorkflow) => {
    updateWorkflow(workflow.id, { is_active: !workflow.is_active });
    addToast(workflow.is_active ? "Workflow disabled" : "Workflow enabled");
  };

  const handleDeleteWorkflow = (id: string) => {
    deleteWorkflow(id);
    addToast("Workflow deleted", "info");
  };

  const handleApprove = (requestId: string) => {
    approveRequest(requestId, "Approved");
    addToast("Request approved");
  };

  const handleReject = (requestId: string) => {
    rejectRequest(requestId, "Rejected");
    addToast("Request rejected", "info");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 rounded-lg text-[#8B7B6F] hover:text-[#2D1810] hover:bg-[#F5F2E8]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#2D1810]">
              Approval Workflows
            </h1>
            <p className="text-[#8B7B6F] text-sm mt-1">
              Configure approval rules and manage requests
            </p>
          </div>
        </div>
        <button
          onClick={() => setBuilderOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#7DD3FC]"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} color="green" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="red" />
        <StatCard
          label="Avg. Time"
          value={stats.avgApprovalTime > 0 ? `${stats.avgApprovalTime.toFixed(1)}h` : "—"}
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F5F2E8] rounded-lg w-fit">
        {[
          { id: "workflows", label: "Workflows", count: workflows.length },
          { id: "requests", label: "Pending", count: pendingRequests.length },
          { id: "history", label: "History", count: undefined },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-[#9C4A29] text-[#E8E3CC]"
                : "text-[#6B5B4F] hover:text-[#2D1810]"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  activeTab === tab.id
                    ? "bg-[#E8E3CC]/20 text-[#E8E3CC]"
                    : "bg-[#DDD7C0] text-[#6B5B4F]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Workflows Tab */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="text-center py-16 bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl">
              <Settings className="w-12 h-12 mx-auto mb-4 text-[#DDD7C0]" />
              <p className="text-sm text-[#8B7B6F] mb-4">No workflows configured</p>
              <button
                onClick={() => setBuilderOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Create First Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={() => setEditingWorkflow(workflow)}
                  onToggle={() => handleToggleWorkflow(workflow)}
                  onDelete={() => handleDeleteWorkflow(workflow.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-16 bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500/50" />
              <p className="text-lg font-medium text-[#2D1810] mb-2">All caught up!</p>
              <p className="text-sm text-[#8B7B6F]">No pending approvals</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onReject={() => handleReject(request.id)}
              />
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29]/50"
            >
              <option value="">All Types</option>
              {APPLIES_TO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {allRequests.filter((r) => r.status !== "pending" && r.status !== "in_progress").length === 0 ? (
            <div className="text-center py-16 bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl">
              <Clock className="w-12 h-12 mx-auto mb-4 text-[#DDD7C0]" />
              <p className="text-sm text-[#8B7B6F]">No approval history</p>
            </div>
          ) : (
            <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#DDD7C0]">
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#8B7B6F] uppercase tracking-widest">Request</th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#8B7B6F] uppercase tracking-widest">Submitted By</th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#8B7B6F] uppercase tracking-widest">Type</th>
                    <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#8B7B6F] uppercase tracking-widest">Amount</th>
                    <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#8B7B6F] uppercase tracking-widest">Status</th>
                    <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#8B7B6F] uppercase tracking-widest">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests
                    .filter((r) => r.status !== "pending" && r.status !== "in_progress")
                    .map((request, i) => (
                      <tr
                        key={request.id}
                        className={cn(
                          "border-b border-[#DDD7C0]/50 last:border-0",
                          i % 2 === 1 && "bg-[#E8E3CC]/20"
                        )}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#2D1810]">{request.record_title}</p>
                          <p className="text-xs text-[#8B7B6F]">{request.workflow_name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B5B4F]">
                          {request.submitted_by_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B5B4F] capitalize">
                          {request.record_type.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-[#9C4A29] font-medium">
                          {request.record_amount ? formatCurrency(request.record_amount) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-[#8B7B6F]">
                          {request.completed_at ? formatDate(request.completed_at) : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Workflow Builder Modal */}
      <WorkflowBuilderModal
        workflow={editingWorkflow || undefined}
        open={builderOpen || !!editingWorkflow}
        onClose={() => {
          setBuilderOpen(false);
          setEditingWorkflow(null);
        }}
        onSave={editingWorkflow ? handleUpdateWorkflow : handleCreateWorkflow}
      />
    </div>
  );
}
