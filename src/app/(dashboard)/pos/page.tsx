"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePOSStore } from "@/stores/pos-store";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Barcode,
  User,
  Receipt,
  X,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  Percent,
  Mail,
  Printer,
  ChevronRight,
  Grid3X3,
  List,
  Calculator,
  Wallet,
  ArrowLeftRight,
  AlertCircle,
  Volume2,
  VolumeX,
  LayoutGrid,
  Tag,
  XCircle,
} from "lucide-react";
import type { Product } from "@/types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryTab {
  id: string;
  name: string;
  icon?: React.ReactNode;
  count: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ProductCard({ 
  product, 
  onAdd 
}: { 
  product: Product; 
  onAdd: () => void;
}) {
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < product.min_quantity;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <button
      onClick={onAdd}
      disabled={isOutOfStock}
      className={cn(
        "relative bg-[#0A0A0A] border border-[#262626] rounded-xl p-4 text-left transition-all duration-200 group",
        "hover:border-[#262626]/50 hover:shadow-lg hover:shadow-[#273B3A]/5",
        "focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/50",
        isOutOfStock && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-medium rounded-full">
          Out of Stock
        </div>
      )}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-medium rounded-full">
          Low Stock
        </div>
      )}

      {/* Product Image/Icon */}
      <div className="aspect-square bg-[#0A0A0A] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-8 h-8 text-[#FAFAFA]/40" />
        )}
        
        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-[#161616]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#0A0A0A]" />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <h3 className="font-medium text-[#FAFAFA] text-sm truncate group-hover:text-[#FAFAFA] transition-colors">
        {product.name}
      </h3>
      <p className="text-[10px] text-[#FAFAFA] mt-0.5 font-mono">{product.sku}</p>
      
      {/* Price & Stock */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[#FAFAFA] font-bold text-lg">
          ${product.sell_price.toFixed(2)}
        </span>
        <span className="text-xs text-[#FAFAFA]">
          {product.stock_quantity} in stock
        </span>
      </div>
    </button>
  );
}

function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total: number;
    discount: number;
  };
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-[#0A0A0A] rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-[#FAFAFA] font-medium text-sm truncate">{item.name}</h4>
          <p className="text-[10px] text-[#FAFAFA] font-mono">{item.sku}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-[#FAFAFA] hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-7 h-7 rounded bg-[#0A0A0A] flex items-center justify-center text-[#FAFAFA] hover:bg-[#161616]/20 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center text-[#FAFAFA] font-medium text-sm">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-7 h-7 rounded bg-[#0A0A0A] flex items-center justify-center text-[#FAFAFA] hover:bg-[#161616]/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="text-right">
          <span className="text-[#FAFAFA] font-semibold">
            ${item.total.toFixed(2)}
          </span>
          <p className="text-[10px] text-[#FAFAFA]">
            ${item.unit_price.toFixed(2)} each
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({
  open,
  onClose,
  totals,
  onPayment,
}: {
  open: boolean;
  onClose: () => void;
  totals: { subtotal: number; tax: number; total: number };
  onPayment: (method: "cash" | "card" | "split", amounts?: { cash: number; card: number }) => void;
}) {
  const [paymentType, setPaymentType] = useState<"cash" | "card" | "split">("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");

  const quickAmounts = [20, 50, 100, Math.ceil(totals.total)];
  const cashReceived = parseFloat(cashAmount) || 0;
  const change = cashReceived - totals.total;

  const handlePayment = () => {
    if (paymentType === "split") {
      onPayment("split", {
        cash: parseFloat(splitCash) || 0,
        card: parseFloat(splitCard) || 0,
      });
    } else {
      onPayment(paymentType, undefined);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#FAFAFA] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#FAFAFA]" />
            Payment
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Due */}
        <div className="px-6 py-6 bg-[#0A0A0A] text-center">
          <p className="text-sm text-[#FAFAFA]">Amount Due</p>
          <p className="text-4xl font-bold text-[#FAFAFA] mt-1">
            ${totals.total.toFixed(2)}
          </p>
        </div>

        {/* Payment Type Tabs */}
        <div className="px-6 py-4">
          <div className="flex gap-2 p-1 bg-[#0A0A0A] rounded-lg">
            {[
              { id: "cash", label: "Cash", icon: Banknote },
              { id: "card", label: "Card", icon: CreditCard },
              { id: "split", label: "Split", icon: ArrowLeftRight },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPaymentType(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
                  paymentType === tab.id
                    ? "bg-[#161616] text-[#0A0A0A]"
                    : "text-[#FAFAFA] hover:text-[#FAFAFA]"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="px-6 pb-6 space-y-4">
          {paymentType === "cash" && (
            <>
              <div>
                <label className="block text-xs text-[#FAFAFA] mb-2">Cash Received</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-2xl text-center text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashAmount(amount.toString())}
                    className="flex-1 py-2 border border-[#262626] rounded-lg text-sm text-[#FAFAFA] hover:bg-[#161616]/10 hover:border-[#262626]/50 transition-all"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {change >= 0 && cashReceived > 0 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-sm text-[#FAFAFA]">Change Due</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${change.toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}

          {paymentType === "card" && (
            <div className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-[#FAFAFA] mx-auto mb-4" />
              <p className="text-[#FAFAFA] font-medium">Ready for Card Payment</p>
              <p className="text-sm text-[#FAFAFA] mt-1">Insert, tap, or swipe card</p>
            </div>
          )}

          {paymentType === "split" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#FAFAFA] mb-2">Cash Amount</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-lg text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#FAFAFA] mb-2">Card Amount</label>
                <input
                  type="number"
                  value={splitCard}
                  onChange={(e) => setSplitCard(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-lg text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors"
                />
              </div>
              <div className="p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-[#FAFAFA]">Total Split</span>
                  <span className={cn(
                    "font-medium",
                    (parseFloat(splitCash || "0") + parseFloat(splitCard || "0")) >= totals.total
                      ? "text-emerald-400"
                      : "text-amber-400"
                  )}>
                    ${((parseFloat(splitCash || "0") + parseFloat(splitCard || "0"))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#262626] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#262626] rounded-lg text-[#FAFAFA] font-medium hover:bg-[#0A0A0A]/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={
              (paymentType === "cash" && cashReceived < totals.total) ||
              (paymentType === "split" && (parseFloat(splitCash || "0") + parseFloat(splitCard || "0")) < totals.total)
            }
            className="flex-1 py-3 bg-[#161616] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#161616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: any;
}) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
        {/* Success Header */}
        <div className="px-6 py-6 bg-emerald-500/10 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-[#FAFAFA]">Payment Complete!</h2>
          <p className="text-sm text-[#FAFAFA] mt-1">Order #{order.order_number}</p>
        </div>

        {/* Order Summary */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#FAFAFA]">Subtotal</span>
            <span className="text-[#FAFAFA]">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#FAFAFA]">Tax (13%)</span>
            <span className="text-[#FAFAFA]">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#262626]">
            <span className="text-[#FAFAFA]">Total</span>
            <span className="text-[#FAFAFA]">${order.total.toFixed(2)}</span>
          </div>
          
          {order.payment_method === "cash" && order.change_due > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-[#262626]">
              <span className="text-[#FAFAFA]">Change</span>
              <span className="text-emerald-400 font-semibold">
                ${order.change_due.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#262626] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-2.5 border border-[#262626] rounded-lg text-sm text-[#FAFAFA] hover:bg-[#0A0A0A]/50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-[#262626] rounded-lg text-sm text-[#FAFAFA] hover:bg-[#0A0A0A]/50 transition-colors">
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#161616] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#161616] transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionStartModal({
  open,
  onStart,
}: {
  open: boolean;
  onStart: (data: { cashierName: string; registerName: string; openingBalance: number }) => void;
}) {
  const [form, setForm] = useState({
    cashierName: "John Doe",
    registerName: "Register 1",
    openingBalance: "500",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-md mx-4 bg-[#0A0A0A] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-6 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CDB49E] to-[#B89B78] flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#FAFAFA]">Start POS Session</h2>
              <p className="text-sm text-[#FAFAFA]">Open the register to begin</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm text-[#FAFAFA] mb-2">Cashier Name</label>
            <input
              type="text"
              value={form.cashierName}
              onChange={(e) => setForm({ ...form, cashierName: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[#FAFAFA] mb-2">Register</label>
            <input
              type="text"
              value={form.registerName}
              onChange={(e) => setForm({ ...form, registerName: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[#FAFAFA] mb-2">Opening Cash Balance ($)</label>
            <input
              type="number"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#262626]">
          <button
            onClick={() => onStart({
              cashierName: form.cashierName,
              registerName: form.registerName,
              openingBalance: parseFloat(form.openingBalance) || 0,
            })}
            className="w-full py-3 bg-[#161616] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#161616] transition-colors"
          >
            Open Register
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN POS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function POSPage() {
  const {
    session,
    cart,
    customer,
    products,
    searchQuery,
    orders,
    openSession,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCustomer,
    processPayment,
    setSearchQuery,
    searchProducts,
    fetchProducts,
    getCartTotals,
  } = usePOSStore();

  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts("org1");
  }, []);

  // Auto-focus barcode input
  useEffect(() => {
    if (session && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [session]);

  const totals = getCartTotals();
  
  // Get filtered products
  const filteredProducts = searchProducts(searchQuery).filter(
    p => selectedCategory === "all" || p.category === selectedCategory
  );

  // Get unique categories
  const categories: CategoryTab[] = [
    { id: "all", name: "All", count: products.length },
    ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))).map(cat => ({
      id: cat!,
      name: cat!,
      count: products.filter(p => p.category === cat).length,
    })),
  ];

  const handleStartSession = (data: { cashierName: string; registerName: string; openingBalance: number }) => {
    openSession("cashier1", data.cashierName, data.registerName, data.openingBalance);
  };

  const handlePayment = (method: "cash" | "card" | "split", amounts?: { cash: number; card: number }) => {
    const amount = method === "card" ? totals.total : 
                   method === "split" ? (amounts?.cash || 0) + (amounts?.card || 0) :
                   totals.total;
    const paymentMethod = method === "split" ? "mixed" : method;
    const order = processPayment(paymentMethod, amount);
    if (order) {
      setLastOrder(order);
      setShowReceipt(true);
    }
  };

  // Handle barcode scan (from keyboard input)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    const product = products.find(p => 
      p.barcode === searchQuery || p.sku.toLowerCase() === searchQuery.toLowerCase()
    );
    
    if (product) {
      addToCart(product);
      setSearchQuery("");
    }
  };

  if (!session) {
    return <SessionStartModal open={true} onStart={handleStartSession} />;
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT PANEL - Products
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search & Category Bar */}
        <div className="p-4 border-b border-[#262626] space-y-4">
          {/* Search with barcode support */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAFA]" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-[#0A0A0A] border border-[#262626] rounded-xl text-[#FAFAFA] placeholder-[#273B3A] focus:outline-none focus:border-[#262626] transition-colors text-lg"
            />
            <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAFA]" />
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat.id
                    ? "bg-[#161616] text-[#0A0A0A]"
                    : "bg-[#0A0A0A] text-[#FAFAFA] hover:text-[#FAFAFA] border border-[#262626]"
                )}
              >
                {cat.name}
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs",
                  selectedCategory === cat.id
                    ? "bg-[#0A0A0A]/20 text-[#0A0A0A]"
                    : "bg-[#0A0A0A] text-[#FAFAFA]"
                )}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#FAFAFA]">
              <Package className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </div>

        {/* Session Info Footer */}
        <div className="px-4 py-3 border-t border-[#262626] flex items-center justify-between text-sm text-[#FAFAFA]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {session.register_name}
            </span>
            <span>•</span>
            <span>{session.cashier_name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{orders.length} orders this session</span>
            <span className="text-emerald-400">
              Opening: ${session.opening_balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT PANEL - Cart
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-[400px] bg-[#0A0A0A] border-l border-[#262626] flex flex-col">
        {/* Cart Header */}
        <div className="px-4 py-4 border-b border-[#262626]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#FAFAFA] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#FAFAFA]" />
              Current Sale
              {cart.length > 0 && (
                <span className="px-2 py-0.5 bg-[#161616]/20 text-[#FAFAFA] text-xs rounded-full">
                  {cart.length}
                </span>
              )}
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-2 text-[#FAFAFA] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <button
            onClick={() => setCustomer(customer ? null : { id: "walk-in", name: "Walk-in Customer" })}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] rounded-lg text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
          >
            <User className="w-4 h-4" />
            {customer ? (
              <span className="text-[#FAFAFA]">{customer.name}</span>
            ) : (
              "Add Customer (optional)"
            )}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#FAFAFA]">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-medium">Cart is empty</p>
              <p className="text-sm mt-1">Search or scan items to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))
          )}
        </div>

        {/* Totals */}
        <div className="px-4 py-4 border-t border-[#262626] space-y-2 bg-[#0A0A0A]">
          <div className="flex justify-between text-sm">
            <span className="text-[#FAFAFA]">Subtotal</span>
            <span className="text-[#FAFAFA]">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#FAFAFA]">HST (13%)</span>
            <span className="text-[#FAFAFA]">${totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-[#262626]">
            <span className="text-[#FAFAFA]">Total</span>
            <span className="text-[#FAFAFA]">${totals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="p-4 border-t border-[#262626] grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Banknote className="w-5 h-5" />
            Cash
          </button>
          <button
            onClick={() => handlePayment("card")}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-2 py-4 bg-[#161616] hover:bg-[#161616] text-[#0A0A0A] rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" />
            Card
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════════════ */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        totals={totals}
        onPayment={handlePayment}
      />

      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        order={lastOrder}
      />
    </div>
  );
}
