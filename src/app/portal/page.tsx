"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Download,
  Clock,
  Headphones,
  User,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Plus,
  Send,
  Paperclip,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Package,
  DollarSign,
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  X,
  ExternalLink,
  FileDown,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PortalSession {
  customerId: string;
  email: string;
  name: string;
  expiresAt: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  items: number;
}

interface Order {
  id: string;
  number: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "pending";
  items: number;
  total: number;
}

interface Ticket {
  id: string;
  number: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  lastUpdate: string;
  messages: number;
}

interface CustomerInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockInvoices: Invoice[] = [
  { id: "1", number: "INV-2024-0042", date: "2024-02-10", dueDate: "2024-03-10", amount: 2450.00, status: "pending", items: 5 },
  { id: "2", number: "INV-2024-0038", date: "2024-02-01", dueDate: "2024-03-01", amount: 1825.50, status: "paid", items: 3 },
  { id: "3", number: "INV-2024-0035", date: "2024-01-20", dueDate: "2024-02-20", amount: 3200.00, status: "overdue", items: 8 },
  { id: "4", number: "INV-2024-0028", date: "2024-01-05", dueDate: "2024-02-05", amount: 950.00, status: "paid", items: 2 },
];

const mockOrders: Order[] = [
  { id: "1", number: "ORD-2024-0156", date: "2024-02-12", status: "processing", items: 3, total: 1250.00 },
  { id: "2", number: "ORD-2024-0148", date: "2024-02-08", status: "shipped", items: 5, total: 2100.00 },
  { id: "3", number: "ORD-2024-0142", date: "2024-02-01", status: "delivered", items: 2, total: 850.00 },
  { id: "4", number: "ORD-2024-0135", date: "2024-01-25", status: "delivered", items: 4, total: 1600.00 },
];

const mockTickets: Ticket[] = [
  { id: "1", number: "TKT-000024", subject: "Question about invoice INV-2024-0042", status: "open", priority: "normal", createdAt: "2024-02-11", lastUpdate: "2024-02-12", messages: 2 },
  { id: "2", number: "TKT-000018", subject: "Product return request", status: "in_progress", priority: "high", createdAt: "2024-02-05", lastUpdate: "2024-02-10", messages: 5 },
  { id: "3", number: "TKT-000012", subject: "Delivery address change", status: "resolved", priority: "normal", createdAt: "2024-01-28", lastUpdate: "2024-01-30", messages: 3 },
];

