"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { User, Organization, OrgMember } from "@/types";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    organization,
    membership,
    loading,
    initialized,
    setUser,
    setOrganization,
    setMembership,
    setLoading,
    setInitialized,
    reset,
  } = useAuthStore();

  const supabase = createClient();

  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        reset();
        return null;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || "",
        avatar_url: profile?.avatar_url,
      };
      setUser(userData);

      // Get org membership
      const { data: memberData } = await supabase
        .from("org_members")
        .select("*, organizations(*)")
        .eq("user_id", authUser.id)
        .limit(1)
        .single();

      if (memberData) {
        const org = memberData.organizations as unknown as Organization;
        setOrganization(org);
        setMembership({
          id: memberData.id,
          org_id: memberData.org_id,
          user_id: memberData.user_id,
          role: memberData.role,
        } as OrgMember);
      }

      setInitialized(true);
      return userData;
    } catch {
      reset();
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase, setUser, setOrganization, setMembership, setLoading, setInitialized, reset]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        throw error;
      }

      await getCurrentUser();
      router.push("/dashboard");
      router.refresh();
    },
    [supabase, router, getCurrentUser, setLoading]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      orgName: string
    ) => {
      setLoading(true);

      const { data: authData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              org_name: orgName,
            },
          },
        });

      if (signUpError) {
        setLoading(false);
        throw signUpError;
      }

      if (!authData.user) {
        setLoading(false);
        throw new Error("Signup failed — no user returned");
      }

      // The DB trigger should create profile + org + membership.
      // Give it a moment, then load the user context.
      await new Promise((r) => setTimeout(r, 500));
      await getCurrentUser();
      router.push("/dashboard");
      router.refresh();
    },
    [supabase, router, getCurrentUser, setLoading]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    reset();
    router.push("/login");
    router.refresh();
  }, [supabase, router, reset]);

  return {
    user,
    organization,
    membership,
    loading,
    initialized,
    login,
    signup,
    logout,
    getCurrentUser,
  };
}
