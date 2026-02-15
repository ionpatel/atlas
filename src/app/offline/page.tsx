'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-[#9CA3AF]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          You're offline
        </h1>
        <p className="text-[#6B7280] mb-8">
          Check your internet connection and try again. Some features may be available offline.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-[#DC2626] hover:bg-[#DC2626]/90 text-black"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full border-[#D1D5DB]"
          >
            Go Back
          </Button>
        </div>

        {/* Offline features hint */}
        <div className="mt-8 p-4 bg-white border border-[#E5E7EB] rounded-xl text-left">
          <p className="text-sm font-medium text-white mb-2">Available offline:</p>
          <ul className="text-sm text-[#6B7280] space-y-1">
            <li>• View cached data</li>
            <li>• Draft invoices (sync when online)</li>
            <li>• Scan barcodes</li>
            <li>• View recent products</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
