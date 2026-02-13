"use client";

import { create } from "zustand";
import type { 
  User, 
  Organization, 
  OrgMember, 
  UserPermissions, 
  Role, 
  ModuleName, 
  PermissionAction 
} from "@/types";

interface AuthState {
  user: User | null;
  organization: Organization | null;
  membership: OrgMember | null;
  permissions: UserPermissions[];
  roles: Role[];
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setMembership: (membership: OrgMember | null) => void;
  setPermissions: (permissions: UserPermissions[]) => void;
  setRoles: (roles: Role[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  membership: null,
  permissions: [],
  roles: [],
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setOrganization: (organization) => set({ organization }),
  setMembership: (membership) => set({ membership }),
  setPermissions: (permissions) => set({ permissions }),
  setRoles: (roles) => set({ roles }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () =>
    set({
      user: null,
      organization: null,
      membership: null,
      permissions: [],
      roles: [],
      loading: false,
      initialized: true,
    }),
}));

/**
 * Hook to get all permissions for the current user
 */
export function usePermissions(): UserPermissions[] {
  return useAuthStore((state) => state.permissions);
}

/**
 * Hook to get the current user's roles
 */
export function useRoles(): Role[] {
  return useAuthStore((state) => state.roles);
}

/**
 * Check if the current user has a specific permission
 */
export function hasPermission(
  permissions: UserPermissions[],
  module: ModuleName,
  action: PermissionAction
): boolean {
  const modulePermission = permissions.find((p) => p.module === module);
  if (!modulePermission) return false;

  switch (action) {
    case "view":
      return modulePermission.can_view;
    case "create":
      return modulePermission.can_create;
    case "edit":
      return modulePermission.can_edit;
    case "delete":
      return modulePermission.can_delete;
    default:
      return false;
  }
}

/**
 * Hook to check a specific permission
 */
export function useHasPermission(
  module: ModuleName,
  action: PermissionAction
): boolean {
  const permissions = usePermissions();
  return hasPermission(permissions, module, action);
}

/**
 * Hook to get permissions for a specific module
 */
export function useModulePermissions(module: ModuleName): UserPermissions | null {
  const permissions = usePermissions();
  return permissions.find((p) => p.module === module) || null;
}

/**
 * Check if user can view a module (for sidebar visibility)
 */
export function useCanView(module: ModuleName): boolean {
  return useHasPermission(module, "view");
}

/**
 * Check if user can create in a module
 */
export function useCanCreate(module: ModuleName): boolean {
  return useHasPermission(module, "create");
}

/**
 * Check if user can edit in a module
 */
export function useCanEdit(module: ModuleName): boolean {
  return useHasPermission(module, "edit");
}

/**
 * Check if user can delete in a module
 */
export function useCanDelete(module: ModuleName): boolean {
  return useHasPermission(module, "delete");
}

/**
 * Check if user is admin (has settings access with all permissions)
 */
export function useIsAdmin(): boolean {
  const permissions = usePermissions();
  const settingsPermission = permissions.find((p) => p.module === "settings");
  return settingsPermission
    ? settingsPermission.can_view &&
        settingsPermission.can_create &&
        settingsPermission.can_edit &&
        settingsPermission.can_delete
    : false;
}

/**
 * Generate default admin permissions (for demo/development)
 */
export function getDefaultAdminPermissions(): UserPermissions[] {
  const modules: ModuleName[] = [
    "inventory",
    "invoices",
    "contacts",
    "accounting",
    "sales",
    "purchase",
    "crm",
    "employees",
    "payroll",
    "projects",
    "reports",
    "settings",
    "website",
    "pos",
    "dashboard",
    "apps",
  ];

  return modules.map((module) => ({
    module,
    can_view: true,
    can_create: true,
    can_edit: true,
    can_delete: true,
  }));
}

/**
 * Generate viewer-only permissions
 */
export function getViewerPermissions(): UserPermissions[] {
  const viewableModules: ModuleName[] = [
    "inventory",
    "invoices",
    "contacts",
    "accounting",
    "sales",
    "purchase",
    "crm",
    "projects",
    "reports",
    "website",
    "pos",
    "dashboard",
    "apps",
  ];

  return viewableModules.map((module) => ({
    module,
    can_view: true,
    can_create: false,
    can_edit: false,
    can_delete: false,
  }));
}
