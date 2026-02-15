'use client';

import { InventoryForecasting } from '@/components/inventory/forecasting';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Forecasting</h1>
            <p className="text-[#6B7280] mt-1">
              AI-powered predictions to optimize your stock levels
            </p>
          </div>
        </div>
        <Button variant="outline" className="border-[#D1D5DB] gap-2">
          <Settings className="h-4 w-4" />
          Configure
        </Button>
      </div>

      {/* Forecasting Component */}
      <InventoryForecasting />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-[#E5E7EB] rounded-xl">
          <h3 className="text-white font-medium mb-2">How it works</h3>
          <p className="text-sm text-[#6B7280]">
            We analyze your last 30 days of sales data to calculate average daily 
            sales velocity for each product, then predict when you'll run out of stock.
          </p>
        </div>
        <div className="p-6 bg-white border border-[#E5E7EB] rounded-xl">
          <h3 className="text-white font-medium mb-2">Lead Time</h3>
          <p className="text-sm text-[#6B7280]">
            Default lead time is 7 days. Reorder dates account for this buffer so 
            you have time to receive new stock before running out.
          </p>
        </div>
        <div className="p-6 bg-white border border-[#E5E7EB] rounded-xl">
          <h3 className="text-white font-medium mb-2">Confidence Levels</h3>
          <p className="text-sm text-[#6B7280]">
            <span className="text-green-400">High:</span> 20+ data points · 
            <span className="text-amber-400 ml-2">Medium:</span> 10-20 · 
            <span className="text-[#6B7280] ml-2">Low:</span> &lt;10
          </p>
        </div>
      </div>
    </div>
  );
}
