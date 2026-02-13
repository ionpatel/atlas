"use client";

import { useMemo, useEffect, useState } from "react";
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
  Pencil,
  Trash2,
  User,
  Building2,
  Tag,
} from "lucide-react";
import { useEmployeesStore } from "@/stores/employees-store";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types";

/* ─────────── constants ─────────── */

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const AVATAR_COLORS = [
  "#CDB49E", "#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#fb923c", "#e879f9"
];

const DEPARTMENTS = [
  "Management", "Engineering", "Sales", "Support", "Marketing", "Finance", "Operations", "HR"
];

const TAGS = ["Manager", "Employee", "Remote", "Executive", "Contractor", "Part-time"];

const tagStyles: Record<string, string> = {
  Manager: "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20",
  Employee: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Remote: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Executive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Contractor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Part-time": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const statusBadge: Record<string, { label: string; style: string }> = {
  active: { label: "Active", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  on_leave: { label: "On Leave", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  terminated: { label: "Terminated", style: "bg-red-500/10 text-red-400 border-red-500/20" },
};

/* ─────────── helpers ─────────── */

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

/* ─────────── Employee Form Modal ─────────── */

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSave: (data: Omit<Employee, "id" | "created_at">) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function EmployeeFormModal({ isOpen, onClose, employee, onSave, onDelete }: EmployeeFormModalProps) {
  const isEditing = !!employee;
  
  const [formData, setFormData] = useState({
    name: "",
    job_title: "",
    department: "Engineering",
    email: "",
    phone: "",
    start_date: new Date().toISOString().split("T")[0],
    status: "active" as Employee["status"],
    tags: [] as string[],
    avatar_color: AVATAR_COLORS[0],
  });
  
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        job_title: employee.job_title || "",
        department: employee.department || "Engineering",
        email: employee.email || "",
        phone: employee.phone || "",
        start_date: employee.start_date || new Date().toISOString().split("T")[0],
        status: employee.status || "active",
        tags: employee.tags || [],
        avatar_color: employee.avatar_color || AVATAR_COLORS[0],
      });
    } else {
      setFormData({
        name: "",
        job_title: "",
        department: "Engineering",
        email: "",
        phone: "",
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        tags: [],
        avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      });
    }
    setShowDeleteConfirm(false);
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setSaving(true);
    try {
      await onSave({
        org_id: DEMO_ORG_ID,
        ...formData,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-[#f5f0eb]">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f0eb] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Color & Name */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#2a2a2a]"
                style={{ backgroundColor: formData.avatar_color + "18" }}
              >
                <span className="text-lg font-bold" style={{ color: formData.avatar_color }}>
                  {formData.name ? getInitials(formData.name) : "?"}
                </span>
              </div>
              <div className="flex gap-1">
                {AVATAR_COLORS.slice(0, 4).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, avatar_color: color }))}
                    className={cn(
                      "w-4 h-4 rounded-full transition-transform",
                      formData.avatar_color === color && "ring-2 ring-white ring-offset-2 ring-offset-[#141414] scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs text-[#888888] mb-1.5 block">Full Name *</label>
                <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 focus-within:border-[#CDB49E]/40 transition-colors">
                  <User className="w-4 h-4 text-[#555555]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith"
                    className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#555555]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888888] mb-1.5 block">Job Title</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData((p) => ({ ...p, job_title: e.target.value }))}
                  placeholder="Software Developer"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:border-[#CDB49E]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Department & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888888] mb-1.5 block">Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/40 focus:outline-none transition-colors appearance-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#888888] mb-1.5 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as Employee["status"] }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#f5f0eb] focus:border-[#CDB49E]/40 focus:outline-none transition-colors appearance-none"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888888] mb-1.5 block">Email</label>
              <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 focus-within:border-[#CDB49E]/40 transition-colors">
                <Mail className="w-4 h-4 text-[#555555]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@company.com"
                  className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#555555]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#888888] mb-1.5 block">Phone</label>
              <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 focus-within:border-[#CDB49E]/40 transition-colors">
                <Phone className="w-4 h-4 text-[#555555]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(416) 555-0123"
                  className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#555555]"
                />
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs text-[#888888] mb-1.5 block">Start Date</label>
            <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 focus-within:border-[#CDB49E]/40 transition-colors">
              <Calendar className="w-4 h-4 text-[#555555]" />
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
                className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-[#888888] mb-2 block flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    formData.tags.includes(tag)
                      ? tagStyles[tag] || "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20"
                      : "bg-[#1a1a1a] text-[#888888] border-[#2a2a2a] hover:border-[#3a3a3a]"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#2a2a2a]">
            {isEditing && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">Delete?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-[#888888] text-xs font-medium hover:text-[#f5f0eb]"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm font-medium text-[#888888] hover:text-[#f5f0eb] hover:border-[#3a3a3a] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const {
    employees,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    filteredEmployees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    loading,
  } = useEmployeesStore();

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees(DEMO_ORG_ID);
  }, [fetchEmployees]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
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

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<Employee, "id" | "created_at">) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, data);
    } else {
      await addEmployee(data);
    }
  };

  const handleDelete = async () => {
    if (editingEmployee) {
      await deleteEmployee(editingEmployee.id);
    }
  };

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
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Employee
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
                      onClick={() => handleOpenEdit(emp)}
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
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                  sb.style
                                )}
                              >
                                {sb.label}
                              </span>
                              <Pencil className="w-3.5 h-3.5 text-[#555555] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
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

                          {/* Tags */}
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
                          onClick={() => handleOpenEdit(emp)}
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

      {/* Employee Form Modal */}
      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editingEmployee}
        onSave={handleSave}
        onDelete={editingEmployee ? handleDelete : undefined}
      />
    </div>
  );
}
