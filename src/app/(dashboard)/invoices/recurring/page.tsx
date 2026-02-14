'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, Plus, Search, MoreHorizontal, Play, Pause,
  Calendar, Clock, Loader2, Trash2, Edit2, FileText,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface RecurringInvoice {
  id: string;
  name: string;
  contact_id: string;
  contact_name?: string;
  frequency: string;
  next_invoice_date: string;
  total: number;
  is_active: boolean;
  auto_send: boolean;
  invoices_generated: number;
  last_generated_at: string | null;
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly'
};

export default function RecurringInvoicesPage() {
  const [invoices, setInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadRecurringInvoices();
  }, []);

  async function loadRecurringInvoices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_invoices')
        .select(`
          id, name, contact_id, frequency, next_invoice_date,
          total, is_active, auto_send, invoices_generated, last_generated_at,
          contacts:contact_id (name)
        `)
        .order('next_invoice_date', { ascending: true });

      if (error) throw error;

      const mapped = data?.map((inv: any) => ({
        ...inv,
        contact_name: (inv.contacts as any)?.name
      })) || [];

      setInvoices(mapped);
    } catch (error) {
      console.error('Failed to load recurring invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .update({ is_active: active })
        .eq('id', id);

      if (error) throw error;

      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, is_active: active } : inv
      ));
      toast.success(active ? 'Recurring invoice activated' : 'Recurring invoice paused');
    } catch (error) {
      toast.error('Failed to update');
    }
  }

  async function generateNow(id: string) {
    setGenerating(id);
    try {
      const { data, error } = await supabase.rpc('generate_recurring_invoice', {
        p_recurring_id: id
      });

      if (error) throw error;

      toast.success('Invoice generated!');
      loadRecurringInvoices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invoice');
    } finally {
      setGenerating(null);
    }
  }

  async function deleteRecurring(id: string) {
    if (!confirm('Delete this recurring invoice template?')) return;

    try {
      const { error } = await supabase
        .from('recurring_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Deleted');
      loadRecurringInvoices();
    } catch (error) {
      toast.error('Failed to delete');
    }
  }

  const filtered = invoices.filter(inv => 
    inv.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = invoices.filter(i => i.is_active).length;
  const totalMRR = invoices
    .filter(i => i.is_active && i.frequency === 'monthly')
    .reduce((sum, i) => sum + i.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#38BDF8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/invoices" className="text-[#94A3B8] hover:text-white">
              Invoices
            </Link>
            <span className="text-[#64748B]">/</span>
            <span className="text-white">Recurring</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Recurring Invoices</h1>
          <p className="text-[#94A3B8]">
            Automate subscription and retainer billing
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-[#0F172A]">
          <Plus className="h-4 w-4 mr-2" />
          New Recurring Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-[#38BDF8]">{formatCurrency(totalMRR)}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Total Generated</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {invoices.reduce((sum, i) => sum + i.invoices_generated, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-10 bg-[#1E293B] border-[#334155] text-white"
        />
      </div>

      {/* Table */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155] hover:bg-transparent">
                <TableHead className="text-[#94A3B8]">Name</TableHead>
                <TableHead className="text-[#94A3B8]">Customer</TableHead>
                <TableHead className="text-[#94A3B8]">Frequency</TableHead>
                <TableHead className="text-[#94A3B8]">Next Invoice</TableHead>
                <TableHead className="text-[#94A3B8] text-right">Amount</TableHead>
                <TableHead className="text-[#94A3B8]">Status</TableHead>
                <TableHead className="text-[#94A3B8]">Generated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#64748B]">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recurring invoices</p>
                    <p className="text-sm">Create one to automate your billing</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => {
                  const nextDate = new Date(inv.next_invoice_date);
                  const isOverdue = inv.is_active && nextDate < new Date();

                  return (
                    <TableRow key={inv.id} className="border-[#334155] hover:bg-[#334155]/50">
                      <TableCell className="text-white font-medium">
                        {inv.name}
                      </TableCell>
                      <TableCell className="text-[#94A3B8]">
                        {inv.contact_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#334155] text-[#94A3B8]">
                          {frequencyLabels[inv.frequency]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOverdue && <AlertCircle className="h-4 w-4 text-amber-400" />}
                          <span className={isOverdue ? 'text-amber-400' : 'text-[#94A3B8]'}>
                            {nextDate.toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white font-medium">
                        {formatCurrency(inv.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={inv.is_active}
                            onCheckedChange={(checked) => toggleActive(inv.id, checked)}
                          />
                          <span className={inv.is_active ? 'text-green-400' : 'text-[#64748B]'}>
                            {inv.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#94A3B8]">
                        {inv.invoices_generated}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1E293B] border-[#334155]">
                            <DropdownMenuItem
                              onClick={() => generateNow(inv.id)}
                              disabled={generating === inv.id}
                            >
                              {generating === inv.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4 mr-2" />
                              )}
                              Generate Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#334155]" />
                            <DropdownMenuItem
                              onClick={() => deleteRecurring(inv.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
