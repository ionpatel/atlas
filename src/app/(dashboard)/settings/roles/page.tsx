"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Crown,
  UserCog,
  User,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  Package,
  FileText,
  ShoppingCart,
  Calculator,
  Target,
  FolderKanban,
  Wallet,
  Globe,
  BarChart3,
  Store,
  LayoutGrid,
  LayoutDashboard,
  Truck,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleName, PermissionAction } from "@/types";

/* ─────────────────────── Types ─────────────────────── */

interface RolePermission {
  module: ModuleName;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  user_count: number;
  permissions: RolePermission[];
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role_id: string;
  role_name: string;
}

/* ─────────────────────── Module Config ─────────────────────── */

const moduleConfig: { module: ModuleName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { module: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { module: "apps", label: "Apps", icon: LayoutGrid },
  { module: "pos", label: "Point of Sale", icon: Store },
  { module: "inventory", label: "Inventory", icon: Package },
  { module: "invoices", label: "Invoices", icon: FileText },
  { module: "sales", label: "Sales", icon: ShoppingCart },
  { module: "purchase", label: "Purchase", icon: Truck },
  { module: "accounting", label: "Accounting", icon: Calculator },
  { module: "contacts", label: "Contacts", icon: Users },
  { module: "crm", label: "CRM", icon: Target },
  { module: "employees", label: "Employees", icon: UserCircle },
  { module: "payroll", label: "Payroll", icon: Wallet },
  { module: "projects", label: "Projects", icon: FolderKanban },
  { module: "reports", label: "Reports", icon: BarChart3 },
  { module: "settings", label: "Settings", icon: Settings },
];

/* ─────────────────────── Mock Data ─────────────────────── */

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access. Can manage all modules, users, and settings.",
    is_system: true,
    user_count: 2,
    permissions: moduleConfig.map((m) => ({
      module: m.module,
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
    })),
  },
  {
    id: "2",
    name: "Manager",
    description: "Can manage most modules but cannot change system settings or user roles.",
    is_system: true,
    user_count: 3,
    permissions: moduleConfig.map((m) => ({
      module: m.module,
      can_view: true,
      can_create: m.module !== "settings",
      can_edit: m.module !== "settings",
      can_delete: !["settings", "employees", "accounting"].includes(m.module),
    })),
  },
  {
    id: "3",
    name: "Employee",
    description: "Standard user access. Can view and edit assigned areas.",
    is_system: true,
    user_count: 8,
    permissions: moduleConfig.map((m) => ({
      module: m.module,
      can_view: !["employees", "payroll", "settings"].includes(m.module),
      can_create: ["inventory", "invoices", "sales", "purchase", "crm", "projects", "pos"].includes(m.module),
      can_edit: ["inventory", "invoices", "sales", "purchase", "crm", "projects", "pos"].includes(m.module),
      can_delete: false,
    })),
  },
  {
    id: "4",
    name: "Viewer",
    description: "Read-only access to most modules.",
    is_system: true,
    user_count: 2,
    permissions: moduleConfig.map((m) => ({
      module: m.module,
      can_view: !["employees", "payroll", "settings"].includes(m.module),
      can_create: false,
      can_edit: false,
      can_delete: false,
    })),
  },
];

const mockUsers: OrgUser[] = [
  { id: "1", name: "Harshil Patel", email: "harshil@atlas-erp.com", avatar: "HP", role_id: "1", role_name: "Admin" },
  { id: "2", name: "Sarah Chen", email: "sarah@atlas-erp.com", avatar: "SC", role_id: "1", role_name: "Admin" },
  { id: "3", name: "Marcus Johnson", email: "marcus@atlas-erp.com", avatar: "MJ", role_id: "2", role_name: "Manager" },
  { id: "4", name: "Emily Davis", email: "emily@atlas-erp.com", avatar: "ED", role_id: "3", role_name: "Employee" },
  { id: "5", name: "Alex Rivera", email: "alex@atlas-erp.com", avatar: "AR", role_id: "3", role_name: "Employee" },
  { id: "6", name: "Jordan Lee", email: "jordan@atlas-erp.com", avatar: "JL", role_id: "4", role_name: "Viewer" },
];

/* ─────────────────────── Role Icon ─────────────────────── */

function RoleIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    admin: Crown,
    manager: Shield,
    employee: UserCog,
    viewer: Eye,
  };
  const Icon = icons[name.toLowerCase()] || User;
  return <Icon className={className} />;
}

function getRoleColor(name: string): string {
  const colors: Record<string, string> = {
    admin: "bg-[rgba(156,74,41,0.15)] text-[#111827] border-[#E5E7EB]/20",
    manager: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    employee: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    viewer: "bg-[#F8F9FA] text-[#111827] border-[#E5E7EB]",
  };
  return colors[name.toLowerCase()] || colors.viewer;
}

