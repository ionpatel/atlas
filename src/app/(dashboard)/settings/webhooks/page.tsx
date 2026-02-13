'use client';

import { useState, useEffect } from 'react';
import { 
  Webhook, Plus, Trash2, Edit2, Play, Loader2, 
  Check, X, AlertTriangle, Clock, ChevronDown, Copy,
  ExternalLink, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WebhookData {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  last_triggered: string | null;
  failure_count: number;
  created_at: string;
}

interface WebhookDelivery {
  id: string;
  event_type: string;
  status_code: number | null;
  success: boolean;
  attempt_count: number;
  created_at: string;
  response_body?: string;
}

const EVENT_TYPES = [
  { value: 'invoice.created', label: 'Invoice Created', category: 'Invoices' },
  { value: 'invoice.paid', label: 'Invoice Paid', category: 'Invoices' },
  { value: 'invoice.overdue', label: 'Invoice Overdue', category: 'Invoices' },
  { value: 'contact.created', label: 'Contact Created', category: 'Contacts' },
  { value: 'contact.updated', label: 'Contact Updated', category: 'Contacts' },
  { value: 'inventory.low_stock', label: 'Low Stock Alert', category: 'Inventory' },
  { value: 'inventory.updated', label: 'Inventory Updated', category: 'Inventory' },
  { value: 'sale.completed', label: 'Sale Completed', category: 'Sales' },
  { value: 'order.created', label: 'Order Created', category: 'Orders' },
  { value: 'employee.created', label: 'Employee Created', category: 'HR' },
  { value: 'payroll.processed', label: 'Payroll Processed', category: 'HR' },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<WebhookData | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Record<string, WebhookDelivery[]>>({});
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);
  const [generatedSecret, setGeneratedSecret] = useState('');

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }

  async function loadDeliveries(webhookId: string) {
    try {
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDeliveries(prev => ({ ...prev, [webhookId]: data || [] }));
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  }

  function openCreateDialog() {
    setEditing(null);
    setFormName('');
    setFormUrl('');
    setFormEvents([]);
    setFormActive(true);
    setGeneratedSecret(generateSecret());
    setShowDialog(true);
  }

  function openEditDialog(webhook: WebhookData) {
    setEditing(webhook);
    setFormName(webhook.name);
    setFormUrl(webhook.url);
    setFormEvents(webhook.events);
    setFormActive(webhook.is_active);
    setGeneratedSecret('');
    setShowDialog(true);
  }

  function generateSecret() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return 'whsec_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  async function saveWebhook() {
    if (!formName || !formUrl || formEvents.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('webhooks')
          .update({
            name: formName,
            url: formUrl,
            events: formEvents,
            is_active: formActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Webhook updated');
      } else {
        // Get current org
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: prefs } = await supabase
          .from('user_org_preferences')
          .select('last_org_id')
          .eq('user_id', user.id)
          .single();

        const orgId = prefs?.last_org_id || '00000000-0000-0000-0000-000000000001';

        const { error } = await supabase
          .from('webhooks')
          .insert({
            org_id: orgId,
            name: formName,
            url: formUrl,
            secret: generatedSecret,
            events: formEvents,
            is_active: formActive
          });

        if (error) throw error;
        toast.success('Webhook created');
      }

      setShowDialog(false);
      loadWebhooks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save webhook');
    } finally {
      setSaving(false);
    }
  }

  async function deleteWebhook(id: string) {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Webhook deleted');
      loadWebhooks();
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  }

  async function toggleWebhook(id: string, active: boolean) {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setWebhooks(prev => prev.map(w => 
        w.id === id ? { ...w, is_active: active } : w
      ));
    } catch (error) {
      toast.error('Failed to update webhook');
    }
  }

  async function testWebhook(webhook: WebhookData) {
    setTestingWebhook(webhook.id);
    try {
      // Send test payload
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook from Atlas ERP' }
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Atlas-Signature': 'test_signature',
          'X-Atlas-Event': 'test'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast.success('Test webhook sent successfully');
      } else {
        toast.error(`Webhook returned status ${response.status}`);
      }
    } catch (error: any) {
      toast.error(`Failed to send test: ${error.message}`);
    } finally {
      setTestingWebhook(null);
    }
  }

  function toggleEvent(event: string) {
    setFormEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  }

  function copySecret(secret: string) {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#CDB49E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-neutral-400 mt-1">
            Receive real-time notifications when events happen in your account
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-[#CDB49E] hover:bg-[#CDB49E]/90 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Webhook className="h-5 w-5 text-[#CDB49E]" />
            Configured Webhooks
          </CardTitle>
          <CardDescription className="text-neutral-400">
            {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No webhooks configured yet</p>
              <p className="text-sm">Create your first webhook to receive event notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Collapsible 
                  key={webhook.id}
                  open={expandedWebhook === webhook.id}
                  onOpenChange={(open) => {
                    setExpandedWebhook(open ? webhook.id : null);
                    if (open) loadDeliveries(webhook.id);
                  }}
                >
                  <div className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                        />
                        <div>
                          <h3 className="text-white font-medium">{webhook.name}</h3>
                          <p className="text-sm text-neutral-500 truncate max-w-md">
                            {webhook.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {webhook.failure_count > 0 && (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {webhook.failure_count} failures
                          </Badge>
                        )}
                        <div className="flex gap-1">
                          {webhook.events.slice(0, 2).map(event => (
                            <Badge key={event} variant="outline" className="border-neutral-700 text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="border-neutral-700 text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testWebhook(webhook)}
                          disabled={testingWebhook === webhook.id}
                        >
                          {testingWebhook === webhook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(webhook)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWebhook(webhook.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              expandedWebhook === webhook.id ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="mt-4">
                      <div className="border-t border-neutral-800 pt-4">
                        <h4 className="text-sm font-medium text-white mb-2">Recent Deliveries</h4>
                        {deliveries[webhook.id]?.length ? (
                          <Table>
                            <TableHeader>
                              <TableRow className="border-neutral-800">
                                <TableHead className="text-neutral-400">Event</TableHead>
                                <TableHead className="text-neutral-400">Status</TableHead>
                                <TableHead className="text-neutral-400">Time</TableHead>
                                <TableHead className="text-neutral-400">Attempts</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {deliveries[webhook.id].map((delivery) => (
                                <TableRow key={delivery.id} className="border-neutral-800">
                                  <TableCell className="text-white">{delivery.event_type}</TableCell>
                                  <TableCell>
                                    {delivery.success ? (
                                      <Badge className="bg-green-500/20 text-green-400">
                                        <Check className="h-3 w-3 mr-1" />
                                        {delivery.status_code}
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                                        <X className="h-3 w-3 mr-1" />
                                        {delivery.status_code || 'Failed'}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-neutral-400">
                                    {new Date(delivery.created_at).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-neutral-400">
                                    {delivery.attempt_count}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-neutral-500 text-sm">No deliveries yet</p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? 'Edit Webhook' : 'Create Webhook'}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {editing 
                ? 'Update your webhook configuration'
                : 'Configure a new webhook endpoint to receive event notifications'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="My Webhook"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url" className="text-white">Endpoint URL</Label>
                <Input
                  id="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://api.example.com/webhooks"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>

            {!editing && generatedSecret && (
              <div className="space-y-2">
                <Label className="text-white">Signing Secret</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedSecret}
                    readOnly
                    className="bg-neutral-800 border-neutral-700 text-white font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copySecret(generatedSecret)}
                    className="border-neutral-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-amber-400">
                  ⚠️ Save this secret now! It won't be shown again.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white">Events to subscribe</Label>
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-800/50 rounded-lg max-h-64 overflow-y-auto">
                {Object.entries(
                  EVENT_TYPES.reduce((acc, event) => {
                    if (!acc[event.category]) acc[event.category] = [];
                    acc[event.category].push(event);
                    return acc;
                  }, {} as Record<string, typeof EVENT_TYPES>)
                ).map(([category, events]) => (
                  <div key={category}>
                    <p className="text-sm font-medium text-[#CDB49E] mb-2">{category}</p>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div key={event.value} className="flex items-center gap-2">
                          <Checkbox
                            id={event.value}
                            checked={formEvents.includes(event.value)}
                            onCheckedChange={() => toggleEvent(event.value)}
                          />
                          <label 
                            htmlFor={event.value}
                            className="text-sm text-neutral-300 cursor-pointer"
                          >
                            {event.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formActive}
                onCheckedChange={setFormActive}
              />
              <Label htmlFor="active" className="text-white">
                Enable webhook
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveWebhook}
              disabled={saving || !formName || !formUrl || formEvents.length === 0}
              className="bg-[#CDB49E] hover:bg-[#CDB49E]/90 text-black"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Update' : 'Create'} Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
