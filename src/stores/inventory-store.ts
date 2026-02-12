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

  // Computed
  filteredProducts: () => Product[];
}

const defaultFilters: InventoryFilters = { category: "", status: "" };

const mockProducts: Product[] = [
  { id: "p1", org_id: "org1", name: "Amoxicillin 500mg", sku: "AMX-500", barcode: "8901234560001", category: "Antibiotics", description: "", cost_price: 8.50, sell_price: 12.99, unit: "box", is_active: true, created_at: "2026-01-15T10:00:00Z" },
  { id: "p2", org_id: "org1", name: "Vitamin D3 1000IU", sku: "VTD-1000", barcode: "8901234560002", category: "Vitamins", description: "", cost_price: 5.00, sell_price: 9.49, unit: "bottle", is_active: true, created_at: "2026-01-16T10:00:00Z" },
  { id: "p3", org_id: "org1", name: "Ibuprofen 200mg", sku: "IBU-200", barcode: "8901234560003", category: "Pain Relief", description: "", cost_price: 4.20, sell_price: 7.99, unit: "box", is_active: true, created_at: "2026-01-17T10:00:00Z" },
  { id: "p4", org_id: "org1", name: "Metformin 500mg", sku: "MET-500", barcode: "8901234560004", category: "Diabetes", description: "", cost_price: 10.00, sell_price: 15.49, unit: "box", is_active: false, created_at: "2026-01-18T10:00:00Z" },
  { id: "p5", org_id: "org1", name: "Lisinopril 10mg", sku: "LIS-10", barcode: "8901234560005", category: "Blood Pressure", description: "", cost_price: 7.50, sell_price: 11.29, unit: "box", is_active: true, created_at: "2026-01-19T10:00:00Z" },
  { id: "p6", org_id: "org1", name: "Cetirizine 10mg", sku: "CET-10", barcode: "8901234560006", category: "Allergy", description: "", cost_price: 3.50, sell_price: 6.99, unit: "strip", is_active: true, created_at: "2026-01-20T10:00:00Z" },
  { id: "p7", org_id: "org1", name: "Omeprazole 20mg", sku: "OMP-20", barcode: "8901234560007", category: "Digestive", description: "", cost_price: 9.00, sell_price: 13.79, unit: "box", is_active: true, created_at: "2026-01-21T10:00:00Z" },
  { id: "p8", org_id: "org1", name: "Acetaminophen 500mg", sku: "ACT-500", barcode: "8901234560008", category: "Pain Relief", description: "", cost_price: 3.00, sell_price: 5.99, unit: "bottle", is_active: true, created_at: "2026-01-22T10:00:00Z" },
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
