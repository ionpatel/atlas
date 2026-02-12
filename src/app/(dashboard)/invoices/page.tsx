import { FileText, Plus, Search, Filter } from "lucide-react";

const invoices = [
  { number: "INV-2026-001", customer: "MedSupply Co.", date: "Feb 10, 2026", due: "Mar 10, 2026", amount: 2450.00, status: "Paid" },
  { number: "INV-2026-002", customer: "HealthFirst Dist.", date: "Feb 8, 2026", due: "Mar 8, 2026", amount: 1890.50, status: "Sent" },
  { number: "INV-2026-003", customer: "CarePharm Ltd.", date: "Feb 5, 2026", due: "Mar 5, 2026", amount: 3200.00, status: "Overdue" },
  { number: "INV-2026-004", customer: "WellBeing Inc.", date: "Feb 3, 2026", due: "Mar 3, 2026", amount: 750.25, status: "Draft" },
  { number: "INV-2026-005", customer: "PharmaPlus", date: "Feb 1, 2026", due: "Mar 1, 2026", amount: 4100.00, status: "Paid" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Paid: "bg-emerald-500/10 text-emerald-500",
    Sent: "bg-blue-500/10 text-blue-500",
    Overdue: "bg-red-500/10 text-red-500",
    Draft: "bg-zinc-500/10 text-zinc-500",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage invoices</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search invoices..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((inv) => (
              <tr key={inv.number} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium font-mono">{inv.number}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm">{inv.customer}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{inv.date}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{inv.due}</td>
                <td className="px-5 py-3.5 text-sm text-right font-medium">${inv.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right"><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
