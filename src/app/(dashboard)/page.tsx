import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Products",
    value: "1,284",
    change: "+12%",
    trend: "up",
    icon: Package,
  },
  {
    label: "Revenue (MTD)",
    value: "$48,250",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Stock Value",
    value: "$124,800",
    change: "-2.1%",
    trend: "down",
    icon: TrendingUp,
  },
  {
    label: "Low Stock Alerts",
    value: "23",
    change: "+5",
    trend: "up",
    icon: AlertTriangle,
  },
];

const recentActivity = [
  { action: "Stock received", detail: "42 units of Vitamin D3 at Grand Ave", time: "2m ago" },
  { action: "Invoice paid", detail: "INV-2024-089 by MedSupply Co.", time: "15m ago" },
  { action: "Transfer completed", detail: "18 units moved to Queen St", time: "1h ago" },
  { action: "Low stock alert", detail: "Amoxicillin 500mg below threshold", time: "2h ago" },
  { action: "New contact added", detail: "PharmaDist Inc. (Vendor)", time: "3h ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your business
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.detail}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              "Add Product",
              "Create Invoice",
              "Record Stock",
              "Add Contact",
              "Transfer Stock",
            ].map((action) => (
              <button
                key={action}
                className="w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
