'use client';

import { useState, useEffect } from 'react';
import { 
  Landmark, Plus, Search, MoreHorizontal, Upload,
  ArrowUpRight, ArrowDownLeft, CheckCircle, Clock,
  Loader2, Trash2, Link2, RefreshCw, FileSpreadsheet,
  CreditCard, Wallet, PiggyBank
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface BankAccount {
  id: string;
  name: string;
  account_number: string | null;
  institution: string | null;
  account_type: string;
  current_balance: number;
  is_active: boolean;
}

interface BankTransaction {
  id: string;
  bank_account_id: string;
  transaction_date: string;
  description: string;
  reference: string | null;
  amount: number;
  type: string;
  status: 'pending' | 'matched' | 'reconciled' | 'excluded';
  matched_invoice_id: string | null;
}

const typeIcons: Record<string, any> = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400' },
  matched: { label: 'Matched', color: 'bg-blue-500/20 text-blue-400' },
  reconciled: { label: 'Reconciled', color: 'bg-green-500/20 text-green-400' },
  excluded: { label: 'Excluded', color: 'bg-gray-100 text-[#6B7280]' },
};

export default function BankReconciliationPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount);
    }
  }, [selectedAccount]);

  async function loadAccounts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('name');

      if (error) throw error;

      setAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions(accountId: string) {
    try {
      const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('bank_account_id', accountId)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  async function matchTransaction(txnId: string, invoiceId: string) {
    try {
      const { error } = await supabase
        .from('bank_transactions')
        .update({ 
          status: 'matched',
          matched_invoice_id: invoiceId
        })
        .eq('id', txnId);

      if (error) throw error;

      toast.success('Transaction matched to invoice');
      if (selectedAccount) loadTransactions(selectedAccount);
    } catch (error) {
      toast.error('Failed to match');
    }
  }

  async function reconcileTransaction(txnId: string) {
    try {
      const { error } = await supabase
        .from('bank_transactions')
        .update({ status: 'reconciled' })
        .eq('id', txnId);

      if (error) throw error;

      toast.success('Transaction reconciled');
      if (selectedAccount) loadTransactions(selectedAccount);
    } catch (error) {
      toast.error('Failed to reconcile');
    }
  }

  const selectedAccountData = accounts.find(a => a.id === selectedAccount);
  
  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.reference?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const totalDeposits = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/accounting" className="text-[#111827] hover:text-white">
              Accounting
            </Link>
            <span className="text-[#111827]">/</span>
            <span className="text-white">Bank Reconciliation</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Bank Reconciliation</h1>
          <p className="text-[#111827]">
            Match bank transactions to invoices and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-[#E5E7EB]"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Statement
          </Button>
          <Button className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {accounts.map((account) => {
          const Icon = typeIcons[account.account_type] || Wallet;
          const isSelected = selectedAccount === account.id;

          return (
            <Card 
              key={account.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-[#F8F9FA] border-[#E5E7EB] ring-1 ring-[#DC2626]' 
                  : 'bg-[#F8F9FA] border-[#E5E7EB] hover:border-[#475569]'
              }`}
              onClick={() => setSelectedAccount(account.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[#F8F9FA]">
                    <Icon className="h-4 w-4 text-[#111827]" />
                  </div>
                  {isSelected && (
                    <Badge className="bg-white/20 text-[#111827]">Selected</Badge>
                  )}
                </div>
                <h3 className="text-white font-medium">{account.name}</h3>
                <p className="text-xs text-[#111827] mb-2">
                  {account.institution} {account.account_number && `•••${account.account_number.slice(-4)}`}
                </p>
                <p className={`text-xl font-bold ${
                  account.current_balance >= 0 ? 'text-white' : 'text-red-400'
                }`}>
                  {formatCurrency(account.current_balance)}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {accounts.length === 0 && (
          <Card className="bg-[#F8F9FA] border-[#E5E7EB] border-dashed col-span-full">
            <CardContent className="p-8 text-center">
              <Landmark className="h-12 w-12 mx-auto mb-4 text-[#111827]" />
              <p className="text-[#111827]">No bank accounts yet</p>
              <p className="text-sm text-[#111827]">Add your first account to start reconciling</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedAccount && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-[#F8F9FA] border-[#E5E7EB]">
              <CardContent className="p-4">
                <p className="text-sm text-[#111827]">Transactions</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F8F9FA] border-[#E5E7EB]">
              <CardContent className="p-4">
                <p className="text-sm text-[#111827]">Pending Match</p>
                <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F8F9FA] border-[#E5E7EB]">
              <CardContent className="p-4">
                <p className="text-sm text-[#111827]">Deposits</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalDeposits)}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F8F9FA] border-[#E5E7EB]">
              <CardContent className="p-4">
                <p className="text-sm text-[#111827]">Withdrawals</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalWithdrawals)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="bg-[#F8F9FA] border-[#E5E7EB]">
            <CardHeader className="border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Transactions</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#111827]" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 bg-[#F8F9FA] border-[#E5E7EB] text-white h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#E5E7EB] hover:bg-transparent">
                    <TableHead className="text-[#111827]">Date</TableHead>
                    <TableHead className="text-[#111827]">Description</TableHead>
                    <TableHead className="text-[#111827]">Reference</TableHead>
                    <TableHead className="text-[#111827]">Status</TableHead>
                    <TableHead className="text-[#111827] text-right">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-[#111827]">
                        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transactions</p>
                        <p className="text-sm">Import a bank statement to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((txn) => {
                      const status = statusConfig[txn.status];
                      const isDeposit = txn.amount > 0;

                      return (
                        <TableRow key={txn.id} className="border-[#E5E7EB] hover:bg-[#F8F9FA]/50">
                          <TableCell className="text-[#111827]">
                            {new Date(txn.transaction_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              {isDeposit ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-400" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-400" />
                              )}
                              {txn.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-[#111827]">
                            {txn.reference || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            isDeposit ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {isDeposit ? '+' : ''}{formatCurrency(txn.amount)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#F8F9FA] border-[#E5E7EB]">
                                {txn.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem>
                                      <Link2 className="h-4 w-4 mr-2" />
                                      Match to Invoice
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => reconcileTransaction(txn.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Reconciled
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#F8F9FA]" />
                                  </>
                                )}
                                <DropdownMenuItem className="text-red-400">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Exclude
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
        </>
      )}

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="bg-[#F8F9FA] border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-white">Import Bank Statement</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center hover:border-[#E5E7EB] transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-4 text-[#111827]" />
              <p className="text-white font-medium mb-1">Drop your file here</p>
              <p className="text-sm text-[#111827]">CSV, OFX, or QIF format</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancel
            </Button>
            <Button className="bg-white text-white">
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
