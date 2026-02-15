'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, Users, Mail, Plus, Trash2, Clock, 
  Check, X, Crown, Shield, User, Eye, Loader2, Copy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Organization {
  org_id: string;
  org_name: string;
  org_slug: string;
  role: string;
  is_owner: boolean;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-[#FAFAFA]" />,
  admin: <Shield className="h-4 w-4 text-blue-400" />,
  manager: <Users className="h-4 w-4 text-green-400" />,
  member: <User className="h-4 w-4 text-[#999999]" />,
  viewer: <Eye className="h-4 w-4 text-[#888888]" />,
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadMembers(selectedOrg.org_id);
      loadInvitations(selectedOrg.org_id);
    }
  }, [selectedOrg]);

  async function loadOrganizations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_organizations', { p_user_id: user.id });

      if (error) throw error;

      setOrganizations(data || []);
      if (data?.length > 0) {
        setSelectedOrg(data[0]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers(orgId: string) {
    try {
      const { data, error } = await supabase
        .from('org_members')
        .select(`
          id,
          user_id,
          role,
          created_at,
          users:user_id (email)
        `)
        .eq('org_id', orgId);

      if (error) throw error;

      const mapped = data?.map((m: any) => ({
        ...m,
        email: (m.users as any)?.email
      })) || [];

      setMembers(mapped);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }

  async function loadInvitations(orgId: string) {
    try {
      const { data, error } = await supabase
        .from('org_invitations')
        .select('id, email, role, expires_at, created_at')
        .eq('org_id', orgId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  }

  async function sendInvitation() {
    if (!selectedOrg || !inviteEmail) return;

    setInviting(true);
    try {
      const { data, error } = await supabase.rpc('create_org_invitation', {
        p_org_id: selectedOrg.org_id,
        p_email: inviteEmail,
        p_role: inviteRole
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteDialog(false);
      loadInvitations(selectedOrg.org_id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  }

  async function cancelInvitation(invitationId: string) {
    try {
      const { error } = await supabase
        .from('org_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation cancelled');
      if (selectedOrg) {
        loadInvitations(selectedOrg.org_id);
      }
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const { error } = await supabase
        .from('org_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member removed');
      if (selectedOrg) {
        loadMembers(selectedOrg.org_id);
      }
    } catch (error) {
      toast.error('Failed to remove member');
    }
  }

  async function createOrganization() {
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create org
      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: slug
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      toast.success('Organization created!');
      setNewOrgName('');
      setShowCreateDialog(false);
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#FAFAFA]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-[#999999] mt-1">
            Manage your organizations and team members
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#161616] hover:bg-[#1A1A1A]/90 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111111] border-[#262626]">
            <DialogHeader>
              <DialogTitle className="text-white">Create Organization</DialogTitle>
              <DialogDescription className="text-[#999999]">
                Create a new organization to collaborate with your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-white">Organization Name</Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Acme Inc."
                  className="bg-[#1A1A1A] border-[#333333] text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createOrganization} 
                disabled={creating || !newOrgName.trim()}
                className="bg-[#161616] hover:bg-[#1A1A1A]/90 text-black"
              >
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organization Selector */}
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#FAFAFA]" />
            Your Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {organizations.map((org) => (
              <Button
                key={org.org_id}
                variant={selectedOrg?.org_id === org.org_id ? 'default' : 'outline'}
                onClick={() => setSelectedOrg(org)}
                className={selectedOrg?.org_id === org.org_id 
                  ? 'bg-[#161616] text-black hover:bg-[#161616]/90' 
                  : 'border-[#333333] text-white hover:bg-[#1A1A1A]'
                }
              >
                {roleIcons[org.role]}
                <span className="ml-2">{org.org_name}</span>
                {org.is_owner && (
                  <Badge variant="secondary" className="ml-2 bg-[#161616]/20 text-[#FAFAFA]">
                    Owner
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedOrg && (
        <>
          {/* Members */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#FAFAFA]" />
                  Team Members
                </CardTitle>
                <CardDescription className="text-[#999999]">
                  {members.length} member{members.length !== 1 ? 's' : ''} in {selectedOrg.org_name}
                </CardDescription>
              </div>
              {(selectedOrg.role === 'owner' || selectedOrg.role === 'admin') && (
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-[#333333]">
                      <Mail className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#111111] border-[#262626]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Invite Team Member</DialogTitle>
                      <DialogDescription className="text-[#999999]">
                        Send an invitation to join {selectedOrg.org_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@company.com"
                          className="bg-[#1A1A1A] border-[#333333] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="bg-[#1A1A1A] border-[#333333] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1A] border-[#333333]">
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={sendInvitation} 
                        disabled={inviting || !inviteEmail}
                        className="bg-[#161616] hover:bg-[#1A1A1A]/90 text-black"
                      >
                        {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#262626]">
                    <TableHead className="text-[#999999]">Member</TableHead>
                    <TableHead className="text-[#999999]">Role</TableHead>
                    <TableHead className="text-[#999999]">Joined</TableHead>
                    <TableHead className="text-right text-[#999999]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} className="border-[#262626]">
                      <TableCell className="text-white">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#333333] capitalize">
                          {roleIcons[member.role]}
                          <span className="ml-1">{member.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#999999]">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== 'owner' && (selectedOrg.role === 'owner' || selectedOrg.role === 'admin') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#FAFAFA]" />
                  Pending Invitations
                  <Badge className="bg-[#161616]/20 text-[#FAFAFA]">
                    {invitations.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#262626]">
                      <TableHead className="text-[#999999]">Email</TableHead>
                      <TableHead className="text-[#999999]">Role</TableHead>
                      <TableHead className="text-[#999999]">Expires</TableHead>
                      <TableHead className="text-right text-[#999999]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((inv) => (
                      <TableRow key={inv.id} className="border-[#262626]">
                        <TableCell className="text-white">{inv.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#333333] capitalize">
                            {inv.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#999999]">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInvitation(inv.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
