"use client";

import { useState, useCallback } from "react";
import { 
  FormInput, Type, Mail, Phone, MessageSquare, CheckSquare, 
  Circle, List, Calendar, Upload, Star, Hash, ToggleLeft,
  ChevronDown, ChevronUp, GripVertical, Trash2, Plus, Copy,
  Settings2, Eye, X, Send, Sparkles, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS FORM BUILDER
   Contact forms, lead capture, custom field types
   ═══════════════════════════════════════════════════════════════════════════ */

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "number" | "date" | "file" | "rating" | "toggle";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, checkbox, radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  width: "full" | "half";
}

export interface FormConfig {
  id: string;
  name: string;
  fields: FormField[];
  submitButton: {
    text: string;
    style: "filled" | "outline";
    color: string;
  };
  successMessage: string;
  redirectUrl?: string;
  notifyEmail?: string;
  styles: {
    labelColor: string;
    inputBg: string;
    inputBorder: string;
    inputText: string;
    borderRadius: string;
  };
}

interface FormBuilderProps {
  config: FormConfig;
  onChange: (config: FormConfig) => void;
  onClose?: () => void;
}

// Field type definitions
const FIELD_TYPES = [
  { id: "text", name: "Text", icon: Type, desc: "Single line text" },
  { id: "email", name: "Email", icon: Mail, desc: "Email address" },
  { id: "phone", name: "Phone", icon: Phone, desc: "Phone number" },
  { id: "textarea", name: "Text Area", icon: MessageSquare, desc: "Multi-line text" },
  { id: "select", name: "Dropdown", icon: ChevronDown, desc: "Select from options" },
  { id: "checkbox", name: "Checkboxes", icon: CheckSquare, desc: "Multiple choice" },
  { id: "radio", name: "Radio", icon: Circle, desc: "Single choice" },
  { id: "number", name: "Number", icon: Hash, desc: "Numeric input" },
  { id: "date", name: "Date", icon: Calendar, desc: "Date picker" },
  { id: "file", name: "File Upload", icon: Upload, desc: "Upload files" },
  { id: "rating", name: "Rating", icon: Star, desc: "Star rating" },
  { id: "toggle", name: "Toggle", icon: ToggleLeft, desc: "On/Off switch" },
];

// Pre-built form templates
const FORM_TEMPLATES = [
  {
    name: "Contact Form",
    fields: [
      { type: "text", label: "Full Name", placeholder: "John Doe", required: true, width: "full" },
      { type: "email", label: "Email", placeholder: "john@example.com", required: true, width: "half" },
      { type: "phone", label: "Phone", placeholder: "+1 (555) 123-4567", required: false, width: "half" },
      { type: "textarea", label: "Message", placeholder: "How can we help you?", required: true, width: "full" },
    ],
    submitText: "Send Message",
  },
  {
    name: "Lead Capture",
    fields: [
      { type: "text", label: "Name", placeholder: "Your name", required: true, width: "half" },
      { type: "email", label: "Work Email", placeholder: "you@company.com", required: true, width: "half" },
      { type: "text", label: "Company", placeholder: "Company name", required: false, width: "half" },
      { type: "select", label: "Company Size", required: true, width: "half", options: ["1-10", "11-50", "51-200", "201-500", "500+"] },
    ],
    submitText: "Get Started",
  },
  {
    name: "Newsletter",
    fields: [
      { type: "email", label: "Email Address", placeholder: "you@example.com", required: true, width: "full" },
      { type: "checkbox", label: "Interests", required: false, width: "full", options: ["Product Updates", "Industry News", "Tips & Tutorials"] },
    ],
    submitText: "Subscribe",
  },
  {
    name: "Feedback",
    fields: [
      { type: "rating", label: "How would you rate your experience?", required: true, width: "full" },
      { type: "radio", label: "Would you recommend us?", required: true, width: "full", options: ["Definitely", "Probably", "Not sure", "No"] },
      { type: "textarea", label: "Additional Comments", placeholder: "Tell us more...", required: false, width: "full" },
    ],
    submitText: "Submit Feedback",
  },
  {
    name: "Event Registration",
    fields: [
      { type: "text", label: "Full Name", placeholder: "Your name", required: true, width: "half" },
      { type: "email", label: "Email", placeholder: "you@example.com", required: true, width: "half" },
      { type: "phone", label: "Phone", placeholder: "+1 (555) 123-4567", required: false, width: "half" },
      { type: "select", label: "Session", required: true, width: "half", options: ["Morning (9AM)", "Afternoon (2PM)", "Evening (6PM)"] },
      { type: "checkbox", label: "Dietary Requirements", required: false, width: "full", options: ["Vegetarian", "Vegan", "Gluten-free", "None"] },
    ],
    submitText: "Register Now",
  },
];