const mockCustomerInfo: CustomerInfo = {
  name: "John Smith",
  company: "Acme Healthcare Inc.",
  email: "john.smith@acmehealthcare.com",
  phone: "+1 (555) 123-4567",
  address: "123 Medical Center Dr, Suite 400, Toronto, ON M5V 3A8",
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function PortalNav({
  activeTab,
  onTabChange,
  customer,
  onLogout,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  customer: PortalSession | null;
  onLogout: () => void;
}) {
  const tabs = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "orders", label: "Orders", icon: Package },
    { id: "tickets", label: "Support", icon: Headphones },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <header className="border-b border-[#DDD7C0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/portal" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9C4A29] to-[#7D3B21] flex items-center justify-center">
              <span className="text-[#E8E3CC] font-bold text-sm">A</span>
            </div>
            <span className="text-[#2D1810] font-semibold text-lg hidden sm:block">
              Customer Portal
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-[#9C4A29]/10 text-[#9C4A29]"
                    : "text-[#6B5B4F] hover:text-[#2D1810] hover:bg-[#F5F2E8]"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#2D1810]">{customer?.name}</p>
              <p className="text-xs text-[#8B7B6F]">{customer?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-[#8B7B6F] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function InvoicesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch = inv.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    overdue: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const handleDownloadPDF = (invoiceId: string) => {
    // In production, this would trigger PDF generation/download
    alert(`Downloading PDF for invoice ${invoiceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D1810]">Invoices</h2>
          <p className="text-[#6B5B4F] mt-1">View and download your invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7B6F]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] placeholder-[#8B7B6F] focus:outline-none focus:border-[#9C4A29] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#F5F2E8] border border-[#DDD7C0] rounded-lg text-sm text-[#2D1810] focus:outline-none focus:border-[#9C4A29] transition-colors"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoice List */}
      <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#DDD7C0]">
              <th className="text-left px-6 py-4 text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">Invoice</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">Due Date</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">Amount</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-[#8B7B6F] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDD7C0]/50">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-[#DDD7C0]/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[#2D1810]">{invoice.number}</p>
                  <p className="text-xs text-[#8B7B6F]">{invoice.items} items</p>
                </td>
                <td className="px-6 py-4 text-sm text-[#6B5B4F]">{invoice.date}</td>
                <td className="px-6 py-4 text-sm text-[#6B5B4F]">{invoice.dueDate}</td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-[#2D1810]">
                    ${invoice.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                    statusColors[invoice.status]
                  )}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDownloadPDF(invoice.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9C4A29]/10 text-[#9C4A29] rounded-lg text-xs font-medium hover:bg-[#9C4A29]/20 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    {invoice.status !== "paid" && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const statusConfig = {
    delivered: { color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
    shipped: { color: "bg-blue-500/10 text-blue-400", icon: Package },
    processing: { color: "bg-amber-500/10 text-amber-400", icon: Timer },
    pending: { color: "bg-[#DDD7C0] text-[#6B5B4F]", icon: Clock },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2D1810]">Order History</h2>
        <p className="text-[#6B5B4F] mt-1">Track your orders and deliveries</p>
      </div>

      <div className="space-y-4">
        {mockOrders.map((order) => {
          const status = statusConfig[order.status];
          return (
            <div
              key={order.id}
              className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl p-5 hover:border-[#9C4A29]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#2D1810]">{order.number}</h3>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.color
                    )}>
                      <status.icon className="w-3.5 h-3.5" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-[#8B7B6F] mt-1">
                    {order.items} items • Ordered on {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#9C4A29]">
                    ${order.total.toFixed(2)}
                  </p>
                  <button className="text-xs text-[#6B5B4F] hover:text-[#9C4A29] mt-1 flex items-center gap-1">
                    View Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progress Bar for non-delivered orders */}
              {order.status !== "delivered" && (
                <div className="mt-4 pt-4 border-t border-[#DDD7C0]">
                  <div className="flex items-center gap-4">
                    {["pending", "processing", "shipped", "delivered"].map((step, i) => (
                      <div key={step} className="flex-1 relative">
                        <div className={cn(
                          "h-1 rounded-full",
                          ["pending", "processing", "shipped", "delivered"].indexOf(order.status) >= i
                            ? "bg-[#9C4A29]"
                            : "bg-[#DDD7C0]"
                        )} />
                        {i < 3 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E8E3CC] border-2 border-[#DDD7C0]" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-[#8B7B6F]">
                    <span>Pending</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupportTab() {
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "" });

  const priorityColors = {
    low: "bg-[#DDD7C0] text-[#6B5B4F]",
    normal: "bg-blue-500/10 text-blue-400",
    high: "bg-amber-500/10 text-amber-400",
    urgent: "bg-red-500/10 text-red-400",
  };

  const statusColors = {
    open: "bg-emerald-500/10 text-emerald-400",
    in_progress: "bg-blue-500/10 text-blue-400",
    resolved: "bg-[#DDD7C0] text-[#6B5B4F]",
    closed: "bg-[#DDD7C0] text-[#8B7B6F]",
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Ticket submitted: ${newTicket.subject}`);
    setShowNewTicket(false);
    setNewTicket({ subject: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D1810]">Support Tickets</h2>
          <p className="text-[#6B5B4F] mt-1">Get help from our support team</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg font-semibold hover:bg-[#7D3B21] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#2D1810]">Create Support Ticket</h3>
            <button
              onClick={() => setShowNewTicket(false)}
              className="p-1 text-[#8B7B6F] hover:text-[#2D1810] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B5B4F] mb-2">Subject</label>
              <input
                type="text"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-[#2D1810] placeholder-[#8B7B6F] focus:outline-none focus:border-[#9C4A29] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B5B4F] mb-2">Description</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Please provide as much detail as possible..."
                rows={4}
                className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-[#2D1810] placeholder-[#8B7B6F] focus:outline-none focus:border-[#9C4A29] transition-colors resize-none"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewTicket(false)}
                className="px-4 py-2 text-[#6B5B4F] hover:text-[#2D1810] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#9C4A29] text-[#E8E3CC] rounded-lg font-semibold hover:bg-[#7D3B21] transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {mockTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl p-5 hover:border-[#9C4A29]/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#8B7B6F]">{ticket.number}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium",
                    statusColors[ticket.status]
                  )}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium",
                    priorityColors[ticket.priority]
                  )}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-medium text-[#2D1810] mt-2">{ticket.subject}</h3>
                <p className="text-sm text-[#8B7B6F] mt-1">
                  Created {ticket.createdAt} • Last update {ticket.lastUpdate}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B5B4F]">
                <MessageSquare className="w-4 h-4" />
                {ticket.messages}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  const [editing, setEditing] = useState(false);
  const [info, setInfo] = useState(mockCustomerInfo);

  const handleSave = () => {
    setEditing(false);
    alert("Profile updated successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2D1810]">Profile Settings</h2>
        <p className="text-[#6B5B4F] mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#DDD7C0] flex items-center justify-between">
            <h3 className="font-semibold text-[#2D1810]">Contact Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-[#9C4A29] hover:text-[#7D3B21] transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-[#8B7B6F] hover:text-[#2D1810] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9C4A29] text-[#E8E3CC] rounded-lg text-sm font-semibold hover:bg-[#7D3B21] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            {[
              { icon: User, label: "Full Name", key: "name" },
              { icon: Building2, label: "Company", key: "company" },
              { icon: Mail, label: "Email", key: "email" },
              { icon: Phone, label: "Phone", key: "phone" },
              { icon: MapPin, label: "Address", key: "address" },
            ].map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm text-[#8B7B6F] mb-1.5">
                  <field.icon className="w-4 h-4" />
                  {field.label}
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={info[field.key as keyof CustomerInfo]}
                    onChange={(e) => setInfo({ ...info, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#E8E3CC] border border-[#DDD7C0] rounded-lg text-[#2D1810] focus:outline-none focus:border-[#9C4A29] transition-colors"
                  />
                ) : (
                  <p className="text-[#2D1810]">{info[field.key as keyof CustomerInfo]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl p-6">
            <h3 className="font-semibold text-[#2D1810] mb-4">Account Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#6B5B4F]">Total Invoices</span>
                <span className="text-[#2D1810] font-semibold">{mockInvoices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B5B4F]">Open Invoices</span>
                <span className="text-amber-400 font-semibold">
                  {mockInvoices.filter((i) => i.status !== "paid").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B5B4F]">Total Orders</span>
                <span className="text-[#2D1810] font-semibold">{mockOrders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B5B4F]">Open Tickets</span>
                <span className="text-[#9C4A29] font-semibold">
                  {mockTickets.filter((t) => t.status === "open" || t.status === "in_progress").length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F2E8] border border-[#DDD7C0] rounded-xl p-6">
            <h3 className="font-semibold text-[#2D1810] mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#E8E3CC] rounded-lg text-sm text-[#6B5B4F] hover:text-[#2D1810] transition-colors">
                <span>Change Password</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#E8E3CC] rounded-lg text-sm text-[#6B5B4F] hover:text-[#2D1810] transition-colors">
                <span>Notification Preferences</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#E8E3CC] rounded-lg text-sm text-[#6B5B4F] hover:text-[#2D1810] transition-colors">
                <span>Download All Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PORTAL PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function PortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for session
    const storedSession = localStorage.getItem("portal_session");
    if (storedSession) {
      const parsed = JSON.parse(storedSession) as PortalSession;
      if (parsed.expiresAt > Date.now()) {
        setSession(parsed);
      } else {
        localStorage.removeItem("portal_session");
        router.push("/portal/login");
        return;
      }
    } else {
      router.push("/portal/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("portal_session");
    router.push("/portal/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#9C4A29] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PortalNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        customer={session}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "tickets" && <SupportTab />}
        {activeTab === "profile" && <ProfileTab />}
      </main>
    </div>
  );
}
