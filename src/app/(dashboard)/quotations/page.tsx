'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, MoreHorizontal, 
  Send, CheckCircle, XCircle, Clock, ArrowRight,
  Loader2, Download, Copy, Trash2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface Quotation {
  id: string;
  quote_number: string;
  contact_id: string;
  contact_name?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  issue_date: string;
  expiry_date: string | null;
  total: number;
  created_at: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-neutral-500/20 text-neutral-400', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400', icon: Send },
  accepted: { label: 'Accepted', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-amber-500/20 text-amber-400', icon: Clock },
  converted: { label: 'Converted', color: 'bg-purple-500/20 text-purple-400', icon: ArrowRight },
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [converting, setConverting] = useState<string | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  async function loadQuotations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          id,
          quote_number,
          contact_id,
          status,
          issue_date,
          expiry_date,
          total,
          created_at,
          contacts:contact_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data?.map((q: any) => ({
        ...q,
        contact_name: (q.contacts as any)?.name
      })) || [];

      setQuotations(mapped);
    } catch (error) {
      console.error('Failed to load quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  }

  async function convertToInvoice(quoteId: string) {
    setConverting(quoteId);
    try {
      const { data, error } = await supabase.rpc('convert_quote_to_invoice', {
        p_quote_id: quoteId
      });

      if (error) throw error;

      toast.success('Quote converted to invoice!');
      loadQuotations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to convert quote');
    } finally {
      setConverting(null);
    }
  }

  async function deleteQuotation(id: string) {
    if (!confirm('Delete this quotation?')) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Quotation deleted');
      loadQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  }

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
                          q.contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
  };

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
          <h1 className="text-2xl font-bold text-white">Quotations</h1>
          <p className="text-[#FAFAFA] mt-1">
            Create estimates and convert them to invoices
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#CDB49E] to-[#B89B78] text-[#0A0A0A] hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          New Quotation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-[#0A0A0A] border-[#262626]">
          <CardContent className="p-4">
            <p className="text-sm text-[#FAFAFA]">Total Quotes</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-[#262626]">
          <CardContent className="p-4">
            <p className="text-sm text-[#FAFAFA]">Drafts</p>
            <p className="text-2xl font-bold text-neutral-400">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-[#262626]">
          <CardContent className="p-4">
            <p className="text-sm text-[#FAFAFA]">Sent</p>
            <p className="text-2xl font-bold text-blue-400">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-[#262626]">
          <CardContent className="p-4">
            <p className="text-sm text-[#FAFAFA]">Accepted</p>
            <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-[#262626]">
          <CardContent className="p-4">
            <p className="text-sm text-[#FAFAFA]">Total Value</p>
            <p className="text-2xl font-bold text-[#FAFAFA]">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FAFAFA]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes..."
            className="pl-10 bg-[#0A0A0A] border-[#262626] text-white"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-[#262626] text-white">
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === 'all' ? 'All Status' : statusConfig[statusFilter as keyof typeof statusConfig]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0A0A0A] border-[#262626]">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#0A0A0A]" />
            {Object.entries(statusConfig).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card className="bg-[#0A0A0A] border-[#262626]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#262626] hover:bg-transparent">
                <TableHead className="text-[#FAFAFA]">Quote #</TableHead>
                <TableHead className="text-[#FAFAFA]">Customer</TableHead>
                <TableHead className="text-[#FAFAFA]">Status</TableHead>
                <TableHead className="text-[#FAFAFA]">Date</TableHead>
                <TableHead className="text-[#FAFAFA]">Expiry</TableHead>
                <TableHead className="text-[#FAFAFA] text-right">Amount</TableHead>
                <TableHead className="text-[#FAFAFA] w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#FAFAFA]">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quotations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotations.map((quote) => {
                  const status = statusConfig[quote.status];
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={quote.id} className="border-[#262626] hover:bg-[#0A0A0A]/50">
                      <TableCell className="text-white font-medium">
                        {quote.quote_number}
                      </TableCell>
                      <TableCell className="text-[#FAFAFA]">
                        {quote.contact_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#FAFAFA]">
                        {new Date(quote.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[#FAFAFA]">
                        {quote.expiry_date 
                          ? new Date(quote.expiry_date).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right text-white font-medium">
                        {formatCurrency(quote.total)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-[#262626]">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#0A0A0A]" />
                            {quote.status === 'accepted' && (
                              <DropdownMenuItem 
                                onClick={() => convertToInvoice(quote.id)}
                                disabled={converting === quote.id}
                              >
                                {converting === quote.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                )}
                                Convert to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => deleteQuotation(quote.id)}
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
