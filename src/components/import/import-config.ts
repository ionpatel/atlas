// Import field configurations for each target type

export type ImportTarget = "products" | "contacts" | "employees";

export interface FieldConfig {
  key: string;
  label: string;
  required: boolean;
  type: "string" | "number" | "email" | "phone" | "date" | "select";
  unique?: boolean;
  options?: string[];
  aliases?: string[]; // Alternative column names for auto-mapping
  validate?: (value: string) => string | null; // Returns error message or null
  transform?: (value: string) => any; // Transform value before import
}

export interface ImportTargetConfig {
  name: string;
  description: string;
  fields: FieldConfig[];
  uniqueKey: string; // Field used for duplicate detection
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;

export const IMPORT_CONFIGS: Record<ImportTarget, ImportTargetConfig> = {
  products: {
    name: "Products / Inventory",
    description: "Import products with SKU, pricing, and stock information",
    uniqueKey: "sku",
    fields: [
      {
        key: "name",
        label: "Product Name",
        required: true,
        type: "string",
        aliases: ["product", "product_name", "item", "item_name", "title"],
      },
      {
        key: "sku",
        label: "SKU",
        required: true,
        type: "string",
        unique: true,
        aliases: ["product_code", "code", "item_code", "part_number", "part_no"],
      },
      {
        key: "description",
        label: "Description",
        required: false,
        type: "string",
        aliases: ["desc", "product_description", "details"],
      },
      {
        key: "sell_price",
        label: "Sell Price",
        required: true,
        type: "number",
        aliases: ["price", "retail_price", "unit_price", "selling_price"],
        transform: (v) => parseFloat(v.replace(/[$,]/g, "")) || 0,
        validate: (v) => {
          const num = parseFloat(v.replace(/[$,]/g, ""));
          if (isNaN(num) || num < 0) return "Must be a valid positive number";
          return null;
        },
      },
      {
        key: "cost_price",
        label: "Cost Price",
        required: false,
        type: "number",
        aliases: ["cost", "purchase_price", "buy_price", "wholesale_price"],
        transform: (v) => parseFloat(v.replace(/[$,]/g, "")) || 0,
        validate: (v) => {
          if (!v) return null;
          const num = parseFloat(v.replace(/[$,]/g, ""));
          if (isNaN(num) || num < 0) return "Must be a valid positive number";
          return null;
        },
      },
      {
        key: "stock_quantity",
        label: "Stock Quantity",
        required: false,
        type: "number",
        aliases: ["stock", "qty", "quantity", "inventory", "on_hand", "available"],
        transform: (v) => parseInt(v) || 0,
        validate: (v) => {
          if (!v) return null;
          const num = parseInt(v);
          if (isNaN(num) || num < 0) return "Must be a valid positive integer";
          return null;
        },
      },
      {
        key: "min_quantity",
        label: "Minimum Quantity",
        required: false,
        type: "number",
        aliases: ["min_stock", "reorder_point", "min_level", "reorder_level"],
        transform: (v) => parseInt(v) || 0,
      },
      {
        key: "category",
        label: "Category",
        required: false,
        type: "string",
        aliases: ["product_category", "type", "group", "department"],
      },
      {
        key: "barcode",
        label: "Barcode",
        required: false,
        type: "string",
        aliases: ["upc", "ean", "gtin", "bar_code"],
      },
      {
        key: "unit",
        label: "Unit",
        required: false,
        type: "string",
        aliases: ["uom", "unit_of_measure", "units"],
        transform: (v) => v || "each",
      },
    ],
  },
  contacts: {
    name: "Contacts",
    description: "Import customers and vendors with contact information",
    uniqueKey: "email",
    fields: [
      {
        key: "name",
        label: "Contact Name",
        required: true,
        type: "string",
        aliases: ["contact", "full_name", "customer_name", "vendor_name", "client_name"],
      },
      {
        key: "email",
        label: "Email",
        required: false,
        type: "email",
        unique: true,
        aliases: ["email_address", "e-mail", "mail"],
        validate: (v) => {
          if (!v) return null;
          if (!emailRegex.test(v)) return "Invalid email format";
          return null;
        },
      },
      {
        key: "phone",
        label: "Phone",
        required: false,
        type: "phone",
        aliases: ["phone_number", "telephone", "tel", "mobile", "cell"],
        validate: (v) => {
          if (!v) return null;
          if (!phoneRegex.test(v)) return "Invalid phone format";
          return null;
        },
      },
      {
        key: "company",
        label: "Company",
        required: false,
        type: "string",
        aliases: ["company_name", "organization", "business", "org"],
      },
      {
        key: "type",
        label: "Type",
        required: true,
        type: "select",
        options: ["customer", "vendor", "both"],
        aliases: ["contact_type", "category", "role"],
        transform: (v) => {
          const lower = v?.toLowerCase() || "";
          if (lower.includes("vendor") || lower.includes("supplier")) return "vendor";
          if (lower.includes("both")) return "both";
          return "customer";
        },
      },
      {
        key: "address",
        label: "Address",
        required: false,
        type: "string",
        aliases: ["street", "street_address", "location", "full_address"],
      },
      {
        key: "notes",
        label: "Notes",
        required: false,
        type: "string",
        aliases: ["comments", "remarks", "description"],
      },
    ],
  },
  employees: {
    name: "Employees",
    description: "Import employee records with job details and contact info",
    uniqueKey: "email",
    fields: [
      {
        key: "name",
        label: "Full Name",
        required: true,
        type: "string",
        aliases: ["employee_name", "full_name", "employee"],
      },
      {
        key: "email",
        label: "Email",
        required: true,
        type: "email",
        unique: true,
        aliases: ["email_address", "e-mail", "work_email"],
        validate: (v) => {
          if (!v) return "Email is required";
          if (!emailRegex.test(v)) return "Invalid email format";
          return null;
        },
      },
      {
        key: "phone",
        label: "Phone",
        required: false,
        type: "phone",
        aliases: ["phone_number", "telephone", "mobile", "cell", "work_phone"],
        validate: (v) => {
          if (!v) return null;
          if (!phoneRegex.test(v)) return "Invalid phone format";
          return null;
        },
      },
      {
        key: "department",
        label: "Department",
        required: false,
        type: "string",
        aliases: ["dept", "division", "team"],
        transform: (v) => v || "General",
      },
      {
        key: "job_title",
        label: "Position / Job Title",
        required: false,
        type: "string",
        aliases: ["position", "title", "role", "designation"],
      },
      {
        key: "start_date",
        label: "Hire Date",
        required: false,
        type: "date",
        aliases: ["hire_date", "join_date", "joining_date", "start"],
        transform: (v) => {
          if (!v) return new Date().toISOString().split("T")[0];
          // Try to parse various date formats
          const date = new Date(v);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }
          return new Date().toISOString().split("T")[0];
        },
      },
      {
        key: "status",
        label: "Status",
        required: false,
        type: "select",
        options: ["active", "on_leave", "terminated"],
        aliases: ["employment_status", "employee_status"],
        transform: (v) => {
          const lower = v?.toLowerCase() || "";
          if (lower.includes("leave")) return "on_leave";
          if (lower.includes("terminated") || lower.includes("inactive")) return "terminated";
          return "active";
        },
      },
    ],
  },
};

export function getFieldAliases(field: FieldConfig): string[] {
  const aliases = [
    field.key,
    field.label.toLowerCase(),
    ...(field.aliases || []),
  ];
  return aliases.map((a) => a.toLowerCase().replace(/[_\-\s]/g, ""));
}

export function autoMapColumns(
  headers: string[],
  targetConfig: ImportTargetConfig
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  for (const field of targetConfig.fields) {
    const aliases = getFieldAliases(field);
    
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      
      const normalizedHeader = header.toLowerCase().replace(/[_\-\s]/g, "");
      
      if (aliases.includes(normalizedHeader)) {
        mapping[field.key] = header;
        usedHeaders.add(header);
        break;
      }
    }
  }

  return mapping;
}
