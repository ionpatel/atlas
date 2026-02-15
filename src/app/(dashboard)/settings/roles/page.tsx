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
    admin: "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA] border-[#262626]/20",
    manager: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    employee: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    viewer: "bg-[#0A0A0A] text-[#FAFAFA] border-[#262626]",
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
          ? "bg-[#161616] border-[#262626]"
          : "bg-[#0A0A0A] border-[#262626] hover:border-[#262626]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {checked && <Check className="w-3 h-3 text-[#0A0A0A]" />}
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
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
      {/* Role Header */}
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#0A0A0A]/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-lg border", getRoleColor(role.name))}>
            <RoleIcon name={role.name} className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">{role.name}</h3>
              {role.is_system && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-[#0A0A0A] text-[#FAFAFA]">
                  System
                </span>
              )}
            </div>
            <p className="text-xs text-[#FAFAFA] mt-0.5">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#FAFAFA]">
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
                  className="p-1.5 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-[#FAFAFA] hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#FAFAFA]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#FAFAFA]" />
            )}
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      {isExpanded && (
        <div className="border-t border-[#262626]">
          <div className="px-6 py-3 bg-[#0A0A0A]/50">
            <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 text-[10px] font-medium uppercase tracking-wider text-[#FAFAFA]">
              <div>Module</div>
              <div className="text-center">View</div>
              <div className="text-center">Create</div>
              <div className="text-center">Edit</div>
              <div className="text-center">Delete</div>
            </div>
          </div>
          <div className="divide-y divide-[#E6D4C7]/50">
            {moduleConfig.map((m) => {
              const permission = role.permissions.find((p) => p.module === m.module);
              if (!permission) return null;
              return (
                <div
                  key={m.module}
                  className="px-6 py-3 grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 items-center hover:bg-[#0A0A0A]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <m.icon className="w-4 h-4 text-[#FAFAFA]" />
                    <span className="text-sm text-[#FAFAFA]">{m.label}</span>
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
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#262626]">
        <h3 className="text-sm font-semibold text-[#FAFAFA]">User Role Assignments</h3>
        <p className="text-xs text-[#FAFAFA] mt-1">Assign roles to team members</p>
      </div>
      <div className="divide-y divide-[#E6D4C7]/50">
        {users.map((user) => (
          <div
            key={user.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#0A0A0A]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#262626] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#FAFAFA]">{user.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#FAFAFA]">{user.name}</p>
                <p className="text-xs text-[#FAFAFA] mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="relative">
              <select
                value={user.role_id}
                onChange={() => {}}
                className="appearance-none px-4 py-2 pr-8 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#262626]/40 cursor-pointer"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAFAFA] pointer-events-none" />
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
        className="inline-flex items-center gap-2 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Roles & Permissions
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            Manage user roles and their access permissions
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200">
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0A0A0A] rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab("roles")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "roles"
              ? "bg-[#161616] text-[#0A0A0A]"
              : "text-[#FAFAFA] hover:text-[#FAFAFA]"
          )}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "users"
              ? "bg-[#161616] text-[#0A0A0A]"
              : "text-[#FAFAFA] hover:text-[#FAFAFA]"
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
      <div className="mt-8 p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#FAFAFA]">About System Roles</h4>
            <p className="text-xs text-[#FAFAFA] mt-1 leading-relaxed">
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
