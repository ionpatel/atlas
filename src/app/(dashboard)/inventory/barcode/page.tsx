"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Scan,
  Camera,
  Keyboard,
  Package,
  AlertCircle,
  CheckCircle2,
  History,
  Plus,
  Minus,
  Printer,
  Download,
  Trash2,
  RefreshCw,
  Volume2,
  VolumeX,
  Boxes,
  ArrowUpDown,
  Eye,
  Pencil,
  X,
  ChevronRight,
  Tag,
  LayoutGrid,
  List,
  Filter,
  Search,
  Settings2,
  Layers,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/stores/inventory-store";
import { useToastStore } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/modules/product-form";
import type { Product } from "@/types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ScanHistoryItem {
  id: string;
  barcode: string;
  timestamp: Date;
  found: boolean;
  productId?: string;
  productName?: string;
  productSku?: string;
  action?: "lookup" | "stock_in" | "stock_out" | "batch";
  quantity?: number;
}

interface BarcodeLabel {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  price: number;
  quantity: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// BARCODE IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateBarcodeDataUrl(barcode: string): string {
  // Simple Code128-like barcode visualization (for demo)
  // In production, use a library like jsbarcode
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 80;
  const ctx = canvas.getContext("2d")!;
  
  // White background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 200, 80);
  
  // Generate bars from barcode string
  ctx.fillStyle = "#000";
  let x = 10;
  const barWidth = 2;
  
  for (let i = 0; i < barcode.length; i++) {
    const charCode = barcode.charCodeAt(i);
    // Simple pattern based on character code
    const pattern = charCode.toString(2).padStart(8, "0");
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === "1") {
        ctx.fillRect(x, 10, barWidth, 50);
      }
      x += barWidth;
    }
    x += 2; // Gap between characters
  }
  
  // Add barcode text
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(barcode, 100, 72);
  
  return canvas.toDataURL("image/png");
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ScanModeToggle({
  mode,
  onModeChange,
  batchCount,
}: {
  mode: "single" | "batch";
  onModeChange: (mode: "single" | "batch") => void;
  batchCount: number;
}) {
  return (
    <div className="flex items-center gap-2 p-1 bg-[#0A0A0A] rounded-lg">
      <button
        onClick={() => onModeChange("single")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
          mode === "single"
            ? "bg-[#161616] text-[#0A0A0A]"
            : "text-[#FAFAFA] hover:text-[#FAFAFA]"
        )}
      >
        <Scan className="w-4 h-4" />
        Single Scan
      </button>
      <button
        onClick={() => onModeChange("batch")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all relative",
          mode === "batch"
            ? "bg-[#161616] text-[#0A0A0A]"
            : "text-[#FAFAFA] hover:text-[#FAFAFA]"
        )}
      >
        <Layers className="w-4 h-4" />
        Batch Mode
        {batchCount > 0 && (
          <span className={cn(
            "px-1.5 py-0.5 rounded text-xs font-bold",
            mode === "batch"
              ? "bg-[#0A0A0A]/20 text-[#0A0A0A]"
              : "bg-[#161616]/20 text-[#FAFAFA]"
          )}>
            {batchCount}
          </span>
        )}
      </button>
    </div>
  );
}

function ProductLookupCard({
  product,
  onAdjustStock,
  onView,
  onEdit,
  onPrintLabel,
}: {
  product: Product;
  onAdjustStock: (delta: number) => void;
  onView: () => void;
  onEdit: () => void;
  onPrintLabel: () => void;
}) {
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < product.min_quantity;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            isOutOfStock ? "bg-red-500/10" : isLowStock ? "bg-amber-500/10" : "bg-[#161616]/10"
          )}>
            <Package className={cn(
              "w-6 h-6",
              isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-[#FAFAFA]"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-[#FAFAFA]">{product.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#FAFAFA] font-mono">{product.sku}</span>
              {product.barcode && (
                <>
                  <span className="text-[#FAFAFA]">•</span>
                  <span className="text-xs text-[#FAFAFA] font-mono">{product.barcode}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
      </div>

      {/* Stock Level */}
      <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
        <span className="text-sm text-[#FAFAFA]">Current Stock</span>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            isOutOfStock ? "text-red-400" :
            isLowStock ? "text-amber-400" : "text-emerald-400"
          )}>
            {product.stock_quantity}
          </span>
          {(isLowStock || isOutOfStock) && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium",
              isOutOfStock ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
            )}>
              {isOutOfStock ? "Out of Stock" : "Low Stock"}
            </span>
          )}
        </div>
      </div>

      {/* Quick Stock Adjustment */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onAdjustStock(-1)}
          disabled={product.stock_quantity <= 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
          Remove 1
        </button>
        <button
          onClick={() => onAdjustStock(1)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add 1
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
        <button
          onClick={onPrintLabel}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#262626] rounded-lg text-xs font-medium text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]/50 transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Label
        </button>
        <button
          onClick={onView}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#262626] rounded-lg text-xs font-medium text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]/50 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#161616] text-[#0A0A0A] rounded-lg text-xs font-semibold hover:bg-[#161616] transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Product
        </button>
      </div>
    </div>
  );
}

