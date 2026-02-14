'use client';

import { useState, useEffect } from 'react';
import { 
  ReceiptText, Plus, Search, MoreHorizontal, 
  FileText, CheckCircle, Clock, XCircle,
  Loader2, Trash2, Eye, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface CreditNote {
  id: string;
  credit_note_number: string;
  invoice_id: string | null;
  contact_id: string;
  contact_name?: string;
  status: 'draft' | 'issued' | 'applied' | 'voided';
  issue_date: string;
  reason: string | null;
  total: number;
  amount_applied: number;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-neutral-500/20 text-neutral-400', icon: FileText },
  issued: { label: 'Issued', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
  applied: { label: 'Applied', color: 'bg-green-500/20 text-green-400', icon: ArrowRight },
  voided: { label: 'Voided', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCreditNotes();
  }, []);

  async function loadCreditNotes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credit_notes')
        .select(`
          id, credit_note_number, invoice_id, contact_id,
          status, issue_date, reason, total, amount_applied,
          contacts:contact_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data?.map(cn => ({
        ...cn,
        contact_name: (cn.contacts as any)?.name
      })) || [];

      setCreditNotes(mapped);
    } catch (error) {
      console.error('Failed to load credit notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCreditNote(id: string) {
    if (!confirm('Delete this credit note?')) return;

    try {
      const { error } = await supabase
        .from('credit_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Credit note deleted');
      loadCreditNotes();
    } catch (error) {
      toast.error('Failed to delete');
    }
  }

  const filtered = creditNotes.filter(cn => 
    cn.credit_note_number.toLowerCase().includes(search.toLowerCase()) ||
    cn.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalIssued = creditNotes
    .filter(cn => cn.status === 'issued')
    .reduce((sum, cn) => sum + cn.total, 0);

  const totalApplied = creditNotes
    .filter(cn => cn.status === 'applied')
    .reduce((sum, cn) => sum + cn.amount_applied, 0);

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
            <span className="text-white">Credit Notes</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Credit Notes</h1>
          <p className="text-[#94A3B8]">
            Issue refunds and credits to customers
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-[#0F172A]">
          <Plus className="h-4 w-4 mr-2" />
          New Credit Note
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <ReceiptText className="h-4 w-4" />
              <span className="text-sm">Total Credit Notes</span>
            </div>
            <p className="text-2xl font-bold text-white">{creditNotes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalIssued)}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Applied</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalApplied)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search credit notes..."
          className="pl-10 bg-[#1E293B] border-[#334155] text-white"
        />
      </div>

      {/* Table */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#334155] hover:bg-transparent">
                <TableHead className="text-[#94A3B8]">Credit Note #</TableHead>
                <TableHead className="text-[#94A3B8]">Customer</TableHead>
                <TableHead className="text-[#94A3B8]">Status</TableHead>
                <TableHead className="text-[#94A3B8]">Date</TableHead>
                <TableHead className="text-[#94A3B8]">Reason</TableHead>
                <TableHead className="text-[#94A3B8] text-right">Amount</TableHead>
                <TableHead className="text-[#94A3B8] text-right">Applied</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#64748B]">
                    <ReceiptText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No credit notes</p>
                    <p className="text-sm">Create one to issue a refund</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cn) => {
                  const status = statusConfig[cn.status];
                  const StatusIcon = status.icon;
                  const remaining = cn.total - cn.amount_applied;

                  return (
                    <TableRow key={cn.id} className="border-[#334155] hover:bg-[#334155]/50">
                      <TableCell className="text-white font-medium">
                        {cn.credit_note_number}
                      </TableCell>
                      <TableCell className="text-[#94A3B8]">
                        {cn.contact_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#94A3B8]">
                        {new Date(cn.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#94A3B8] max-w-[200px] truncate">
                        {cn.reason || '-'}
                      </TableCell>
                      <TableCell className="text-right text-white font-medium">
                        {formatCurrency(cn.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-400">{formatCurrency(cn.amount_applied)}</span>
                        {remaining > 0 && (
                          <span className="text-[#64748B] text-sm ml-1">
                            ({formatCurrency(remaining)} left)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1E293B] border-[#334155]">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            {cn.status === 'issued' && (
                              <DropdownMenuItem>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Apply to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-[#334155]" />
                            <DropdownMenuItem
                              onClick={() => deleteCreditNote(cn.id)}
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
