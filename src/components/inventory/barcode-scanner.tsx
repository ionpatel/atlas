"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Camera,
  Keyboard,
  Scan,
  Package,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  History,
  Pencil,
  Eye,
  PlusCircle,
  MinusCircle,
  Volume2,
  VolumeX,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/stores/inventory-store";
import type { Product } from "@/types";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  onViewProduct?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onAdjustStock?: (product: Product, delta: number) => void;
}

interface ScanHistoryItem {
  barcode: string;
  timestamp: Date;
  found: boolean;
  productName?: string;
  productId?: string;
}

export function BarcodeScanner({
  onScan,
  onClose,
  onViewProduct,
  onEditProduct,
  onAdjustStock,
}: BarcodeScannerProps) {
  const { products } = useInventoryStore();
  const [mode, setMode] = useState<"camera" | "manual">("manual");
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-focus manual input
  useEffect(() => {
    if (mode === "manual" && inputRef.current && !showHistory) {
      inputRef.current.focus();
    }
  }, [mode, showHistory]);

  // Camera mode setup
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Sound feedback
  const playSound = useCallback((type: "success" | "error") => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === "success") {
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const startCamera = async () => {
    setError(null);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please use manual entry.");
      setMode("manual");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const processScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode || p.sku === barcode);
    
    const historyItem: ScanHistoryItem = {
      barcode,
      timestamp: new Date(),
      found: !!product,
      productName: product?.name,
      productId: product?.id,
    };
    
    setScanHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
    setLastScanned(barcode);
    
    if (product) {
      setFoundProduct(product);
      setStockAdjustment(0);
      playSound("success");
      onScan(barcode);
    } else {
      setFoundProduct(null);
      playSound("error");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScan(manualCode.trim());
      setManualCode("");
    }
  };

  // Simulate camera barcode detection
  const simulateScan = () => {
    const mockBarcodes = products.length > 0
      ? products.slice(0, 4).map((p) => p.barcode || p.sku)
      : ["8901234560001", "8901234560002", "8901234560003"];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    processScan(randomBarcode);
  };

  const handleHistorySelect = (item: ScanHistoryItem) => {
    processScan(item.barcode);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  const handleStockAdjust = (delta: number) => {
    if (foundProduct && onAdjustStock) {
      onAdjustStock(foundProduct, delta);
      setFoundProduct((prev) => prev ? { ...prev, stock_quantity: prev.stock_quantity + delta } : null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3a3028]">
              <Scan className="w-5 h-5 text-[#CDB49E]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f5f0eb]">
                Barcode Scanner
              </h2>
              <p className="text-xs text-[#888888]">
                Scan or enter barcode manually
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-2 rounded-lg transition-all",
                soundEnabled
                  ? "text-[#CDB49E] bg-[#3a3028]"
                  : "text-[#555555] hover:text-[#888888] hover:bg-[#222222]"
              )}
              title={soundEnabled ? "Sound on" : "Sound off"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-2 rounded-lg transition-all relative",
                showHistory
                  ? "text-[#CDB49E] bg-[#3a3028]"
                  : "text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222]"
              )}
              title="Scan history"
            >
              <History className="w-4 h-4" />
              {scanHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CDB49E] text-[9px] font-bold text-[#111111] flex items-center justify-center">
                  {scanHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="border-b border-[#2a2a2a] max-h-48 overflow-y-auto">
            <div className="px-4 py-2 bg-[#111111] flex items-center justify-between sticky top-0">
              <span className="text-xs font-medium text-[#888888]">Recent Scans</span>
              {scanHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-[#555555] hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
            {scanHistory.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#555555]">
                No scan history yet
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2a]/50">
                {scanHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleHistorySelect(item)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#222222] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center",
                          item.found ? "bg-emerald-500/10" : "bg-red-500/10"
                        )}
                      >
                        {item.found ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-mono text-[#f5f0eb]">{item.barcode}</p>
                        {item.productName && (
                          <p className="text-[10px] text-[#888888]">{item.productName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#555555]">
                        {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#555555]" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center gap-2 p-1 bg-[#111111] rounded-lg">
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                mode === "manual"
                  ? "bg-[#CDB49E] text-[#111111]"
                  : "text-[#888888] hover:text-[#f5f0eb]"
              )}
            >
              <Keyboard className="w-4 h-4" />
              Manual Entry
            </button>
            <button
              onClick={() => setMode("camera")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                mode === "camera"
                  ? "bg-[#CDB49E] text-[#111111]"
                  : "text-[#888888] hover:text-[#f5f0eb]"
              )}
            >
              <Camera className="w-4 h-4" />
              Camera Scan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {mode === "manual" ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#888888] uppercase tracking-wider mb-2">
                  Barcode / SKU
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter or scan barcode..."
                  className="w-full px-4 py-3 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder-[#555555] focus:outline-none focus:border-[#CDB49E]/40 font-mono text-lg tracking-wider"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="w-4 h-4" />
                Find Product
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Camera Preview */}
              <div className="relative aspect-[4/3] bg-[#111111] rounded-xl overflow-hidden">
                {error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-24 border-2 border-[#CDB49E] rounded-lg relative">
                        <div className="absolute inset-0 bg-[#CDB49E]/5" />
                        {/* Corner markers */}
                        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-[#CDB49E]" />
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-[#CDB49E]" />
                        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-[#CDB49E]" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-[#CDB49E]" />
                        {/* Scan line animation */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#CDB49E] animate-pulse" />
                      </div>
                    </div>
                    {scanning && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <span className="px-3 py-1.5 bg-[#111111]/80 rounded-full text-xs text-[#CDB49E] flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#CDB49E] rounded-full animate-pulse" />
                          Scanning...
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Demo scan button */}
              <button
                onClick={simulateScan}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#2a2a2a] rounded-lg text-sm font-medium text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Simulate Scan (Demo)
              </button>
            </div>
          )}

          {/* Found Product Card */}
          {foundProduct && (
            <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Product Found</span>
                </div>
                <span className="text-[10px] text-[#555555] font-mono">{lastScanned}</span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[#f5f0eb] mb-1">{foundProduct.name}</h4>
                <p className="text-xs text-[#888888]">
                  SKU: {foundProduct.sku} · {foundProduct.category || "Uncategorized"}
                </p>
              </div>

              {/* Stock Level */}
              <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg mb-4">
                <span className="text-xs text-[#888888]">Current Stock</span>
                <span className={cn(
                  "text-lg font-bold tabular-nums",
                  foundProduct.stock_quantity === 0
                    ? "text-red-400"
                    : foundProduct.stock_quantity < foundProduct.min_quantity
                    ? "text-amber-400"
                    : "text-emerald-400"
                )}>
                  {foundProduct.stock_quantity}
                </span>
              </div>

              {/* Quick Stock Adjustment */}
              {onAdjustStock && (
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => handleStockAdjust(-1)}
                    disabled={foundProduct.stock_quantity <= 0}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    Remove 1
                  </button>
                  <button
                    onClick={() => handleStockAdjust(1)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add 1
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {onViewProduct && (
                  <button
                    onClick={() => onViewProduct(foundProduct)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-[#2a2a2a] rounded-lg text-xs font-medium text-[#888888] hover:text-[#f5f0eb] hover:bg-[#222222] transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                )}
                {onEditProduct && (
                  <button
                    onClick={() => onEditProduct(foundProduct)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#CDB49E] text-[#111111] rounded-lg text-xs font-semibold hover:bg-[#d4c0ad] transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Product
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Not Found Message */}
          {lastScanned && !foundProduct && (
            <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-red-400 font-medium">Product Not Found</p>
                  <p className="text-xs text-[#888888] font-mono mt-0.5">{lastScanned}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-6 py-4 bg-[#111111] border-t border-[#2a2a2a] flex-shrink-0">
          <p className="text-xs text-[#555555] text-center">
            💡 Tip: Connect a USB barcode scanner for instant input in manual mode
          </p>
        </div>
      </div>
    </div>
  );
}
