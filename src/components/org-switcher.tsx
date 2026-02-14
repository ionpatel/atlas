'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Building2, Plus, Users, Check, Loader2, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/client';

interface Organization {
  org_id: string;
  org_name: string;
  org_slug: string;
  role: string;
  is_owner: boolean;
}

interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: string;
  expires_at: string;
  org_name?: string;
}

export function OrgSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadOrganizations();
    loadInvitations();
  }, []);

  async function loadOrganizations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's organizations
      const { data: orgs, error } = await supabase
        .rpc('get_user_organizations', { p_user_id: user.id });

      if (error) throw error;

      setOrganizations(orgs || []);

      // Get user's preferred org
      const { data: prefs } = await supabase
        .from('user_org_preferences')
        .select('last_org_id')
        .eq('user_id', user.id)
        .single();

      const lastOrgId = prefs?.last_org_id;
      const current = orgs?.find((o: Organization) => o.org_id === lastOrgId) || orgs?.[0];
      setCurrentOrg(current || null);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvitations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('org_invitations')
        .select(`
          id,
          org_id,
          email,
          role,
          expires_at,
          organizations:org_id (name)
        `)
        .eq('email', user.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const mapped = data?.map((inv: any) => ({
        ...inv,
        org_name: (inv.organizations as any)?.name
      })) || [];

      setInvitations(mapped);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  }

  async function switchOrg(org: Organization) {
    if (org.org_id === currentOrg?.org_id) return;
    
    setSwitching(true);
    try {
      const { error } = await supabase.rpc('switch_organization', { 
        p_org_id: org.org_id 
      });

      if (error) throw error;

      setCurrentOrg(org);
      // Reload page to refresh all data for new org
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setSwitching(false);
    }
  }

  async function acceptInvitation(invitation: Invitation) {
    try {
      // We need the token to accept - redirect to accept page
      window.location.href = `/accept-invitation?id=${invitation.id}`;
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-[#CDB49E]" />
        <span className="text-sm text-neutral-400">Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between px-3 py-2 h-auto hover:bg-neutral-800"
          disabled={switching}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-[#CDB49E]/10 border border-[#CDB49E]/20">
              <AvatarFallback className="bg-transparent text-[#CDB49E] text-sm font-medium">
                {currentOrg?.org_name?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium text-white truncate max-w-[140px]">
                {currentOrg?.org_name || 'Select Organization'}
              </p>
              <p className="text-xs text-neutral-500 capitalize">
                {currentOrg?.role || 'No role'}
              </p>
            </div>
          </div>
          {switching ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-64 bg-neutral-900 border-neutral-800" 
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-neutral-400 text-xs font-normal">
          Organizations
        </DropdownMenuLabel>

        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.org_id}
            onClick={() => switchOrg(org)}
            className="flex items-center justify-between cursor-pointer hover:bg-neutral-800"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neutral-500" />
              <div>
                <p className="text-sm text-white">{org.org_name}</p>
                <p className="text-xs text-neutral-500 capitalize">{org.role}</p>
              </div>
            </div>
            {org.org_id === currentOrg?.org_id && (
              <Check className="h-4 w-4 text-[#CDB49E]" />
            )}
          </DropdownMenuItem>
        ))}

        {invitations.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuLabel className="text-neutral-400 text-xs font-normal flex items-center gap-2">
              <Mail className="h-3 w-3" />
              Pending Invitations
              <Badge variant="secondary" className="bg-[#CDB49E]/10 text-[#CDB49E] text-xs">
                {invitations.length}
              </Badge>
            </DropdownMenuLabel>
            
            {invitations.map((inv) => (
              <DropdownMenuItem
                key={inv.id}
                onClick={() => acceptInvitation(inv)}
                className="flex items-center justify-between cursor-pointer hover:bg-neutral-800"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#CDB49E]" />
                  <div>
                    <p className="text-sm text-white">{inv.org_name}</p>
                    <p className="text-xs text-neutral-500">Join as {inv.role}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator className="bg-neutral-800" />

        <DropdownMenuItem 
          onClick={() => window.location.href = '/settings/organizations'}
          className="cursor-pointer hover:bg-neutral-800"
        >
          <Users className="h-4 w-4 mr-2 text-neutral-500" />
          <span>Manage Organizations</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => window.location.href = '/settings/organizations/new'}
          className="cursor-pointer hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4 mr-2 text-[#CDB49E]" />
          <span className="text-[#CDB49E]">Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
