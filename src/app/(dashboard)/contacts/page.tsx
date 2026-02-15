"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, Filter, Mail, Phone, Pencil, Trash2, Users, X,
  List, LayoutGrid, Download, Upload, FileText, Clock,
  ShoppingCart, Package, UserPlus, ChevronRight, ExternalLink,
} from "lucide-react";
import { useContactsStore } from "@/stores/contacts-store";
import { useInvoicesStore } from "@/stores/invoices-store";
import { Modal } from "@/components/ui/modal";
import { ContactForm } from "@/components/modules/contact-form";
import { ImportWizard } from "@/components/import";
import { useToastStore } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contact } from "@/types";

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    vendor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    customer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    both: "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA] border-[#262626]/20",
  };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[type]}`}>
      {label}
    </span>
  );
}

function StatCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    accent: { bg: "bg-[rgba(156,74,41,0.15)]/50", text: "text-[#FAFAFA]", iconBg: "bg-[rgba(156,74,41,0.15)]" },
    green: { bg: "bg-emerald-500/5", text: "text-emerald-400", iconBg: "bg-emerald-500/10" },
    blue: { bg: "bg-blue-500/5", text: "text-blue-400", iconBg: "bg-blue-500/10" },
    violet: { bg: "bg-violet-500/5", text: "text-violet-400", iconBg: "bg-violet-500/10" },
  };
  const c = colorMap[color] || colorMap.accent;
  return (
    <div className={`${c.bg} border border-[#262626] rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#FAFAFA] uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>{count}</div>
    </div>
  );
}

