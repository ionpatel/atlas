import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  total: number;
}

export interface POSSession {
  id: string;
  org_id: string;
  cashier_id: string;
  cashier_name: string;
  register_name: string;
  opening_balance: number;
  closing_balance?: number;
  status: "open" | "closed";
  started_at: string;
  closed_at?: string;
}

export interface POSOrder {
  id: string;
  org_id: string;
  session_id: string;
  order_number: string;
  customer_id?: string;
  customer_name?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: "cash" | "card" | "mixed";
  amount_paid: number;
  change_due: number;
  status: "completed" | "refunded" | "voided";
  created_at: string;
}

interface POSState {
  // Current session
  session: POSSession | null;
  
  // Cart
  cart: CartItem[];
  customer: { id: string; name: string } | null;
  
  // Product search
  products: Product[];
  searchQuery: string;
  
  // Orders history
  orders: POSOrder[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Session actions
  openSession: (cashierId: string, cashierName: string, registerName: string, openingBalance: number) => void;
  closeSession: (closingBalance: number) => void;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  applyDiscount: (itemId: string, discount: number) => void;
  clearCart: () => void;
  setCustomer: (customer: { id: string; name: string } | null) => void;
  
  // Checkout
  processPayment: (paymentMethod: "cash" | "card" | "mixed", amountPaid: number) => POSOrder | null;
  
  // Product search
  setSearchQuery: (query: string) => void;
  searchProducts: (query: string) => Product[];
  fetchProducts: (orgId: string) => Promise<void>;
  
  // Order history
  fetchOrders: (sessionId: string) => Promise<void>;
  refundOrder: (orderId: string) => Promise<boolean>;
  
  // Computed
  getCartTotals: () => { subtotal: number; tax: number; discount: number; total: number };
}

// Canadian HST rate (Ontario)
const TAX_RATE = 0.13;

const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export const usePOSStore = create<POSState>((set, get) => ({
  session: null,
  cart: [],
  customer: null,
  products: [],
  searchQuery: "",
  orders: [],
  loading: false,
  error: null,

  openSession: (cashierId, cashierName, registerName, openingBalance) => {
    const session: POSSession = {
      id: `pos-${Date.now()}`,
      org_id: "org1",
      cashier_id: cashierId,
      cashier_name: cashierName,
      register_name: registerName,
      opening_balance: openingBalance,
      status: "open",
      started_at: new Date().toISOString(),
    };
    set({ session, cart: [], orders: [] });
  },

  closeSession: (closingBalance) => {
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            closing_balance: closingBalance,
            status: "closed",
            closed_at: new Date().toISOString(),
          }
        : null,
    }));
  },

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.cart.find((i) => i.product_id === product.id);
      
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total: (item.quantity + quantity) * item.unit_price * (1 - item.discount / 100),
                }
              : item
          ),
        };
      }
      
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${product.id}`,
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        quantity,
        unit_price: product.sell_price,
        discount: 0,
        tax_rate: TAX_RATE * 100,
        total: quantity * product.sell_price,
      };
      
      return { cart: [...state.cart, newItem] };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              total: quantity * item.unit_price * (1 - item.discount / 100),
            }
          : item
      ),
    }));
  },

  removeFromCart: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    }));
  },

  applyDiscount: (itemId, discount) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              discount,
              total: item.quantity * item.unit_price * (1 - discount / 100),
            }
          : item
      ),
    }));
  },

  clearCart: () => {
    set({ cart: [], customer: null });
  },

  setCustomer: (customer) => {
    set({ customer });
  },

  processPayment: (paymentMethod, amountPaid) => {
    const state = get();
    if (!state.session || state.cart.length === 0) return null;
    
    const totals = state.getCartTotals();
    const changeDue = amountPaid - totals.total;
    
    if (changeDue < 0 && paymentMethod === "cash") {
      return null; // Insufficient payment
    }
    
    const order: POSOrder = {
      id: `order-${Date.now()}`,
      org_id: "org1",
      session_id: state.session.id,
      order_number: `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(state.orders.length + 1).padStart(4, "0")}`,
      customer_id: state.customer?.id,
      customer_name: state.customer?.name,
      items: [...state.cart],
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      payment_method: paymentMethod,
      amount_paid: amountPaid,
      change_due: Math.max(0, changeDue),
      status: "completed",
      created_at: new Date().toISOString(),
    };
    
    set((state) => ({
      orders: [order, ...state.orders],
      cart: [],
      customer: null,
    }));
    
    return order;
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  searchProducts: (query) => {
    const { products } = get();
    if (!query) return products.slice(0, 20);
    
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        (p.barcode && p.barcode.includes(query))
    );
  },

  fetchProducts: async (orgId) => {
    set({ loading: true });
    
    if (!isSupabaseConfigured()) {
      // Use mock products from inventory store
      const mockProducts: Product[] = [
        { id: "p1", org_id: "org1", name: "Amoxicillin 500mg", sku: "AMX-500", barcode: "8901234560001", category: "Antibiotics", description: "", cost_price: 8.50, sell_price: 12.99, unit: "box", is_active: true, stock_quantity: 150, min_quantity: 50, created_at: "" },
        { id: "p2", org_id: "org1", name: "Vitamin D3 1000IU", sku: "VTD-1000", barcode: "8901234560002", category: "Vitamins", description: "", cost_price: 5.00, sell_price: 9.49, unit: "bottle", is_active: true, stock_quantity: 320, min_quantity: 100, created_at: "" },
        { id: "p3", org_id: "org1", name: "Ibuprofen 200mg", sku: "IBU-200", barcode: "8901234560003", category: "Pain Relief", description: "", cost_price: 4.20, sell_price: 7.99, unit: "box", is_active: true, stock_quantity: 25, min_quantity: 40, created_at: "" },
        { id: "p5", org_id: "org1", name: "Lisinopril 10mg", sku: "LIS-10", barcode: "8901234560005", category: "Blood Pressure", description: "", cost_price: 7.50, sell_price: 11.29, unit: "box", is_active: true, stock_quantity: 85, min_quantity: 60, created_at: "" },
        { id: "p6", org_id: "org1", name: "Cetirizine 10mg", sku: "CET-10", barcode: "8901234560006", category: "Allergy", description: "", cost_price: 3.50, sell_price: 6.99, unit: "strip", is_active: true, stock_quantity: 200, min_quantity: 80, created_at: "" },
        { id: "p7", org_id: "org1", name: "Omeprazole 20mg", sku: "OMP-20", barcode: "8901234560007", category: "Digestive", description: "", cost_price: 9.00, sell_price: 13.79, unit: "box", is_active: true, stock_quantity: 45, min_quantity: 40, created_at: "" },
      ];
      set({ products: mockProducts, loading: false });
      return;
    }
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("org_id", orgId)
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      set({ products: data || [], loading: false });
    } catch (err) {
      set({ error: "Failed to fetch products", loading: false });
    }
  },

  fetchOrders: async (sessionId) => {
    // For now, orders are kept in memory per session
    // In production, this would fetch from Supabase
  },

  refundOrder: async (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: "refunded" } : o
      ),
    }));
    return true;
  },

  getCartTotals: () => {
    const { cart } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discount = cart.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price * item.discount) / 100,
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },
}));
