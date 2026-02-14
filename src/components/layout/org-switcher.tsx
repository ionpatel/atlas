"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
}

interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrg: Organization;
  onSwitch: (orgId: string) => void;
  onCreateNew?: () => void;
  collapsed?: boolean;
}

export function OrgSwitcher({
  organizations,
  currentOrg,
  onSwitch,
  onCreateNew,
  collapsed = false,
}: OrgSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl bg-[#F5F2E8] border border-[#D4CDB8] hover:border-[#3a3a3a] transition-all",
          collapsed && "justify-center"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9C4A29] to-[#a08c75] flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-[#E8E3CC]" />
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-[#2D1810] truncate">
                {currentOrg.name}
              </p>
              <p className="text-[10px] text-[#6B5B4F] capitalize">
                {currentOrg.role}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#8B7B6F] transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute z-50 w-64 mt-2 bg-[#E8E3CC] border border-[#D4CDB8] rounded-xl shadow-2xl overflow-hidden",
              collapsed ? "left-full ml-2 top-0" : "left-0 top-full"
            )}
          >
            <div className="p-2 border-b border-[#D4CDB8]">
              <p className="px-2 py-1 text-[10px] font-medium text-[#8B7B6F] uppercase tracking-wider">
                Your Organizations
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSwitch(org.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F2E8] transition-colors",
                    org.id === currentOrg.id && "bg-[#F5F2E8]"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#DDD7C0] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-[#6B5B4F]" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-[#2D1810] truncate">
                      {org.name}
                    </p>
                    <p className="text-[10px] text-[#6B5B4F] capitalize">
                      {org.role}
                    </p>
                  </div>
                  {org.id === currentOrg.id && (
                    <Check className="w-4 h-4 text-[#9C4A29]" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-[#D4CDB8] p-2">
              <button
                onClick={() => {
                  window.location.href = "/settings/organization";
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8] rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Organization Settings
              </button>
              <button
                onClick={() => {
                  window.location.href = "/settings/users";
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8] rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Manage Team
              </button>
              {onCreateNew && (
                <button
                  onClick={() => {
                    onCreateNew();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#9C4A29] hover:bg-[#9C4A29]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Organization
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Demo component with mock data
export function OrgSwitcherDemo({ collapsed = false }: { collapsed?: boolean }) {
  const mockOrgs: Organization[] = [
    { id: "1", name: "Atlas Demo", slug: "atlas-demo", role: "owner", isOwner: true },
    { id: "2", name: "Acme Corp", slug: "acme-corp", role: "admin", isOwner: false },
    { id: "3", name: "Personal Projects", slug: "personal", role: "member", isOwner: false },
  ];

  const [currentOrg, setCurrentOrg] = useState(mockOrgs[0]);

  const handleSwitch = (orgId: string) => {
    const org = mockOrgs.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      // In real app, would call API and refresh data
    }
  };

  return (
    <OrgSwitcher
      organizations={mockOrgs}
      currentOrg={currentOrg}
      onSwitch={handleSwitch}
      onCreateNew={() => alert("Create new organization")}
      collapsed={collapsed}
    />
  );
}
