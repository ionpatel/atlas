"use client";

import { useState, useMemo } from "react";
import {
  FileText, Plus, Search, Filter, X, Eye, Edit2, Trash2, Send, Clock,
  DollarSign, AlertTriangle, CheckCircle2, FileSignature, Users, Calendar,
  RotateCcw, ExternalLink, Copy, MoreHorizontal, Building2, ChevronRight,
} from "lucide-react";
import { useContractsStore } from "@/stores/contracts-store";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Contract, ContractStatus, ContractTemplate } from "@/types";

function StatusBadge({ status }: { status: ContractStatus }) {
  const styles: Record<ContractStatus, { bg: string; text: string; border: string }> = {
    draft: { bg: "bg-[#0A0A0A]", text: "text-[#FAFAFA]", border: "border-[#262626]" },
    pending: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    active: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    expired: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    terminated: { bg: "bg-[#0A0A0A]", text: "text-[#FAFAFA]", border: "border-[#262626]" },
  };
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  color: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: { bg: "bg-[#161616]/10", iconBg: "bg-[#161616]/20", text: "text-[#FAFAFA]" },
    green: { bg: "bg-emerald-500/10", iconBg: "bg-emerald-500/20", text: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", iconBg: "bg-amber-500/20", text: "text-amber-400" },
    red: { bg: "bg-red-500/10", iconBg: "bg-red-500/20", text: "text-red-400" },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} border border-[#262626] rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#FAFAFA] uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{value}</div>
      {subtext && <div className="text-xs text-[#FAFAFA] mt-1">{subtext}</div>}
    </div>
  );
}

