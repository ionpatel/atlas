'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Package, AlertTriangle, 
  Loader2, RefreshCw, ShoppingCart, Clock, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase/client';
import { ForecastResult, forecastInventory } from '@/lib/ai/insights';

const confidenceColors = {
  high: 'bg-green-500/20 text-green-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-neutral-500/20 text-neutral-400'
};

export function InventoryForecasting() {
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadTime, setLeadTime] = useState(7);

  useEffect(() => {
    loadForecasts();
  }, [leadTime]);

  async function loadForecasts() {
    setLoading(true);
    try {
      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, quantity, reorder_level, price')
        .gt('quantity', 0);

      if (!products) {
        setForecasts([]);
        return;
      }

      // Get sales history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: salesItems } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          product_id,
          sales!inner(created_at)
        `)
        .gte('sales.created_at', thirtyDaysAgo.toISOString());

      const salesHistory = salesItems?.map((item: any) => ({
        productId: item.product_id,
        date: (item.sales as any).created_at,
        quantity: item.quantity
      })) || [];

      const items = products.map((p: any) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity || 0,
        reorder_level: p.reorder_level || 10,
        price: p.price || 0
      }));

      const results = forecastInventory(items, salesHistory, leadTime);
      setForecasts(results);
    } catch (error) {
      console.error('Failed to load forecasts:', error);
    } finally {
      setLoading(false);
    }
  }

  function getUrgencyColor(days: number): string {
    if (days <= 7) return 'text-red-400';
    if (days <= 14) return 'text-amber-400';
    if (days <= 30) return 'text-blue-400';
    return 'text-green-400';
  }

  function getUrgencyBadge(days: number) {
    if (days <= 7) return { label: 'Critical', class: 'bg-red-500/20 text-red-400' };
    if (days <= 14) return { label: 'Soon', class: 'bg-amber-500/20 text-amber-400' };
    if (days <= 30) return { label: 'Upcoming', class: 'bg-blue-500/20 text-blue-400' };
    return { label: 'OK', class: 'bg-green-500/20 text-green-400' };
  }

  if (loading) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#9C4A29]" />
        </CardContent>
      </Card>
    );
  }

  const criticalCount = forecasts.filter(f => f.daysUntilStockout <= 7).length;
  const soonCount = forecasts.filter(f => f.daysUntilStockout > 7 && f.daysUntilStockout <= 14).length;

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#9C4A29]" />
            <div>
              <CardTitle className="text-white">Inventory Forecasting</CardTitle>
              <CardDescription className="text-neutral-400">
                AI-powered stock predictions based on sales velocity
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {criticalCount} critical
              </Badge>
            )}
            {soonCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400">
                <Clock className="h-3 w-3 mr-1" />
                {soonCount} soon
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => loadForecasts()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {forecasts.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No forecasts available</p>
            <p className="text-sm">Add sales data to enable predictions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Reorder Soon
                </div>
                <p className="text-2xl font-bold text-white">
                  {forecasts.filter(f => f.daysUntilStockout <= 14).length}
                </p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                  <Package className="h-4 w-4" />
                  Total Items
                </div>
                <p className="text-2xl font-bold text-white">
                  {forecasts.length}
                </p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  Avg Daily Sales
                </div>
                <p className="text-2xl font-bold text-white">
                  {(forecasts.reduce((sum, f) => sum + f.avgDailySales, 0) / forecasts.length).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Forecast Table */}
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800">
                    <TableHead className="text-neutral-400">Product</TableHead>
                    <TableHead className="text-neutral-400">Stock</TableHead>
                    <TableHead className="text-neutral-400">Daily Sales</TableHead>
                    <TableHead className="text-neutral-400">Days Left</TableHead>
                    <TableHead className="text-neutral-400">Reorder By</TableHead>
                    <TableHead className="text-neutral-400">Suggested Qty</TableHead>
                    <TableHead className="text-neutral-400">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecasts.slice(0, 10).map((forecast) => {
                    const urgency = getUrgencyBadge(forecast.daysUntilStockout);
                    const stockPercent = Math.min(100, (forecast.currentStock / (forecast.avgDailySales * 30)) * 100);

                    return (
                      <TableRow key={forecast.productId} className="border-neutral-800">
                        <TableCell className="text-white font-medium">
                          {forecast.productName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{forecast.currentStock}</span>
                            <Progress 
                              value={stockPercent} 
                              className="w-16 h-2 bg-neutral-800"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-400">
                          {forecast.avgDailySales.toFixed(1)}/day
                        </TableCell>
                        <TableCell>
                          <Badge className={urgency.class}>
                            {forecast.daysUntilStockout} days
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-400">
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {forecast.suggestedReorderDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Order by this date to avoid stockout (accounting for {leadTime}-day lead time)
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-[#9C4A29] font-medium">
                                {forecast.suggestedReorderQty}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Enough for 30 days + {leadTime}-day buffer
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Badge className={confidenceColors[forecast.confidence]}>
                            {forecast.confidence}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>

            {forecasts.length > 10 && (
              <div className="text-center pt-2">
                <Button variant="ghost" className="text-[#9C4A29]">
                  View all {forecasts.length} items
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
