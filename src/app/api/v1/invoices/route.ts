import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

const DEMO_INVOICES = [
  { id: "1", number: "INV-2026-001", customer_name: "Maple Tech Inc.", status: "paid", subtotal: 2450.00, tax: 318.50, total: 2768.50, due_date: "2026-02-28", paid_date: "2026-02-15", items: [{ product: "Widget Pro X", quantity: 50, unit_price: 49.00 }] },
  { id: "2", number: "INV-2026-002", customer_name: "Bay Street Solutions", status: "sent", subtotal: 1800.00, tax: 234.00, total: 2034.00, due_date: "2026-03-15", paid_date: null, items: [{ product: "Laptop Stand", quantity: 30, unit_price: 60.00 }] },
  { id: "3", number: "INV-2026-003", customer_name: "Pacific Retail Group", status: "overdue", subtotal: 3200.00, tax: 416.00, total: 3616.00, due_date: "2026-01-31", paid_date: null, items: [{ product: "Keyboard Mechanical", quantity: 32, unit_price: 100.00 }] },
  { id: "4", number: "INV-2026-004", customer_name: "Toronto Digital", status: "draft", subtotal: 950.00, tax: 123.50, total: 1073.50, due_date: "2026-03-30", paid_date: null, items: [{ product: "Screen Protector Ultra", quantity: 100, unit_price: 9.50 }] },
  { id: "5", number: "INV-2026-005", customer_name: "Ottawa Tech Hub", status: "paid", subtotal: 5400.00, tax: 702.00, total: 6102.00, due_date: "2026-02-20", paid_date: "2026-02-18", items: [{ product: "Webcam HD 1080p", quantity: 60, unit_price: 90.00 }] },
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const status = searchParams.get("status") || "";
  const offset = (page - 1) * limit;

  if (!isSupabaseConfigured()) {
    let filtered = [...DEMO_INVOICES];
    if (status) filtered = filtered.filter(i => i.status === status);
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    return NextResponse.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }, { headers: CORS });
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("invoices").select("*, invoice_items(*)", { count: "exact" });
    if (status) query = query.eq("status", status);
    const { data, error, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return NextResponse.json({ data: data || [], meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } }, { headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const body = await request.json();
    const number = `INV-2026-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`;
    return NextResponse.json({ data: { id: crypto.randomUUID(), number, status: "draft", ...body, created_at: new Date().toISOString() } }, { status: 201, headers: CORS });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { items, ...invoiceData } = body;
    
    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase.from("invoices").insert(invoiceData).select().single();
    if (invoiceError) throw invoiceError;

    // Create line items
    if (items?.length) {
      const lineItems = items.map((item: any) => ({ ...item, invoice_id: invoice.id }));
      const { error: itemsError } = await supabase.from("invoice_items").insert(lineItems);
      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ data: { ...invoice, items } }, { status: 201, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