/* ─────────────────────── Permission Checkbox ─────────────────────── */

function PermissionCheckbox({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "w-5 h-5 rounded border flex items-center justify-center transition-all",
        checked
          ? "bg-white border-[#E5E7EB]"
          : "bg-[#F8F9FA] border-[#E5E7EB] hover:border-[#E5E7EB]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
    </button>
  );
}

/* ─────────────────────── Role Card ─────────────────────── */

function RoleCard({
  role,
  isExpanded,
  onToggle,
  onEdit,
}: {
  role: Role;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl overflow-hidden">
      {/* Role Header */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FA]/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-lg border", getRoleColor(role.name))}>
            <RoleIcon name={role.name} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#111827]">{role.name}</h3>
              {role.is_system && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-[#F8F9FA] text-[#111827]">
                  System
                </span>
              )}
            </div>
            <p className="text-xs text-[#111827] mt-0.5">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#111827]">
            {role.user_count} user{role.user_count !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {!role.is_system && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-[#111827] hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#111827]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#111827]" />
            )}
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      {isExpanded && (
        <div className="border-t border-[#E5E7EB]">
          <div className="px-6 py-3 bg-[#F8F9FA]/50">
            <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 text-[10px] font-medium uppercase tracking-wider text-[#111827]">
              <div>Module</div>
              <div className="text-center">View</div>
              <div className="text-center">Create</div>
              <div className="text-center">Edit</div>
              <div className="text-center">Delete</div>
            </div>
          </div>
          <div className="divide-y divide-[#0A0A0A]/50">
            {moduleConfig.map((m) => {
              const permission = role.permissions.find((p) => p.module === m.module);
              if (!permission) return null;
              return (
                <div
                  key={m.module}
                  className="px-6 py-3 grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 items-center hover:bg-[#F8F9FA]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <m.icon className="w-4 h-4 text-[#111827]" />
                    <span className="text-sm text-[#111827]">{m.label}</span>
                  </div>
                  <div className="flex justify-center">
                    <PermissionCheckbox
                      checked={permission.can_view}
                      onChange={() => {}}
                      disabled={role.is_system}
                    />
                  </div>
                  <div className="flex justify-center">
                    <PermissionCheckbox
                      checked={permission.can_create}
                      onChange={() => {}}
                      disabled={role.is_system}
                    />
                  </div>
                  <div className="flex justify-center">
                    <PermissionCheckbox
                      checked={permission.can_edit}
                      onChange={() => {}}
                      disabled={role.is_system}
                    />
                  </div>
                  <div className="flex justify-center">
                    <PermissionCheckbox
                      checked={permission.can_delete}
                      onChange={() => {}}
                      disabled={role.is_system}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── User Assignment ─────────────────────── */

function UserRoleAssignment({
  users,
  roles,
}: {
  users: OrgUser[];
  roles: Role[];
}) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-[#111827]">User Role Assignments</h3>
        <p className="text-xs text-[#111827] mt-1">Assign roles to team members</p>
      </div>
      <div className="divide-y divide-[#0A0A0A]/50">
        {users.map((user) => (
          <div
            key={user.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#F8F9FA]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#111827]">{user.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">{user.name}</p>
                <p className="text-xs text-[#111827] mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="relative">
              <select
                value={user.role_id}
                onChange={() => {}}
                className="appearance-none px-4 py-2 pr-8 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#E5E7EB]/40 cursor-pointer"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827] pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function RolesPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>("1");
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");

  return (
    <div className="max-w-[1200px]">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm text-[#374151] hover:text-[#111827] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Roles & Permissions
          </h1>
          <p className="text-[#111827] text-sm mt-1">
            Manage user roles and their access permissions
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-white rounded-lg text-sm font-semibold hover:bg-white transition-all duration-200">
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F8F9FA] rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab("roles")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "roles"
              ? "bg-white text-white"
              : "text-[#374151] hover:text-[#111827]"
          )}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "users"
              ? "bg-white text-white"
              : "text-[#374151] hover:text-[#111827]"
          )}
        >
          User Assignments
        </button>
      </div>

      {/* Content */}
      {activeTab === "roles" ? (
        <div className="space-y-4">
          {mockRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isExpanded={expandedRole === role.id}
              onToggle={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
              onEdit={() => {}}
            />
          ))}
        </div>
      ) : (
        <UserRoleAssignment users={mockUsers} roles={mockRoles} />
      )}

      {/* Info box */}
      <div className="mt-8 p-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#111827]">About System Roles</h4>
            <p className="text-xs text-[#111827] mt-1 leading-relaxed">
              System roles (Admin, Manager, Employee, Viewer) cannot be edited or deleted.
              They serve as templates. To customize permissions, create a new role with
              the specific access levels you need.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