function ContractForm({
  contract,
  onSubmit,
  onCancel,
}: {
  contract?: Contract;
  onSubmit: (data: Partial<Contract>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: contract?.title || "",
    description: contract?.description || "",
    parties: contract?.parties || [{ name: "", email: "", role: "Client" }],
    start_date: contract?.start_date || new Date().toISOString().split("T")[0],
    end_date: contract?.end_date || "",
    value: contract?.value || 0,
    currency: contract?.currency || "CAD",
    payment_terms: contract?.payment_terms || "",
    auto_renew: contract?.auto_renew || false,
    renewal_days: contract?.renewal_days || 30,
    tags: contract?.tags || [],
    notes: contract?.notes || "",
  });

  const [tagInput, setTagInput] = useState("");

  const addParty = () => {
    setFormData((d) => ({
      ...d,
      parties: [...d.parties, { name: "", email: "", role: "" }],
    }));
  };

  const updateParty = (index: number, field: string, value: string) => {
    setFormData((d) => ({
      ...d,
      parties: d.parties.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  const removeParty = (index: number) => {
    setFormData((d) => ({
      ...d,
      parties: d.parties.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((d) => ({ ...d, tags: [...d.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-6"
    >
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#FAFAFA]" />
          Contract Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
            />
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FAFAFA]" />
            Parties
          </h3>
          <button
            type="button"
            onClick={addParty}
            className="text-xs text-[#FAFAFA] hover:text-[#7DD3FC]"
          >
            + Add Party
          </button>
        </div>
        {formData.parties.map((party, i) => (
          <div key={i} className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={party.name}
              onChange={(e) => updateParty(i, "name", e.target.value)}
              className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
            />
            <input
              type="email"
              placeholder="Email"
              value={party.email}
              onChange={(e) => updateParty(i, "email", e.target.value)}
              className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Role"
                value={party.role}
                onChange={(e) => updateParty(i, "role", e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
              />
              {formData.parties.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParty(i)}
                  className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dates & Value */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#FAFAFA]" />
          Terms
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Contract Value</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
              >
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Payment Terms</label>
            <input
              type="text"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              placeholder="e.g., Net 30"
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
            />
          </div>
        </div>
      </div>

      {/* Auto Renewal */}
      <div className="flex items-center gap-6 p-4 bg-[#0A0A0A] rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.auto_renew}
            onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
            className="w-4 h-4 rounded border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] focus:ring-[#CDB49E]/30"
          />
          <span className="text-sm text-[#FAFAFA]">Auto-renew contract</span>
        </label>
        {formData.auto_renew && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#FAFAFA]">Remind</span>
            <input
              type="number"
              value={formData.renewal_days}
              onChange={(e) => setFormData({ ...formData, renewal_days: parseInt(e.target.value) || 30 })}
              className="w-16 px-2 py-1 bg-[#0A0A0A] border border-[#262626] rounded text-sm text-center text-[#FAFAFA]"
            />
            <span className="text-xs text-[#FAFAFA]">days before expiry</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#161616]/10 text-[#FAFAFA] text-xs rounded-full"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="flex-1 px-4 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#ccc] hover:text-[#FAFAFA]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-[#FAFAFA] mb-1.5">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-[#262626] rounded-lg text-sm font-medium text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#7DD3FC]"
        >
          {contract ? "Update Contract" : "Create Contract"}
        </button>
      </div>
    </form>
  );
}

function ContractDetailModal({
  contract,
  open,
  onClose,
}: {
  contract: Contract;
  open: boolean;
  onClose: () => void;
}) {
  const { getSignatures, getActivities } = useContractsStore();
  const signatures = getSignatures(contract.id);
  const activities = getActivities(contract.id);
  const [activeTab, setActiveTab] = useState<"details" | "signatures" | "timeline">("details");

  return (
    <Modal open={open} onClose={onClose} title={contract.title} size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#0A0A0A] rounded-lg">
          {(["details", "signatures", "timeline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-[#161616] text-[#0A0A0A]"
                  : "text-[#ccc] hover:text-[#FAFAFA]"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={contract.status} />
              {contract.auto_renew && (
                <span className="flex items-center gap-1.5 text-xs text-[#FAFAFA]">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Auto-renews in {contract.renewal_days} days
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-medium text-[#FAFAFA] mb-2">Contract Period</h4>
                <p className="text-sm text-[#FAFAFA]">
                  {formatDate(contract.start_date)} — {contract.end_date ? formatDate(contract.end_date) : "Ongoing"}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#FAFAFA] mb-2">Contract Value</h4>
                <p className="text-lg font-bold text-[#FAFAFA]">
                  {formatCurrency(contract.value, contract.currency)}
                </p>
              </div>
            </div>

            {contract.description && (
              <div>
                <h4 className="text-xs font-medium text-[#FAFAFA] mb-2">Description</h4>
                <p className="text-sm text-[#FAFAFA]">{contract.description}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium text-[#FAFAFA] mb-3">Parties</h4>
              <div className="space-y-2">
                {contract.parties.map((party, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-[#0A0A0A] rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#161616]/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#FAFAFA]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#FAFAFA]">{party.name}</p>
                      <p className="text-xs text-[#FAFAFA]">{party.email}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#0A0A0A] rounded-full text-xs text-[#FAFAFA]">
                      {party.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {contract.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-[#FAFAFA] mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {contract.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[#161616]/10 text-[#FAFAFA] text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signatures Tab */}
        {activeTab === "signatures" && (
          <div className="space-y-4">
            {signatures.length === 0 ? (
              <div className="text-center py-8">
                <FileSignature className="w-12 h-12 mx-auto mb-3 text-[#0A0A0A]" />
                <p className="text-sm text-[#FAFAFA]">No signatures required</p>
              </div>
            ) : (
              signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        sig.status === "signed"
                          ? "bg-emerald-500/20"
                          : sig.status === "pending"
                          ? "bg-amber-500/20"
                          : "bg-red-500/20"
                      )}
                    >
                      <FileSignature
                        className={cn(
                          "w-5 h-5",
                          sig.status === "signed"
                            ? "text-emerald-400"
                            : sig.status === "pending"
                            ? "text-amber-400"
                            : "text-red-400"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#FAFAFA]">{sig.signer_name}</p>
                      <p className="text-xs text-[#FAFAFA]">
                        {sig.signer_email} · {sig.signer_role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={sig.status as ContractStatus} />
                    {sig.signed_at && (
                      <p className="text-xs text-[#FAFAFA] mt-1">
                        Signed {formatDate(sig.signed_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}

            <button className="w-full py-3 border-2 border-dashed border-[#262626] rounded-lg text-sm text-[#ccc] hover:text-[#FAFAFA] hover:border-[#262626]/50 transition-all">
              + Request Signature
            </button>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-3 text-[#0A0A0A]" />
                <p className="text-sm text-[#FAFAFA]">No activity yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-[#0A0A0A]" />
                {activities.map((activity, i) => (
                  <div key={activity.id} className="relative flex gap-4 pb-6">
                    <div className="relative z-10 w-10 h-10 rounded-full bg-[#0A0A0A] border-2 border-[#262626] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#FAFAFA]" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-[#FAFAFA]">
                        <span className="capitalize">{activity.action}</span>
                        {activity.actor_name && (
                          <span className="text-[#FAFAFA]"> by {activity.actor_name}</span>
                        )}
                      </p>
                      <p className="text-xs text-[#FAFAFA] mt-0.5">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function TemplatesModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (template: ContractTemplate) => void;
}) {
  const { templates } = useContractsStore();

  return (
    <Modal open={open} onClose={onClose} title="Contract Templates" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-[#FAFAFA]">
          Select a template to create a new contract
        </p>
        <div className="grid grid-cols-1 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg hover:border-[#262626]/50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#161616]/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#FAFAFA]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#FAFAFA]">{template.name}</p>
                  <p className="text-xs text-[#FAFAFA]">{template.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#FAFAFA]">Used {template.usage_count} times</span>
                <ChevronRight className="w-4 h-4 text-[#FAFAFA] group-hover:text-[#FAFAFA]" />
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => onSelect({ id: "", name: "Blank", content: "", variables: [], is_active: true, usage_count: 0, org_id: "", created_at: "" })}
          className="w-full py-3 border-2 border-dashed border-[#262626] rounded-lg text-sm text-[#ccc] hover:text-[#FAFAFA] hover:border-[#262626]/50 transition-all"
        >
          + Start from Scratch
        </button>
      </div>
    </Modal>
  );
}

export default function ContractsPage() {
  const {
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    addContract,
    updateContract,
    deleteContract,
    filteredContracts,
    getStats,
  } = useContractsStore();

  const addToast = useToastStore((s) => s.addToast);
  const contracts = filteredContracts();
  const stats = getStats();

  const [showFilters, setShowFilters] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const handleCreate = (data: Partial<Contract>) => {
    const contract: Contract = {
      id: crypto.randomUUID(),
      org_id: "org1",
      title: data.title || "",
      description: data.description,
      parties: data.parties || [],
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date,
      value: data.value || 0,
      currency: data.currency || "CAD",
      payment_terms: data.payment_terms,
      status: "draft",
      auto_renew: data.auto_renew || false,
      renewal_days: data.renewal_days || 30,
      tags: data.tags || [],
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addContract(contract);
    setCreateModalOpen(false);
    addToast("Contract created successfully");
  };

  const handleUpdate = (data: Partial<Contract>) => {
    if (!editingContract) return;
    updateContract(editingContract.id, data);
    setEditingContract(null);
    addToast("Contract updated successfully");
  };

  const handleDelete = (id: string) => {
    deleteContract(id);
    addToast("Contract deleted", "info");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Contracts & Agreements
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            {contracts.length} contracts
          </p>
        </div>
        <button
          onClick={() => setTemplatesModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#7DD3FC] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={formatCurrency(stats.totalValue)}
          subtext="Active contracts"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          label="Active"
          value={stats.activeCount}
          subtext="Current contracts"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          subtext="Next 30 days"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          label="Pending Signatures"
          value={stats.pendingSignatures}
          subtext="Awaiting sign-off"
          icon={FileSignature}
          color="red"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#262626]/40 transition-colors">
          <Search className="w-4 h-4 text-[#FAFAFA]" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#FAFAFA] placeholder:text-[#FAFAFA]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#ccc] hover:text-[#FAFAFA]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all",
            showFilters || statusFilter
              ? "border-[#262626]/50 text-[#FAFAFA] bg-[#161616]/10"
              : "border-[#262626] text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
          )}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/50"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      )}

      {/* Contracts List */}
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Contract</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Parties</th>
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Period</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Value</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-[#FAFAFA] text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-[#0A0A0A]" />
                  No contracts found
                </td>
              </tr>
            ) : (
              contracts.map((contract, i) => (
                <tr
                  key={contract.id}
                  className={cn(
                    "hover:bg-[#0A0A0A]/50 transition-colors cursor-pointer border-b border-[#262626]/50 last:border-0",
                    i % 2 === 1 && "bg-[#0A0A0A]/20"
                  )}
                  onClick={() => setSelectedContract(contract)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#161616]/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#FAFAFA]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#FAFAFA]">{contract.title}</p>
                        {contract.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contract.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] text-[#FAFAFA]">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {contract.parties.slice(0, 3).map((party, j) => (
                        <div
                          key={j}
                          className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-[#262626] flex items-center justify-center"
                          title={party.name}
                        >
                          <span className="text-xs font-medium text-[#FAFAFA]">
                            {party.name.charAt(0)}
                          </span>
                        </div>
                      ))}
                      {contract.parties.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-[#161616]/20 border-2 border-[#262626] flex items-center justify-center">
                          <span className="text-xs font-medium text-[#FAFAFA]">
                            +{contract.parties.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#FAFAFA]">
                      {formatDate(contract.start_date)}
                    </p>
                    <p className="text-xs text-[#FAFAFA]">
                      {contract.end_date ? `to ${formatDate(contract.end_date)}` : "Ongoing"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-[#FAFAFA]">
                      {formatCurrency(contract.value, contract.currency)}
                    </p>
                    {contract.auto_renew && (
                      <span className="text-[10px] text-[#FAFAFA] flex items-center justify-end gap-1">
                        <RotateCcw className="w-3 h-3" />
                        Auto-renew
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={contract.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContract(contract);
                        }}
                        className="p-2 rounded-lg text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#161616]/10"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContract(contract);
                        }}
                        className="p-2 rounded-lg text-[#ccc] hover:text-[#FAFAFA] hover:bg-[#161616]/10"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contract.id);
                        }}
                        className="p-2 rounded-lg text-[#FAFAFA] hover:text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Templates Modal */}
      <TemplatesModal
        open={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelect={() => {
          setTemplatesModalOpen(false);
          setCreateModalOpen(true);
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={createModalOpen || !!editingContract}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingContract(null);
        }}
        title={editingContract ? "Edit Contract" : "New Contract"}
        size="xl"
      >
        <ContractForm
          contract={editingContract || undefined}
          onSubmit={editingContract ? handleUpdate : handleCreate}
          onCancel={() => {
            setCreateModalOpen(false);
            setEditingContract(null);
          }}
        />
      </Modal>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          open={!!selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}