function ScanHistoryPanel({
  history,
  onSelect,
  onClear,
}: {
  history: ScanHistoryItem[];
  onSelect: (item: ScanHistoryItem) => void;
  onClear: () => void;
}) {
  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FAFAFA]" />
          <span className="text-sm font-medium text-[#FAFAFA]">Scan History</span>
          <span className="px-1.5 py-0.5 bg-[#0A0A0A] rounded text-[10px] text-[#FAFAFA]">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-[#FAFAFA] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#FAFAFA]">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No scan history yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6D4C7]/50">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#0A0A0A]/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center",
                    item.found ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    {item.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-mono text-[#FAFAFA]">{item.barcode}</p>
                    {item.productName && (
                      <p className="text-[10px] text-[#FAFAFA]">{item.productName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.action && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      item.action === "stock_in" && "bg-emerald-500/20 text-emerald-400",
                      item.action === "stock_out" && "bg-red-500/20 text-red-400",
                      item.action === "lookup" && "bg-[#0A0A0A] text-[#FAFAFA]",
                      item.action === "batch" && "bg-[#161616]/20 text-[#FAFAFA]"
                    )}>
                      {item.action === "stock_in" && `+${item.quantity || 1}`}
                      {item.action === "stock_out" && `-${item.quantity || 1}`}
                      {item.action === "lookup" && "Lookup"}
                      {item.action === "batch" && "Batch"}
                    </span>
                  )}
                  <span className="text-[10px] text-[#FAFAFA]">
                    {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#FAFAFA]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LabelPrintQueue({
  labels,
  onUpdateQuantity,
  onRemove,
  onPrint,
  onClear,
}: {
  labels: BarcodeLabel[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onPrint: () => void;
  onClear: () => void;
}) {
  const totalLabels = labels.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#FAFAFA]" />
          <span className="text-sm font-medium text-[#FAFAFA]">Print Queue</span>
          <span className="px-1.5 py-0.5 bg-[#161616]/20 rounded text-[10px] text-[#FAFAFA] font-medium">
            {totalLabels} labels
          </span>
        </div>
        <div className="flex items-center gap-2">
          {labels.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-[#FAFAFA] hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {labels.length === 0 ? (
        <div className="px-4 py-8 text-center text-[#FAFAFA]">
          <Printer className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No labels in queue</p>
          <p className="text-xs mt-1">Scan products to add labels</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[#E6D4C7]/50 max-h-[300px] overflow-y-auto">
            {labels.map((label) => (
              <div key={label.productId} className="px-4 py-3 flex items-center gap-3">
                <div className="w-16 h-12 bg-white rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={generateBarcodeDataUrl(label.barcode || label.sku)}
                    alt={label.barcode}
                    className="max-w-full max-h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#FAFAFA] truncate">{label.productName}</p>
                  <p className="text-[10px] text-[#FAFAFA] font-mono">{label.barcode || label.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(label.productId, Math.max(1, label.quantity - 1))}
                    className="w-6 h-6 rounded bg-[#0A0A0A] flex items-center justify-center text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-[#FAFAFA]">
                    {label.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(label.productId, label.quantity + 1)}
                    className="w-6 h-6 rounded bg-[#0A0A0A] flex items-center justify-center text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(label.productId)}
                  className="p-1 text-[#FAFAFA] hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="px-4 py-3 border-t border-[#262626]">
            <button
              onClick={onPrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#161616] transition-all"
            >
              <Printer className="w-4 h-4" />
              Print {totalLabels} Label{totalLabels !== 1 ? "s" : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CameraScannerView({
  onScan,
  isActive,
}: {
  onScan: (barcode: string) => void;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
      setCameraError(null);
    } catch (err) {
      setHasCamera(false);
      setCameraError("Camera access denied or not available");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Demo: simulate scan
  const simulateScan = () => {
    const mockBarcodes = [
      "8901234560001",
      "8901234560002",
      "AMX-500",
      "VTD-1000",
    ];
    const barcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    onScan(barcode);
  };

  if (!hasCamera) {
    return (
      <div className="aspect-video bg-[#0A0A0A] rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-sm text-red-400 font-medium">{cameraError}</p>
        <p className="text-xs text-[#FAFAFA] mt-1">Use manual entry instead</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Scan overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-24 border-2 border-[#262626] rounded-lg relative">
          <div className="absolute inset-0 bg-[#161616]/5" />
          <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-[#262626]" />
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-[#262626]" />
          <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-[#262626]" />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-[#262626]" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#161616] animate-pulse" />
        </div>
      </div>

      {/* Status badge */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <span className="px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm rounded-full text-xs text-[#FAFAFA] flex items-center gap-2">
          <span className="w-2 h-2 bg-[#161616] rounded-full animate-pulse" />
          Scanning...
        </span>
      </div>

      {/* Demo button */}
      <button
        onClick={simulateScan}
        className="absolute top-4 right-4 px-3 py-1.5 bg-[#0A0A0A]/80 backdrop-blur-sm rounded-lg text-xs text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors flex items-center gap-1.5"
      >
        <RefreshCw className="w-3 h-3" />
        Simulate Scan
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function BarcodeManagementPage() {
  const { products, updateProduct } = useInventoryStore();
  const addToast = useToastStore((s) => s.addToast);

  // State
  const [scanMode, setScanMode] = useState<"manual" | "camera">("manual");
  const [operationMode, setOperationMode] = useState<"single" | "batch">("single");
  const [manualCode, setManualCode] = useState("");
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [labelQueue, setLabelQueue] = useState<BarcodeLabel[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [batchItems, setBatchItems] = useState<Map<string, { product: Product; quantity: number }>>(new Map());

  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-focus input
  useEffect(() => {
    if (scanMode === "manual" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

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

  // Process scan
  const processScan = useCallback((barcode: string) => {
    const product = products.find(
      (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
    );

    const historyItem: ScanHistoryItem = {
      id: crypto.randomUUID(),
      barcode,
      timestamp: new Date(),
      found: !!product,
      productId: product?.id,
      productName: product?.name,
      productSku: product?.sku,
      action: operationMode === "batch" ? "batch" : "lookup",
    };

    setScanHistory((prev) => [historyItem, ...prev.slice(0, 49)]);

    if (product) {
      playSound("success");
      setFoundProduct(product);

      if (operationMode === "batch") {
        setBatchItems((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(product.id);
          if (existing) {
            newMap.set(product.id, {
              product,
              quantity: existing.quantity + 1,
            });
          } else {
            newMap.set(product.id, { product, quantity: 1 });
          }
          return newMap;
        });
        addToast(`Added ${product.name} to batch`, "success");
      }
    } else {
      playSound("error");
      setFoundProduct(null);
      addToast(`Product not found: ${barcode}`, "error");
    }
  }, [products, operationMode, playSound, addToast]);

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScan(manualCode.trim());
      setManualCode("");
    }
  };

  // Stock adjustment
  const handleStockAdjust = (delta: number) => {
    if (!foundProduct) return;

    const newStock = Math.max(0, foundProduct.stock_quantity + delta);
    updateProduct(foundProduct.id, { stock_quantity: newStock });

    const historyItem: ScanHistoryItem = {
      id: crypto.randomUUID(),
      barcode: foundProduct.barcode || foundProduct.sku,
      timestamp: new Date(),
      found: true,
      productId: foundProduct.id,
      productName: foundProduct.name,
      productSku: foundProduct.sku,
      action: delta > 0 ? "stock_in" : "stock_out",
      quantity: Math.abs(delta),
    };

    setScanHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
    setFoundProduct({ ...foundProduct, stock_quantity: newStock });
    addToast(`Stock ${delta > 0 ? "added" : "removed"}: ${foundProduct.name} (${newStock})`);
  };

  // Add to label queue
  const handleAddToLabelQueue = () => {
    if (!foundProduct) return;

    setLabelQueue((prev) => {
      const existing = prev.find((l) => l.productId === foundProduct.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === foundProduct.id
            ? { ...l, quantity: l.quantity + 1 }
            : l
        );
      }
      return [
        ...prev,
        {
          productId: foundProduct.id,
          productName: foundProduct.name,
          sku: foundProduct.sku,
          barcode: foundProduct.barcode || foundProduct.sku,
          price: foundProduct.sell_price,
          quantity: 1,
        },
      ];
    });
    addToast(`Added ${foundProduct.name} to print queue`);
  };

  // Print labels
  const handlePrintLabels = () => {
    const totalLabels = labelQueue.reduce((sum, l) => sum + l.quantity, 0);
    addToast(`Printing ${totalLabels} label(s)...`, "success");
    // In production, this would trigger actual printing
    setLabelQueue([]);
  };

  // Process batch
  const handleProcessBatch = (action: "stock_in" | "stock_out") => {
    const delta = action === "stock_in" ? 1 : -1;
    
    batchItems.forEach(({ product, quantity }) => {
      const newStock = Math.max(0, product.stock_quantity + delta * quantity);
      updateProduct(product.id, { stock_quantity: newStock });
    });

    addToast(
      `Batch processed: ${batchItems.size} products ${action === "stock_in" ? "stocked in" : "stocked out"}`,
      "success"
    );
    setBatchItems(new Map());
  };

  // History select
  const handleHistorySelect = (item: ScanHistoryItem) => {
    processScan(item.barcode);
  };

  // Edit product
  const handleEditProduct = (data: Omit<Product, "id" | "org_id" | "created_at">) => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    if (foundProduct?.id === editingProduct.id) {
      setFoundProduct({ ...editingProduct, ...data });
    }
    addToast("Product updated successfully");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Barcode Scanner
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            Scan, lookup, and manage product barcodes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2.5 rounded-lg transition-all border",
              soundEnabled
                ? "border-[#262626]/50 text-[#FAFAFA] bg-[#161616]/10"
                : "border-[#262626] text-[#FAFAFA] hover:text-[#FAFAFA]"
            )}
            title={soundEnabled ? "Sound on" : "Sound off"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <ScanModeToggle
            mode={operationMode}
            onModeChange={setOperationMode}
            batchCount={batchItems.size}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ LEFT COLUMN: Scanner ═══ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scan Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-[#0A0A0A] rounded-lg w-fit">
            <button
              onClick={() => setScanMode("manual")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                scanMode === "manual"
                  ? "bg-[#161616] text-[#0A0A0A]"
                  : "text-[#FAFAFA] hover:text-[#FAFAFA]"
              )}
            >
              <Keyboard className="w-4 h-4" />
              Manual Entry
            </button>
            <button
              onClick={() => setScanMode("camera")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                scanMode === "camera"
                  ? "bg-[#161616] text-[#0A0A0A]"
                  : "text-[#FAFAFA] hover:text-[#FAFAFA]"
              )}
            >
              <Camera className="w-4 h-4" />
              Camera Scan
            </button>
          </div>

          {/* Scanner Input */}
          {scanMode === "manual" ? (
            <form onSubmit={handleManualSubmit}>
              <div className="relative">
                <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAFA]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter barcode or SKU..."
                  className="w-full pl-12 pr-24 py-4 bg-[#0A0A0A] border border-[#262626] rounded-xl text-lg text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors font-mono tracking-wider"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#161616] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#161616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Scan
                </button>
              </div>
            </form>
          ) : (
            <CameraScannerView onScan={processScan} isActive={true} />
          )}

          {/* Product Result */}
          {foundProduct && (
            <ProductLookupCard
              product={foundProduct}
              onAdjustStock={handleStockAdjust}
              onView={() => setEditingProduct(foundProduct)}
              onEdit={() => setEditingProduct(foundProduct)}
              onPrintLabel={handleAddToLabelQueue}
            />
          )}

          {/* Batch Mode Panel */}
          {operationMode === "batch" && batchItems.size > 0 && (
            <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FAFAFA]" />
                  <span className="text-sm font-medium text-[#FAFAFA]">Batch Items</span>
                  <span className="px-1.5 py-0.5 bg-[#161616]/20 rounded text-[10px] text-[#FAFAFA] font-medium">
                    {batchItems.size} products
                  </span>
                </div>
                <button
                  onClick={() => setBatchItems(new Map())}
                  className="text-xs text-[#FAFAFA] hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="divide-y divide-[#E6D4C7]/50 max-h-[200px] overflow-y-auto">
                {Array.from(batchItems.values()).map(({ product, quantity }) => (
                  <div key={product.id} className="px-4 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#FAFAFA]">{product.name}</p>
                      <p className="text-[10px] text-[#FAFAFA] font-mono">{product.sku}</p>
                    </div>
                    <span className="px-2 py-1 bg-[#161616]/20 rounded text-sm text-[#FAFAFA] font-medium">
                      ×{quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-[#262626] grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleProcessBatch("stock_in")}
                  className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg font-medium hover:bg-emerald-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Stock In All
                </button>
                <button
                  onClick={() => handleProcessBatch("stock_out")}
                  className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-all"
                >
                  <Minus className="w-4 h-4" />
                  Stock Out All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN: History & Labels ═══ */}
        <div className="space-y-6">
          <ScanHistoryPanel
            history={scanHistory}
            onSelect={handleHistorySelect}
            onClear={() => setScanHistory([])}
          />

          <LabelPrintQueue
            labels={labelQueue}
            onUpdateQuantity={(productId, qty) => {
              setLabelQueue((prev) =>
                prev.map((l) =>
                  l.productId === productId ? { ...l, quantity: qty } : l
                )
              );
            }}
            onRemove={(productId) => {
              setLabelQueue((prev) => prev.filter((l) => l.productId !== productId));
            }}
            onPrint={handlePrintLabels}
            onClear={() => setLabelQueue([])}
          />
        </div>
      </div>

      {/* Edit Product Modal */}
      <Modal
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
        />
      </Modal>
    </div>
  );
}
