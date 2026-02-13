'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-neutral-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          You're offline
        </h1>
        <p className="text-neutral-400 mb-8">
          Check your internet connection and try again. Some features may be available offline.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-[#CDB49E] hover:bg-[#CDB49E]/90 text-black"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full border-neutral-700"
          >
            Go Back
          </Button>
        </div>

        {/* Offline features hint */}
        <div className="mt-8 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-left">
          <p className="text-sm font-medium text-white mb-2">Available offline:</p>
          <ul className="text-sm text-neutral-400 space-y-1">
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
