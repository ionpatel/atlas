import { create } from "zustand";
import type { Product } from "@/types";

interface InventoryFilters {
  category: string;
  status: string;
}

interface InventoryState {
  products: Product[];
  searchQuery: string;
  filters: InventoryFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof InventoryFilters, value: string) => void;
  resetFilters: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;

  // Computed
  filteredProducts: () => Product[];
}

const defaultFilters: InventoryFilters = { category: "", status: "" };

const mockProducts: Product[] = [
  { id: "p1", org_id: "org1", name: "Amoxicillin 500mg", sku: "AMX-500", barcode: "8901234560001", category: "Antibiotics", description: "Broad-spectrum antibiotic", cost_price: 8.50, sell_price: 12.99, unit: "box", is_active: true, stock_quantity: 150, min_quantity: 50, weight: 0.3, dimensions: "10x5x3 cm", created_at: "2026-01-15T10:00:00Z" },
  { id: "p2", org_id: "org1", name: "Vitamin D3 1000IU", sku: "VTD-1000", barcode: "8901234560002", category: "Vitamins", description: "Essential vitamin supplement", cost_price: 5.00, sell_price: 9.49, unit: "bottle", is_active: true, stock_quantity: 320, min_quantity: 100, weight: 0.15, dimensions: "6x6x12 cm", created_at: "2026-01-16T10:00:00Z" },
  { id: "p3", org_id: "org1", name: "Ibuprofen 200mg", sku: "IBU-200", barcode: "8901234560003", category: "Pain Relief", description: "Anti-inflammatory pain reliever", cost_price: 4.20, sell_price: 7.99, unit: "box", is_active: true, stock_quantity: 25, min_quantity: 40, weight: 0.2, dimensions: "8x4x2 cm", created_at: "2026-01-17T10:00:00Z" },
  { id: "p4", org_id: "org1", name: "Metformin 500mg", sku: "MET-500", barcode: "8901234560004", category: "Diabetes", description: "Blood sugar management", cost_price: 10.00, sell_price: 15.49, unit: "box", is_active: false, stock_quantity: 0, min_quantity: 30, weight: 0.25, dimensions: "10x5x3 cm", created_at: "2026-01-18T10:00:00Z" },
  { id: "p5", org_id: "org1", name: "Lisinopril 10mg", sku: "LIS-10", barcode: "8901234560005", category: "Blood Pressure", description: "ACE inhibitor for blood pressure", cost_price: 7.50, sell_price: 11.29, unit: "box", is_active: true, stock_quantity: 85, min_quantity: 60, weight: 0.18, dimensions: "8x4x2 cm", created_at: "2026-01-19T10:00:00Z" },
  { id: "p6", org_id: "org1", name: "Cetirizine 10mg", sku: "CET-10", barcode: "8901234560006", category: "Allergy", description: "Antihistamine for allergies", cost_price: 3.50, sell_price: 6.99, unit: "strip", is_active: true, stock_quantity: 200, min_quantity: 80, weight: 0.05, dimensions: "12x3x0.5 cm", created_at: "2026-01-20T10:00:00Z" },
  { id: "p7", org_id: "org1", name: "Omeprazole 20mg", sku: "OMP-20", barcode: "8901234560007", category: "Digestive", description: "Proton pump inhibitor", cost_price: 9.00, sell_price: 13.79, unit: "box", is_active: true, stock_quantity: 45, min_quantity: 40, weight: 0.22, dimensions: "9x5x3 cm", created_at: "2026-01-21T10:00:00Z" },
  { id: "p8", org_id: "org1", name: "Acetaminophen 500mg", sku: "ACT-500", barcode: "8901234560008", category: "Pain Relief", description: "Pain and fever reducer", cost_price: 3.00, sell_price: 5.99, unit: "bottle", is_active: true, stock_quantity: 0, min_quantity: 50, weight: 0.35, dimensions: "6x6x14 cm", created_at: "2026-01-22T10:00:00Z" },
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: mockProducts,
  searchQuery: "",
  filters: { ...defaultFilters },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...defaultFilters }, searchQuery: "" }),

  addProduct: (product) =>
    set((state) => ({ products: [product, ...state.products] })),

  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  deleteProducts: (ids) =>
    set((state) => ({
      products: state.products.filter((p) => !ids.includes(p.id)),
    })),

  filteredProducts: () => {
    const { products, searchQuery, filters } = get();
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));

      const matchesCategory =
        !filters.category || p.category === filters.category;

      const matchesStatus =
        !filters.status ||
        (filters.status === "active" && p.is_active) ||
        (filters.status === "inactive" && !p.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  },
}));

export const getCategories = (products: Product[]): string[] => {
  return [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
};
