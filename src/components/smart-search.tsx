'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Sparkles, Package, Users, FileText, 
  ShoppingCart, Loader2, ArrowRight, X, Command,
  TrendingUp, Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { parseNaturalQuery, ParsedQuery } from '@/lib/ai/insights';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'product' | 'contact' | 'invoice' | 'sale';
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

const typeIcons = {
  product: Package,
  contact: Users,
  invoice: FileText,
  sale: ShoppingCart
};

const typeColors = {
  product: 'bg-blue-500/20 text-blue-400',
  contact: 'bg-green-500/20 text-green-400',
  invoice: 'bg-purple-500/20 text-purple-400',
  sale: 'bg-amber-500/20 text-amber-400'
};

const EXAMPLE_QUERIES = [
  'Show me overdue invoices',
  'Low stock items under $50',
  'Customers who bought last week',
  'Top 10 selling products',
  'Pending invoices over $1000'
];

export function SmartSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setParsedQuery(null);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setParsedQuery(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  async function search(q: string) {
    setLoading(true);
    
    // Try to parse as natural language
    const parsed = parseNaturalQuery(q);
    setParsedQuery(parsed);

    try {
      const searchResults: SearchResult[] = [];

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku, price, quantity')
        .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
        .limit(5);

      if (products) {
        searchResults.push(...products.map((p: any) => ({
          id: p.id,
          type: 'product' as const,
          title: p.name,
          subtitle: `SKU: ${p.sku} · $${p.price} · ${p.quantity} in stock`,
          href: `/inventory?product=${p.id}`,
          badge: p.quantity <= 10 ? 'Low Stock' : undefined
        })));
      }

      // Search contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, email, type')
        .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(5);

      if (contacts) {
        searchResults.push(...contacts.map((c: any) => ({
          id: c.id,
          type: 'contact' as const,
          title: c.name,
          subtitle: c.email || c.type,
          href: `/contacts?id=${c.id}`,
          badge: c.type
        })));
      }

      // Search invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, status, contacts(name)')
        .or(`invoice_number.ilike.%${q}%`)
        .limit(5);

      if (invoices) {
        searchResults.push(...invoices.map((inv: any) => ({
          id: inv.id,
          type: 'invoice' as const,
          title: `Invoice #${inv.invoice_number}`,
          subtitle: `${(inv.contacts as any)?.name || 'Unknown'} · $${inv.total}`,
          href: `/invoices?id=${inv.id}`,
          badge: inv.status
        })));
      }

      // Apply natural language filters if parsed
      if (parsed) {
        // Filter based on parsed intent
        if (parsed.filters.some(f => f.field === 'status' && f.value === 'overdue')) {
          const { data: overdueInvoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, total, status, due_date, contacts(name)')
            .eq('status', 'sent')
            .lt('due_date', new Date().toISOString())
            .limit(10);

          if (overdueInvoices) {
            searchResults.length = 0; // Clear regular results
            searchResults.push(...overdueInvoices.map((inv: any) => ({
              id: inv.id,
              type: 'invoice' as const,
              title: `Invoice #${inv.invoice_number}`,
              subtitle: `${(inv.contacts as any)?.name || 'Unknown'} · $${inv.total}`,
              href: `/invoices?id=${inv.id}`,
              badge: 'Overdue'
            })));
          }
        }

        if (parsed.filters.some(f => f.field === 'status' && f.value === 'low_stock')) {
          const { data: lowStockItems } = await supabase
            .from('products')
            .select('id, name, sku, price, quantity, reorder_level')
            .filter('quantity', 'lte', supabase.rpc('get_reorder_level'))
            .limit(10);

          if (lowStockItems) {
            searchResults.length = 0;
            searchResults.push(...lowStockItems.map((p: any) => ({
              id: p.id,
              type: 'product' as const,
              title: p.name,
              subtitle: `Only ${p.quantity} left · Reorder at ${p.reorder_level}`,
              href: `/inventory?product=${p.id}`,
              badge: 'Low Stock'
            })));
          }
        }
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      router.push(results[selectedIndex].href);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function selectResult(result: SearchResult) {
    router.push(result.href);
    setOpen(false);
  }

  return (
    <>
      {/* Search trigger button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-64 justify-between text-neutral-400 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search anything...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-700 bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-400">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      {/* Search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 bg-neutral-900 border-neutral-800 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
            {loading ? (
              <Loader2 className="h-5 w-5 text-[#FAFAFA] animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 text-[#FAFAFA]" />
            )}
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or ask a question..."
              className="border-0 bg-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 text-lg"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Parsed query indicator */}
          {parsedQuery && (
            <div className="px-4 py-2 border-b border-neutral-800 bg-neutral-800/50">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Filter className="h-3 w-3" />
                <span>Searching</span>
                <Badge variant="outline" className="border-neutral-700 capitalize">
                  {parsedQuery.entity}
                </Badge>
                {parsedQuery.filters.map((f, i) => (
                  <Badge key={i} className="bg-[#161616]/20 text-[#FAFAFA]">
                    {f.field}: {String(f.value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-4 space-y-4">
                <p className="text-sm text-neutral-500">Try asking:</p>
                <div className="space-y-2">
                  {EXAMPLE_QUERIES.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(example)}
                      className="flex items-center gap-2 w-full p-2 text-left text-sm text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-[#FAFAFA]" />
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="p-8 text-center text-neutral-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <button
                      key={result.id}
                      onClick={() => selectResult(result)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        index === selectedIndex 
                          ? 'bg-neutral-800' 
                          : 'hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${typeColors[result.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{result.title}</p>
                        <p className="text-sm text-neutral-500">{result.subtitle}</p>
                      </div>
                      {result.badge && (
                        <Badge variant="outline" className="border-neutral-700 capitalize">
                          {result.badge}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-neutral-600" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">esc</kbd>
                close
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#FAFAFA]" />
              AI-powered search
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
