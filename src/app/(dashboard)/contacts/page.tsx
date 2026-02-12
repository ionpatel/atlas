"use client";

import { useState } from "react";
import { Plus, Search, Filter, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { useContactsStore } from "@/stores/contacts-store";
import { Modal } from "@/components/ui/modal";
import { ContactForm } from "@/components/modules/contact-form";
import { useToastStore } from "@/components/ui/toast";
import type { Contact } from "@/types";

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    vendor: "bg-purple-500/10 text-purple-500",
    customer: "bg-blue-500/10 text-blue-500",
    both: "bg-amber-500/10 text-amber-500",
  };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[type]}`}>{label}</span>;
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

  const filtered = filteredContacts();

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
    addToast("Contact deleted", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {contacts.length} contacts
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showFilters || filters.type
              ? "border-primary text-primary bg-primary/5"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="both">Both</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
            No contacts found
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setEditingContact(c)}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{c.name[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={c.type} />
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingContact(c);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, c.id)}
                      className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-sm">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{c.company || "—"}</p>
              <div className="mt-3 space-y-1.5">
                {c.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {c.email}
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {c.phone}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}
