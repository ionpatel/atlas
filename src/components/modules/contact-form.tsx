"use client";

import { useState, useEffect } from "react";
import type { Contact } from "@/types";

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: Omit<Contact, "id" | "org_id" | "created_at">) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full px-4 py-2.5 bg-[#E6D4C7] border border-[#E6D4C7] rounded-lg text-sm text-[#273B3A] placeholder:text-[#273B3A]/50 focus:outline-none focus:ring-2 focus:ring-[#273B3A]/30 focus:border-[#273B3A]/50 transition-all duration-200";

const labelClass = "block text-sm font-medium text-[#273B3A] mb-2";

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    type: "customer" as Contact["type"],
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        type: contact.type,
        address: contact.address || "",
        notes: contact.notes || "",
      });
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className={inputClass}
            placeholder="Full name or business name"
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="(416) 555-0000"
          />
        </div>

        <div>
          <label className={labelClass}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className={inputClass}
            placeholder="Company name"
          />
        </div>

        <div>
          <label className={labelClass}>Type *</label>
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className={inputClass}
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
            placeholder="Street address, city"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Any additional notes..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6D4C7]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-[#273B3A] hover:text-[#273B3A] bg-[#E6D4C7] border border-[#E6D4C7] rounded-lg hover:bg-[#E6D4C7] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold bg-[#273B3A] text-[#E6D4C7] rounded-lg hover:bg-[#273B3A] transition-all duration-200"
        >
          {contact ? "Update Contact" : "Add Contact"}
        </button>
      </div>
    </form>
  );
}