function ContactDetailPanel({
  contact,
  onClose,
  onEdit,
}: {
  contact: Contact;
  onClose: () => void;
  onEdit: (c: Contact) => void;
}) {
  const [tab, setTab] = useState<"overview" | "invoices" | "activity">("overview");
  const getInvoicesForContact = useInvoicesStore((s) => s.getInvoicesForContact);
  const getContactName = useInvoicesStore((s) => s.getContactName);
  const contactInvoices = getInvoicesForContact(contact.id);

  const borderColor =
    contact.type === "customer"
      ? "border-l-emerald-400"
      : contact.type === "vendor"
      ? "border-l-blue-400"
      : "border-l-[#CDB49E]";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-lg bg-[#0A0A0A] border-l-4 ${borderColor} shadow-2xl shadow-black/40 animate-in slide-in-from-right duration-300 h-full overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0A] border-b border-[#262626] px-6 py-5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-[#FAFAFA]">
                  {contact.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#FAFAFA]">{contact.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {contact.company && (
                    <span className="text-sm text-[#FAFAFA]">{contact.company}</span>
                  )}
                  <TypeBadge type={contact.type} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(contact)}
                className="p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 mt-4">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAFAFA] hover:text-[#FAFAFA] border border-[#262626] rounded-lg hover:border-[#262626]/30 hover:bg-[rgba(156,74,41,0.15)]/30 transition-all duration-200"
              >
                <Mail className="w-3 h-3" />
                Email
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAFAFA] hover:text-[#FAFAFA] border border-[#262626] rounded-lg hover:border-[#262626]/30 hover:bg-[rgba(156,74,41,0.15)]/30 transition-all duration-200"
              >
                <Phone className="w-3 h-3" />
                Call
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 -mb-5 pb-0">
            {(["overview", "invoices", "activity"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ${
                  tab === t
                    ? "border-[#262626] text-[#FAFAFA] bg-[#0A0A0A]"
                    : "border-transparent text-[#FAFAFA] hover:text-[#FAFAFA]"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "invoices" && contactInvoices.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-[rgba(156,74,41,0.15)] text-[#FAFAFA] rounded-full">
                    {contactInvoices.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "Email", value: contact.email, icon: Mail },
                  { label: "Phone", value: contact.phone, icon: Phone },
                  { label: "Company", value: contact.company, icon: Package },
                  { label: "Address", value: contact.address, icon: ExternalLink },
                ].map(
                  (field) =>
                    field.value && (
                      <div key={field.label} className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <field.icon className="w-3.5 h-3.5 text-[#FAFAFA]" />
                          <span className="text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">{field.label}</span>
                        </div>
                        <p className="text-sm text-[#FAFAFA] pl-5.5">{field.value}</p>
                      </div>
                    )
                )}
                {contact.notes && (
                  <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[#FAFAFA]" />
                      <span className="text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Notes</span>
                    </div>
                    <p className="text-sm text-[#FAFAFA]">{contact.notes}</p>
                  </div>
                )}
                <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#FAFAFA]" />
                    <span className="text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Added</span>
                  </div>
                  <p className="text-sm text-[#FAFAFA]">{formatDate(contact.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "invoices" && (
            <div className="space-y-3">
              {contactInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-[#FAFAFA]/40" />
                  <p className="text-sm text-[#FAFAFA]">No invoices for this contact</p>
                </div>
              ) : (
                contactInvoices.map((inv) => {
                  const statusColor: Record<string, string> = {
                    paid: "text-emerald-400",
                    sent: "text-[#FAFAFA]",
                    overdue: "text-red-400",
                    draft: "text-[#FAFAFA]",
                    cancelled: "text-[#FAFAFA]",
                  };
                  return (
                    <div
                      key={inv.id}
                      className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 hover:border-[#262626]/25 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-mono font-medium text-[#FAFAFA]">{inv.invoice_number}</span>
                          <p className="text-xs text-[#FAFAFA] mt-0.5">{formatDate(inv.issue_date)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#FAFAFA]">{formatCurrency(inv.total)}</span>
                          <p className={`text-xs mt-0.5 capitalize ${statusColor[inv.status] || "text-[#FAFAFA]"}`}>
                            {inv.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "activity" && (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 mx-auto mb-3 text-[#FAFAFA]/40" />
              <p className="text-sm text-[#FAFAFA]">No activity yet</p>
              <p className="text-xs text-[#FAFAFA] mt-1">Activity will appear here once you interact with this contact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const {
    contacts,
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    addContact,
    updateContact,
    deleteContact,
    filteredContacts,
  } = useContactsStore();

  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filtered = filteredContacts();

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    return {
      total: contacts.length,
      customers: contacts.filter((c) => c.type === "customer" || c.type === "both").length,
      vendors: contacts.filter((c) => c.type === "vendor" || c.type === "both").length,
      recent: contacts.filter((c) => new Date(c.created_at) >= weekAgo).length,
    };
  }, [contacts]);

  // Existing emails for duplicate detection during import
  const existingEmails = useMemo(
    () => new Set(contacts.filter((c) => c.email).map((c) => c.email!.toLowerCase())),
    [contacts]
  );

  const handleImportComplete = async (data: Record<string, any>[]) => {
    let successCount = 0;
    for (const item of data) {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        org_id: "org1",
        name: item.name || "",
        email: item.email || undefined,
        phone: item.phone || undefined,
        company: item.company || undefined,
        type: item.type || "customer",
        address: item.address || undefined,
        notes: item.notes || undefined,
        created_at: new Date().toISOString(),
      };
      addContact(newContact);
      successCount++;
    }
    setImportOpen(false);
    addToast(`Successfully imported ${successCount} contact(s)`);
  };

  const handleAdd = (data: Omit<Contact, "id" | "org_id" | "created_at">) => {
    const newContact: Contact = {
      ...data,
      id: crypto.randomUUID(),
      org_id: "org1",
      created_at: new Date().toISOString(),
    };
    addContact(newContact);
    setModalOpen(false);
    addToast("Contact added successfully");
  };

  const handleEdit = (data: Omit<Contact, "id" | "org_id" | "created_at">) => {
    if (!editingContact) return;
    updateContact(editingContact.id, data);
    setEditingContact(null);
    addToast("Contact updated successfully");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteContact(id);
    if (selectedContact?.id === id) setSelectedContact(null);
    addToast("Contact deleted", "info");
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Type", "Address"];
    const rows = contacts.map((c) => [c.name, c.email || "", c.phone || "", c.company || "", c.type, c.address || ""]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    addToast("Contacts exported");
  };

  const handleContactClick = (c: Contact) => {
    setSelectedContact(c);
  };

  const handleEditFromPanel = (c: Contact) => {
    setSelectedContact(null);
    setEditingContact(c);
  };

  const borderColorForType = (type: string) => {
    if (type === "customer") return "border-l-emerald-400";
    if (type === "vendor") return "border-l-blue-400";
    return "border-l-[#CDB49E]";
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Contacts
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            {filtered.length} of {contacts.length} contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import/Export */}
          <div className="relative">
            <div className="flex items-center border border-[#262626] rounded-lg overflow-hidden">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <div className="w-px h-6 bg-[#0A0A0A]" />
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-200"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Contacts" count={stats.total} icon={Users} color="accent" />
        <StatCard label="Customers" count={stats.customers} icon={ShoppingCart} color="green" />
        <StatCard label="Vendors" count={stats.vendors} icon={Package} color="blue" />
        <StatCard label="Recently Added" count={stats.recent} icon={UserPlus} color="violet" />
      </div>

      {/* Search, Filters & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#262626]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#FAFAFA]" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#FAFAFA] placeholder:text-[#FAFAFA]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#FAFAFA] hover:text-[#FAFAFA]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.type
              ? "border-[#262626]/50 text-[#FAFAFA] bg-[rgba(156,74,41,0.15)]/50"
              : "border-[#262626] text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>

        {/* View toggle */}
        <div className="flex items-center border border-[#262626] rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA]"
                : "text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-[rgba(156,74,41,0.15)] text-[#FAFAFA]"
                : "text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            className="px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#262626]/50 transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="both">Both</option>
          </select>
        </div>
      )}

      {/* Grid/Card View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-[#FAFAFA] text-sm">
              <Users className="w-8 h-8 mx-auto mb-3 text-[#FAFAFA]/40" />
              No contacts found
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => handleContactClick(c)}
                className={`bg-[#0A0A0A] border border-[#262626] border-l-4 ${borderColorForType(c.type)} rounded-xl p-6 hover:border-[#262626]/25 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-[rgba(156,74,41,0.15)] flex items-center justify-center group-hover:bg-[#161616]/20 transition-colors duration-300">
                    <span className="text-sm font-bold text-[#FAFAFA]">
                      {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={c.type} />
                    <div className="hidden group-hover:flex items-center gap-1">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                          title="Email"
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      )}
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                          title="Call"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContact(c);
                        }}
                        className="p-1.5 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, c.id)}
                        className="p-1.5 rounded-lg text-[#FAFAFA] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-[#FAFAFA]">{c.name}</h3>
                <p className="text-xs text-[#FAFAFA] mt-0.5">{c.company || "—"}</p>
                <div className="mt-4 space-y-2 border-t border-[#262626] pt-4">
                  {c.email && (
                    <div className="flex items-center gap-2.5 text-xs text-[#FAFAFA]">
                      <Mail className="w-3 h-3 text-[#FAFAFA]/60" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-[#FAFAFA]">
                      <Phone className="w-3 h-3 text-[#FAFAFA]/60" />
                      {c.phone}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs text-[#FAFAFA] flex items-center gap-1">
                    View details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Name</th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Company</th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Email</th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Phone</th>
                <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest">Type</th>
                <th className="text-right px-6 py-4 text-[10px] font-semibold text-[#FAFAFA] uppercase tracking-widest w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#FAFAFA] text-sm">
                    <Users className="w-8 h-8 mx-auto mb-3 text-[#FAFAFA]/40" />
                    No contacts found
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => handleContactClick(c)}
                    className={`hover:bg-[#0A0A0A] transition-colors duration-150 cursor-pointer border-b border-[#262626]/50 last:border-0 ${
                      i % 2 === 1 ? "bg-[#0A0A0A]/40" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(156,74,41,0.15)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#FAFAFA]">
                            {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[#FAFAFA]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#FAFAFA]">{c.company || "—"}</td>
                    <td className="px-6 py-4 text-sm text-[#FAFAFA]">{c.email || "—"}</td>
                    <td className="px-6 py-4 text-sm text-[#FAFAFA]">{c.phone || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <TypeBadge type={c.type} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(c);
                          }}
                          className="p-2 rounded-lg text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[rgba(156,74,41,0.15)] transition-all duration-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, c.id)}
                          className="p-2 rounded-lg text-[#FAFAFA] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Detail Panel */}
      {selectedContact && (
        <ContactDetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={handleEditFromPanel}
        />
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Contact">
        <ContactForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingContact}
        onClose={() => setEditingContact(null)}
        title="Edit Contact"
      >
        <ContactForm
          contact={editingContact}
          onSubmit={handleEdit}
          onCancel={() => setEditingContact(null)}
        />
      </Modal>

      {/* Import Wizard */}
      {importOpen && (
        <ImportWizard
          target="contacts"
          onClose={() => setImportOpen(false)}
          onComplete={handleImportComplete}
          existingKeys={existingEmails}
        />
      )}
    </div>
  );
}