const defaultFormConfig: FormConfig = {
  id: "",
  name: "Contact Form",
  fields: [],
  submitButton: {
    text: "Submit",
    style: "filled",
    color: "#CDB49E",
  },
  successMessage: "Thank you! Your submission has been received.",
  styles: {
    labelColor: "#888888",
    inputBg: "#0a0a0a",
    inputBorder: "#333333",
    inputText: "#ffffff",
    borderRadius: "10px",
  },
};

export function FormBuilder({ config = defaultFormConfig, onChange, onClose }: FormBuilderProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "preview">("fields");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(config.fields.length === 0);

  const selectedField = config.fields.find(f => f.id === selectedFieldId);

  // Add a new field
  const addField = useCallback((type: FormField["type"]) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: FIELD_TYPES.find(f => f.id === type)?.name || "Field",
      placeholder: "",
      required: false,
      width: "full",
      options: ["checkbox", "radio", "select"].includes(type) ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };
    onChange({ ...config, fields: [...config.fields, newField] });
    setSelectedFieldId(newField.id);
  }, [config, onChange]);

  // Update a field
  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    onChange({
      ...config,
      fields: config.fields.map(f => f.id === id ? { ...f, ...updates } : f),
    });
  }, [config, onChange]);

  // Delete a field
  const deleteField = useCallback((id: string) => {
    onChange({
      ...config,
      fields: config.fields.filter(f => f.id !== id),
    });
    if (selectedFieldId === id) setSelectedFieldId(null);
  }, [config, onChange, selectedFieldId]);

  // Duplicate a field
  const duplicateField = useCallback((id: string) => {
    const field = config.fields.find(f => f.id === id);
    if (!field) return;
    const newField = { ...field, id: `field-${Date.now()}`, label: `${field.label} (Copy)` };
    const index = config.fields.findIndex(f => f.id === id);
    const newFields = [...config.fields];
    newFields.splice(index + 1, 0, newField);
    onChange({ ...config, fields: newFields });
  }, [config, onChange]);

  // Reorder fields
  const reorderFields = useCallback((fromIndex: number, toIndex: number) => {
    const newFields = [...config.fields];
    const [moved] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, moved);
    onChange({ ...config, fields: newFields });
  }, [config, onChange]);

  // Apply template
  const applyTemplate = useCallback((template: typeof FORM_TEMPLATES[0]) => {
    const fields: FormField[] = template.fields.map((f, i) => ({
      id: `field-${Date.now()}-${i}`,
      type: f.type as FormField["type"],
      label: f.label,
      placeholder: f.placeholder || "",
      required: f.required,
      width: f.width as "full" | "half",
      options: f.options,
    }));
    onChange({
      ...config,
      name: template.name,
      fields,
      submitButton: { ...config.submitButton, text: template.submitText },
    });
    setShowTemplates(false);
  }, [config, onChange]);

  // Render field preview
  const renderFieldPreview = (field: FormField) => {
    const commonStyles = {
      backgroundColor: config.styles.inputBg,
      border: `1px solid ${config.styles.inputBorder}`,
      color: config.styles.inputText,
      borderRadius: config.styles.borderRadius,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={commonStyles}
          />
        );
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 text-sm resize-none focus:outline-none"
            style={commonStyles}
          />
        );
      case "select":
        return (
          <select className="w-full px-4 py-3 text-sm focus:outline-none" style={commonStyles}>
            <option value="">Select an option...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#CDB49E]" />
                <span style={{ color: config.styles.inputText }}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name={field.id} className="w-4 h-4 accent-[#CDB49E]" />
                <span style={{ color: config.styles.inputText }}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case "date":
        return (
          <input
            type="date"
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={commonStyles}
          />
        );
      case "file":
        return (
          <div
            className="w-full px-4 py-8 text-center border-2 border-dashed"
            style={{ ...commonStyles, borderStyle: "dashed" }}
          >
            <Upload className="w-6 h-6 mx-auto mb-2 text-[#666]" />
            <span className="text-sm text-[#888]">Click or drag to upload</span>
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={cn("w-8 h-8 cursor-pointer", i <= 3 ? "text-amber-400 fill-amber-400" : "text-[#333]")}
              />
            ))}
          </div>
        );
      case "toggle":
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-12 h-6 bg-[#333] rounded-full">
              <div className="absolute left-1 top-1 w-4 h-4 bg-[#CDB49E] rounded-full transition-transform" />
            </div>
            <span className="text-sm" style={{ color: config.styles.inputText }}>
              {field.placeholder || "Enable"}
            </span>
          </label>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <FormInput className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Form Builder</h3>
            <p className="text-xs text-[#666]">{config.fields.length} fields</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-[#666] hover:text-white rounded-lg hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="p-4 border-b border-[#222] bg-[#0a0a0a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CDB49E]" />
              <span className="text-sm font-medium">Start from template</span>
            </div>
            <button onClick={() => setShowTemplates(false)} className="text-xs text-[#888] hover:text-white">
              Skip →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FORM_TEMPLATES.map((template, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(template)}
                className="p-3 text-left rounded-lg border border-[#333] hover:border-[#CDB49E] transition-colors"
              >
                <div className="text-xs font-medium">{template.name}</div>
                <div className="text-[10px] text-[#666]">{template.fields.length} fields</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {[
          { id: "fields" as const, label: "Fields", icon: List },
          { id: "settings" as const, label: "Settings", icon: Settings2 },
          { id: "preview" as const, label: "Preview", icon: Eye },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
              activeTab === tab.id
                ? "text-[#CDB49E] border-b-2 border-[#CDB49E]"
                : "text-[#666] hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "fields" && (
          <div className="flex h-full">
            {/* Field Types */}
            <div className="w-1/3 border-r border-[#222] p-3 overflow-auto">
              <h4 className="text-xs font-semibold text-[#555] uppercase mb-2">Add Field</h4>
              <div className="space-y-1">
                {FIELD_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => addField(type.id as FormField["type"])}
                    className="w-full p-2 rounded-lg text-left hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-[#666] group-hover:text-[#CDB49E]" />
                      <span className="text-xs font-medium">{type.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field List */}
            <div className="flex-1 p-3 overflow-auto">
              {config.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FormInput className="w-12 h-12 text-[#333] mb-3" />
                  <p className="text-sm text-[#666]">No fields yet</p>
                  <p className="text-xs text-[#555]">Add fields from the left panel</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {config.fields.map((field, index) => {
                    const FieldIcon = FIELD_TYPES.find(t => t.id === field.type)?.icon || Type;
                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragIndex !== null && dragIndex !== index) {
                            reorderFields(dragIndex, index);
                          }
                          setDragIndex(null);
                        }}
                        onClick={() => setSelectedFieldId(field.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer",
                          selectedFieldId === field.id
                            ? "border-[#CDB49E] bg-[#CDB49E]/5"
                            : "border-[#333] hover:border-[#444]"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-[#444] cursor-grab mt-0.5" />
                          <FieldIcon className="w-4 h-4 text-[#666] mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {field.label}
                              {field.required && <span className="text-red-400 ml-1">*</span>}
                            </div>
                            <div className="text-[10px] text-[#555] flex items-center gap-2">
                              <span className="capitalize">{field.type}</span>
                              <span>•</span>
                              <span>{field.width === "half" ? "Half width" : "Full width"}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                              className="p-1 text-[#555] hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                              className="p-1 text-[#555] hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Field Settings */}
            {selectedField && (
              <div className="w-1/3 border-l border-[#222] p-3 overflow-auto">
                <h4 className="text-xs font-semibold text-[#555] uppercase mb-3">Field Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-[#666] mb-1 block">Label</label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#666] mb-1 block">Placeholder</label>
                    <input
                      type="text"
                      value={selectedField.placeholder || ""}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                      className="w-4 h-4 accent-[#CDB49E]"
                    />
                    <span className="text-sm">Required field</span>
                  </label>
                  <div>
                    <label className="text-[10px] text-[#666] mb-1 block">Width</label>
                    <div className="flex gap-2">
                      {(["full", "half"] as const).map(w => (
                        <button
                          key={w}
                          onClick={() => updateField(selectedField.id, { width: w })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-xs capitalize border",
                            selectedField.width === w
                              ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                              : "border-[#333] text-[#888]"
                          )}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                  {["select", "checkbox", "radio"].includes(selectedField.type) && (
                    <div>
                      <label className="text-[10px] text-[#666] mb-1 block">Options</label>
                      <div className="space-y-2">
                        {(selectedField.options || []).map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...(selectedField.options || [])];
                                newOptions[i] = e.target.value;
                                updateField(selectedField.id, { options: newOptions });
                              }}
                              className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                const newOptions = (selectedField.options || []).filter((_, j) => j !== i);
                                updateField(selectedField.id, { options: newOptions });
                              }}
                              className="p-2 text-[#555] hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                            updateField(selectedField.id, { options: newOptions });
                          }}
                          className="w-full py-2 border border-dashed border-[#333] rounded-lg text-xs text-[#888] hover:border-[#444] flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-4 space-y-6">
            {/* Form Name */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Form Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => onChange({ ...config, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm"
              />
            </div>

            {/* Submit Button */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Submit Button</label>
              <input
                type="text"
                value={config.submitButton.text}
                onChange={(e) => onChange({ ...config, submitButton: { ...config.submitButton, text: e.target.value } })}
                placeholder="Button text..."
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm mb-2"
              />
              <div className="flex gap-2">
                {(["filled", "outline"] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => onChange({ ...config, submitButton: { ...config.submitButton, style } })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs capitalize border",
                      config.submitButton.style === style
                        ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                        : "border-[#333] text-[#888]"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={config.submitButton.color}
                  onChange={(e) => onChange({ ...config, submitButton: { ...config.submitButton, color: e.target.value } })}
                  className="w-10 h-10 rounded-lg border border-[#333] bg-transparent cursor-pointer"
                />
                <span className="text-xs text-[#888]">Button Color</span>
              </div>
            </div>

            {/* Success Message */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Success Message</label>
              <textarea
                value={config.successMessage}
                onChange={(e) => onChange({ ...config, successMessage: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm resize-none"
              />
            </div>

            {/* Notification Email */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Notification Email</label>
              <input
                type="email"
                value={config.notifyEmail || ""}
                onChange={(e) => onChange({ ...config, notifyEmail: e.target.value })}
                placeholder="Receive submissions at..."
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm"
              />
            </div>

            {/* Style Settings */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-3 block">Form Styles</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(config.styles).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-[10px] text-[#666] mb-1 block capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                    {key === "borderRadius" ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange({ ...config, styles: { ...config.styles, [key]: e.target.value } })}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => onChange({ ...config, styles: { ...config.styles, [key]: e.target.value } })}
                          className="w-10 h-10 rounded-lg border border-[#333] bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => onChange({ ...config, styles: { ...config.styles, [key]: e.target.value } })}
                          className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="p-6">
            <div className="max-w-lg mx-auto p-6 rounded-2xl" style={{ backgroundColor: "#0a0a0a", border: "1px solid #222" }}>
              <h3 className="text-xl font-semibold text-white mb-6">{config.name}</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap -mx-2">
                  {config.fields.map(field => (
                    <div
                      key={field.id}
                      className={cn("px-2 mb-4", field.width === "half" ? "w-1/2" : "w-full")}
                    >
                      <label
                        className="text-sm mb-2 block"
                        style={{ color: config.styles.labelColor }}
                      >
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {renderFieldPreview(field)}
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-3 font-semibold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: config.submitButton.style === "filled" ? config.submitButton.color : "transparent",
                    color: config.submitButton.style === "filled" ? "#111" : config.submitButton.color,
                    border: config.submitButton.style === "outline" ? `2px solid ${config.submitButton.color}` : "none",
                    borderRadius: config.styles.borderRadius,
                  }}
                >
                  <Send className="w-4 h-4" /> {config.submitButton.text}
                </button>
              </div>
            </div>

            {/* Success Preview */}
            <div className="max-w-lg mx-auto mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-emerald-300">{config.successMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormBuilder;
