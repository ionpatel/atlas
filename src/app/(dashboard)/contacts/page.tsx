"use client";

import { useState } from "react";
import { Plus, Search, Filter, Mail, Phone, Pencil, Trash2, Users, X } from "lucide-react";
import { useContactsStore } from "@/stores/contacts-store";
import { Modal } from "@/components/ui/modal";
import { ContactForm } from "@/components/modules/contact-form";
import { useToastStore } from "@/components/ui/toast";
import type { Contact } from "@/types";

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    vendor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    customer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    both: "bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20",
  };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[type]}`}>
      {label}
    </span>
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
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f5f0eb]">
            Contacts
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            {filtered.length} of {contacts.length} contacts
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 flex-1 max-w-md focus-within:border-[#CDB49E]/40 transition-colors duration-200">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#888888] hover:text-[#f5f0eb]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all duration-200 ${
            showFilters || filters.type
              ? "border-[#CDB49E]/50 text-[#CDB49E] bg-[#3a3028]/50"
              : "border-[#2a2a2a] text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3">
          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="both">Both</option>
          </select>
        </div>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[#888888] text-sm">
            <Users className="w-8 h-8 mx-auto mb-3 text-[#888888]/40" />
            No contacts found
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setEditingContact(c)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#CDB49E]/25 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-full bg-[#3a3028] flex items-center justify-center group-hover:bg-[#CDB49E]/20 transition-colors duration-300">
                  <span className="text-sm font-bold text-[#CDB49E]">{c.name[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={c.type} />
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingContact(c);
                      }}
                      className="p-1.5 rounded-lg text-[#888888] hover:text-[#CDB49E] hover:bg-[#3a3028] transition-all duration-200"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, c.id)}
                      className="p-1.5 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-[#f5f0eb]">{c.name}</h3>
              <p className="text-xs text-[#888888] mt-0.5">{c.company || "—"}</p>
              <div className="mt-4 space-y-2 border-t border-[#2a2a2a] pt-4">
                {c.email && (
                  <div className="flex items-center gap-2.5 text-xs text-[#888888] group-hover:text-[#888888]">
                    <Mail className="w-3 h-3 text-[#888888]/60" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2.5 text-xs text-[#888888]">
                    <Phone className="w-3 h-3 text-[#888888]/60" />
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
