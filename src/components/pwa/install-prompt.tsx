'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return; // Don't show for 7 days after dismiss
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show manual instructions after delay
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  }

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9C4A29]/20 to-transparent px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#9C4A29]/20">
              <Download className="h-4 w-4 text-[#9C4A29]" />
            </div>
            <span className="text-sm font-medium text-white">Install Atlas</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-400">
                Install Atlas on your iPhone:
              </p>
              <ol className="text-sm text-neutral-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-xs">1</span>
                  Tap the Share button
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-xs">2</span>
                  Scroll and tap "Add to Home Screen"
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-xs">3</span>
                  Tap "Add" to install
                </li>
              </ol>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-400 mb-4">
                Get the full app experience with offline access and notifications.
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center gap-1 p-2 bg-neutral-800/50 rounded-lg">
                  <Wifi className="h-4 w-4 text-[#9C4A29]" />
                  <span className="text-[10px] text-neutral-400">Offline</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-neutral-800/50 rounded-lg">
                  <Zap className="h-4 w-4 text-[#9C4A29]" />
                  <span className="text-[10px] text-neutral-400">Fast</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-neutral-800/50 rounded-lg">
                  <Bell className="h-4 w-4 text-[#9C4A29]" />
                  <span className="text-[10px] text-neutral-400">Alerts</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-neutral-700"
                  onClick={handleDismiss}
                >
                  Not now
                </Button>
                <Button
                  className="flex-1 bg-[#9C4A29] hover:bg-[#9C4A29]/90 text-black"
                  onClick={handleInstall}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
