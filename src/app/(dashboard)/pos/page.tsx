"use client";

import { useEffect, useState } from "react";
import { usePOSStore } from "@/stores/pos-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "lucide-react";

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

  const [showStartSession, setShowStartSession] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [sessionForm, setSessionForm] = useState({
    cashierName: "John Doe",
    registerName: "Register 1",
    openingBalance: "500",
  });

  useEffect(() => {
    fetchProducts("org1");
    if (!session) {
      setShowStartSession(true);
    }
  }, []);

  const totals = getCartTotals();
  const filteredProducts = searchProducts(searchQuery);

  const handleStartSession = () => {
    openSession(
      "cashier1",
      sessionForm.cashierName,
      sessionForm.registerName,
      parseFloat(sessionForm.openingBalance) || 0
    );
    setShowStartSession(false);
  };

  const handlePayment = (method: "cash" | "card") => {
    const amount = method === "card" ? totals.total : parseFloat(paymentAmount) || 0;
    const order = processPayment(method, amount);
    if (order) {
      setLastOrder(order);
      setShowPayment(false);
      setShowReceipt(true);
      setPaymentAmount("");
    }
  };

  const quickCashAmounts = [20, 50, 100];

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#111111] border-[#222]">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-[#CDB49E]" />
              Start POS Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Cashier Name</label>
              <Input
                value={sessionForm.cashierName}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, cashierName: e.target.value })
                }
                className="bg-[#1a1a1a] border-[#333] text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Register</label>
              <Input
                value={sessionForm.registerName}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, registerName: e.target.value })
                }
                className="bg-[#1a1a1a] border-[#333] text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Opening Balance ($)</label>
              <Input
                type="number"
                value={sessionForm.openingBalance}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, openingBalance: e.target.value })
                }
                className="bg-[#1a1a1a] border-[#333] text-white mt-1"
              />
            </div>
            <Button
              onClick={handleStartSession}
              className="w-full bg-[#CDB49E] hover:bg-[#b9a089] text-black font-semibold"
            >
              Open Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left: Products Grid */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#111] border-[#333] text-white h-12 text-lg"
              autoFocus
            />
            <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-[#111] border border-[#222] rounded-lg p-4 text-left hover:border-[#CDB49E] transition-colors group"
              >
                <div className="aspect-square bg-[#1a1a1a] rounded-md mb-3 flex items-center justify-center">
                  <span className="text-3xl">💊</span>
                </div>
                <h3 className="font-medium text-white text-sm truncate group-hover:text-[#CDB49E]">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                <p className="text-[#CDB49E] font-bold mt-2">
                  ${product.sell_price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Stock: {product.stock_quantity}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Session Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t border-[#222] pt-4">
          <span>
            {session.register_name} • {session.cashier_name}
          </span>
          <span>Session: {orders.length} orders</span>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-[#111] border-l border-[#222] flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-[#222]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#CDB49E]" />
              Current Sale
            </h2>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Customer */}
          <button
            onClick={() => setCustomer(customer ? null : { id: "walk-in", name: "Walk-in Customer" })}
            className="mt-3 w-full flex items-center gap-2 p-2 rounded bg-[#1a1a1a] text-sm text-gray-400 hover:text-white transition-colors"
          >
            <User className="h-4 w-4" />
            {customer ? customer.name : "Add Customer (optional)"}
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Cart is empty</p>
              <p className="text-sm mt-1">Search or scan items to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a1a] rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-white font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 rounded bg-[#222] flex items-center justify-center text-white hover:bg-[#333]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-white w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 rounded bg-[#222] flex items-center justify-center text-white hover:bg-[#333]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-[#CDB49E] font-semibold">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals */}
        <div className="border-t border-[#222] p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>HST (13%)</span>
            <span>${totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-[#333]">
            <span>Total</span>
            <span className="text-[#CDB49E]">${totals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="p-4 border-t border-[#222] grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="h-14 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <Banknote className="h-5 w-5 mr-2" />
            Cash
          </Button>
          <Button
            onClick={() => handlePayment("card")}
            disabled={cart.length === 0}
            className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Card
          </Button>
        </div>
      </div>

      {/* Cash Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              Cash Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-gray-400">Amount Due</p>
              <p className="text-4xl font-bold text-[#CDB49E]">
                ${totals.total.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Cash Received</label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                className="bg-[#1a1a1a] border-[#333] text-white text-2xl text-center h-14 mt-1"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {quickCashAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setPaymentAmount(amount.toString())}
                  className="flex-1 border-[#333] text-white hover:bg-[#222]"
                >
                  ${amount}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setPaymentAmount(Math.ceil(totals.total).toString())}
                className="flex-1 border-[#333] text-white hover:bg-[#222]"
              >
                Exact
              </Button>
            </div>
            {parseFloat(paymentAmount) >= totals.total && (
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-gray-400 text-sm">Change Due</p>
                <p className="text-2xl font-bold text-green-400">
                  ${(parseFloat(paymentAmount) - totals.total).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowPayment(false)}
              className="text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handlePayment("cash")}
              disabled={parseFloat(paymentAmount) < totals.total}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-6 w-6" />
              Payment Complete!
            </DialogTitle>
          </DialogHeader>
          {lastOrder && (
            <div className="space-y-4 py-4">
              <div className="text-center border-b border-[#333] pb-4">
                <p className="text-gray-400 text-sm">Order #{lastOrder.order_number}</p>
                <p className="text-3xl font-bold text-[#CDB49E] mt-2">
                  ${lastOrder.total.toFixed(2)}
                </p>
                {lastOrder.payment_method === "cash" && lastOrder.change_due > 0 && (
                  <p className="text-green-400 mt-2">
                    Change: ${lastOrder.change_due.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {lastOrder.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-white">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            <Button
              variant="outline"
              className="w-full border-[#333] text-white"
              onClick={() => window.print()}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={() => setShowReceipt(false)}
              className="w-full bg-[#CDB49E] hover:bg-[#b9a089] text-black"
            >
              New Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
