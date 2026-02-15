'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, 
  Lightbulb, Target, ChevronRight, Loader2, RefreshCw,
  X, CheckCircle, Info, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { 
  Insight, 
  analyzeSales, 
  analyzeInventory, 
  analyzeInvoices 
} from '@/lib/ai/insights';
import Link from 'next/link';

const severityConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400'
  },
  critical: {
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400'
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-400',
    badge: 'bg-green-500/20 text-green-400'
  }
};

const typeIcons = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  alert: AlertCircle,
  opportunity: Lightbulb,
  prediction: Target
};

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    try {
      // Fetch data for analysis
      const [salesRes, inventoryRes, invoicesRes] = await Promise.all([
        // Get sales data for current and previous week
        supabase
          .from('sales')
          .select('created_at, total')
          .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true }),
        
        // Get inventory items
        supabase
          .from('products')
          .select('id, name, quantity, reorder_level, price'),
        
        // Get invoices
        supabase
          .from('invoices')
          .select('id, total, status, due_date, contacts(name)')
          .neq('status', 'paid')
      ]);

      const allInsights: Insight[] = [];

      // Analyze sales
      if (salesRes.data) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const currentWeekSales = salesRes.data
          .filter((s: any) => new Date(s.created_at) >= oneWeekAgo)
          .map((s: any) => ({ date: s.created_at, amount: s.total || 0, count: 1 }));

        const previousWeekSales = salesRes.data
          .filter((s: any) => {
            const date = new Date(s.created_at);
            return date >= twoWeeksAgo && date < oneWeekAgo;
          })
          .map((s: any) => ({ date: s.created_at, amount: s.total || 0, count: 1 }));

        if (currentWeekSales.length > 0 || previousWeekSales.length > 0) {
          allInsights.push(...analyzeSales(currentWeekSales, previousWeekSales));
        }
      }

      // Analyze inventory
      if (inventoryRes.data) {
        const items = inventoryRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity || 0,
          reorder_level: p.reorder_level || 10,
          price: p.price || 0
        }));
        allInsights.push(...analyzeInventory(items));
      }

      // Analyze invoices
      if (invoicesRes.data) {
        const invoices = invoicesRes.data.map((inv: any) => ({
          id: inv.id,
          amount: inv.total || 0,
          status: inv.status,
          due_date: inv.due_date,
          customer_name: (inv.contacts as any)?.name || 'Unknown'
        }));
        allInsights.push(...analyzeInvoices(invoices));
      }

      // Sort by severity (critical first, then warning, then info)
      const severityOrder = { critical: 0, warning: 1, success: 2, info: 3 };
      allInsights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setInsights(allInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  }

  function dismissInsight(id: string) {
    setDismissed(prev => new Set(prev).add(id));
  }

  const visibleInsights = insights.filter(i => !dismissed.has(i.id));

  if (loading) {
    return (
      <Card className="bg-white border-[#E5E7EB]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#E5E7EB]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#111827]" />
          <CardTitle className="text-white">AI Insights</CardTitle>
          {visibleInsights.length > 0 && (
            <Badge className="bg-white/20 text-[#111827]">
              {visibleInsights.length}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {visibleInsights.length === 0 ? (
          <div className="text-center py-8 text-[#9CA3AF]">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights right now</p>
            <p className="text-sm">Everything is running smoothly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleInsights.map((insight) => {
              const config = severityConfig[insight.severity];
              const TypeIcon = typeIcons[insight.type];
              const SeverityIcon = config.icon;

              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${config.bg} ${config.border} relative group`}
                >
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#F1F3F5] rounded"
                  >
                    <X className="h-3 w-3 text-[#9CA3AF]" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <SeverityIcon className={`h-4 w-4 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="border-[#D1D5DB] text-xs capitalize">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-2">
                        {insight.description}
                      </p>

                      {insight.metric && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold text-white">
                            ${insight.metric.value.toLocaleString()}
                          </span>
                          <Badge className={config.badge}>
                            {insight.metric.changeType === 'increase' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {insight.metric.change.toFixed(1)}%
                          </Badge>
                          <span className="text-xs text-[#9CA3AF]">
                            {insight.metric.period}
                          </span>
                        </div>
                      )}

                      {insight.action && (
                        <Link href={insight.action.href}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`${config.text} hover:${config.bg} p-0 h-auto`}
                          >
                            {insight.action.label}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
