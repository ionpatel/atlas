"use client";

import { create } from "zustand";
import type { User, Organization, OrgMember } from "@/types";

interface AuthState {
  user: User | null;
  organization: Organization | null;
  membership: OrgMember | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setMembership: (membership: OrgMember | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  membership: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setOrganization: (organization) => set({ organization }),
  setMembership: (membership) => set({ membership }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () =>
    set({
      user: null,
      organization: null,
      membership: null,
      loading: false,
      initialized: true,
    }),
}));
