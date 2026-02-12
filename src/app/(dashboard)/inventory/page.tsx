import { Package, Plus, Search, Filter, Download } from "lucide-react";

const products = [
  { name: "Amoxicillin 500mg", sku: "AMX-500", category: "Antibiotics", stock: 142, price: 12.99, status: "In Stock" },
  { name: "Vitamin D3 1000IU", sku: "VTD-1000", category: "Vitamins", stock: 8, price: 9.49, status: "Low Stock" },
  { name: "Ibuprofen 200mg", sku: "IBU-200", category: "Pain Relief", stock: 256, price: 7.99, status: "In Stock" },
  { name: "Metformin 500mg", sku: "MET-500", category: "Diabetes", stock: 0, price: 15.49, status: "Out of Stock" },
  { name: "Lisinopril 10mg", sku: "LIS-10", category: "Blood Pressure", stock: 89, price: 11.29, status: "In Stock" },
  { name: "Cetirizine 10mg", sku: "CET-10", category: "Allergy", stock: 15, price: 6.99, status: "Low Stock" },
  { name: "Omeprazole 20mg", sku: "OMP-20", category: "Digestive", stock: 167, price: 13.79, status: "In Stock" },
  { name: "Acetaminophen 500mg", sku: "ACT-500", category: "Pain Relief", stock: 312, price: 5.99, status: "In Stock" },
];

function StatusBadge({ status }: { status: string }) {
  const colors = {
    "In Stock": "bg-emerald-500/10 text-emerald-500",
    "Low Stock": "bg-amber-500/10 text-amber-500",
    "Out of Stock": "bg-red-500/10 text-red-500",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage products across all locations
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.sku} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground font-mono">{p.sku}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.category}</td>
                <td className="px-5 py-3.5 text-sm text-right font-medium">{p.stock}</td>
                <td className="px-5 py-3.5 text-sm text-right text-muted-foreground">${p.price}</td>
                <td className="px-5 py-3.5 text-right"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
