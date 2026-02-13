"use client";

import { ReactNode } from "react";
import { usePermissions, hasPermission, useIsAdmin } from "@/stores/auth-store";
import type { ModuleName, PermissionAction } from "@/types";

interface PermissionGateProps {
  /**
   * The module to check permissions for
   */
  module: ModuleName;
  /**
   * The action to check (view, create, edit, delete)
   */
  action?: PermissionAction;
  /**
   * Content to render if permission is granted
   */
  children: ReactNode;
  /**
   * Optional fallback content if permission is denied
   */
  fallback?: ReactNode;
  /**
   * If true, admins bypass all permission checks
   */
  allowAdmin?: boolean;
  /**
   * If true, wraps in a span with disabled styling instead of hiding
   */
  disableInstead?: boolean;
  /**
   * Custom class for the disabled wrapper
   */
  disabledClassName?: string;
}

/**
 * PermissionGate - Conditionally render children based on user permissions
 * 
 * @example
 * // Hide completely if no view permission
 * <PermissionGate module="inventory" action="view">
 *   <InventoryTable />
 * </PermissionGate>
 * 
 * @example
 * // Show disabled button if no create permission
 * <PermissionGate module="invoices" action="create" disableInstead>
 *   <Button>New Invoice</Button>
 * </PermissionGate>
 * 
 * @example
 * // Show fallback content
 * <PermissionGate module="settings" action="edit" fallback={<p>Access denied</p>}>
 *   <SettingsForm />
 * </PermissionGate>
 */
export function PermissionGate({
  module,
  action = "view",
  children,
  fallback = null,
  allowAdmin = true,
  disableInstead = false,
  disabledClassName = "opacity-50 pointer-events-none cursor-not-allowed",
}: PermissionGateProps) {
  const permissions = usePermissions();
  const isAdmin = useIsAdmin();

  // Admin bypass
  if (allowAdmin && isAdmin) {
    return <>{children}</>;
  }

  // Check permission
  const hasAccess = hasPermission(permissions, module, action);

  if (hasAccess) {
    return <>{children}</>;
  }

  // No permission - either show disabled state or fallback
  if (disableInstead) {
    return (
      <span className={disabledClassName} aria-disabled="true">
        {children}
      </span>
    );
  }

  return <>{fallback}</>;
}

/**
 * RequirePermission - Similar to PermissionGate but throws or shows error
 */
interface RequirePermissionProps {
  module: ModuleName;
  action?: PermissionAction;
  children: ReactNode;
  errorMessage?: string;
}

export function RequirePermission({
  module,
  action = "view",
  children,
  errorMessage = "You don't have permission to access this resource.",
}: RequirePermissionProps) {
  const permissions = usePermissions();
  const isAdmin = useIsAdmin();
  const hasAccess = isAdmin || hasPermission(permissions, module, action);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m5.657-9.657a8 8 0 11-11.314 0M12 9v2"
              />
            </svg>
          </div>
          <p className="text-[#888888] text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * CanView - Shorthand for view permission check
 */
export function CanView({
  module,
  children,
  fallback,
}: {
  module: ModuleName;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate module={module} action="view" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * CanCreate - Shorthand for create permission check
 */
export function CanCreate({
  module,
  children,
  fallback,
  disableInstead,
}: {
  module: ModuleName;
  children: ReactNode;
  fallback?: ReactNode;
  disableInstead?: boolean;
}) {
  return (
    <PermissionGate
      module={module}
      action="create"
      fallback={fallback}
      disableInstead={disableInstead}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * CanEdit - Shorthand for edit permission check
 */
export function CanEdit({
  module,
  children,
  fallback,
  disableInstead,
}: {
  module: ModuleName;
  children: ReactNode;
  fallback?: ReactNode;
  disableInstead?: boolean;
}) {
  return (
    <PermissionGate
      module={module}
      action="edit"
      fallback={fallback}
      disableInstead={disableInstead}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * CanDelete - Shorthand for delete permission check
 */
export function CanDelete({
  module,
  children,
  fallback,
  disableInstead,
}: {
  module: ModuleName;
  children: ReactNode;
  fallback?: ReactNode;
  disableInstead?: boolean;
}) {
  return (
    <PermissionGate
      module={module}
      action="delete"
      fallback={fallback}
      disableInstead={disableInstead}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * AdminOnly - Only render for admin users
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const isAdmin = useIsAdmin();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}
