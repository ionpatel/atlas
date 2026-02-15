import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

const DEMO_ORDERS = [
  { id: "1", number: "SO-2026-001", customer_name: "Maple Tech Inc.", status: "confirmed", subtotal: 2450.00, tax: 318.50, total: 2768.50, items: [{ product: "Widget Pro X", quantity: 50, unit_price: 49.00 }], created_at: "2026-02-10T10:00:00Z" },
  { id: "2", number: "SO-2026-002", customer_name: "Bay Street Solutions", status: "draft", subtotal: 1200.00, tax: 156.00, total: 1356.00, items: [{ product: "Cable USB-C 2m", quantity: 80, unit_price: 15.00 }], created_at: "2026-02-12T14:30:00Z" },
  { id: "3", number: "SO-2026-003", customer_name: "Pacific Retail Group", status: "invoiced", subtotal: 3999.00, tax: 519.87, total: 4518.87, items: [{ product: "Wireless Mouse Pro", quantity: 100, unit_price: 39.99 }], created_at: "2026-02-08T09:15:00Z" },
  { id: "4", number: "SO-2026-004", customer_name: "Ottawa Tech Hub", status: "confirmed", subtotal: 7996.00, tax: 1039.48, total: 9035.48, items: [{ product: "Keyboard Mechanical", quantity: 80, unit_price: 99.95 }], created_at: "2026-02-14T11:00:00Z" },
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
    let filtered = [...DEMO_ORDERS];
    if (status) filtered = filtered.filter(o => o.status === status);
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    return NextResponse.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }, { headers: CORS });
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("sales_orders").select("*, sales_order_items(*)", { count: "exact" });
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
    const number = `SO-2026-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`;
    return NextResponse.json({ data: { id: crypto.randomUUID(), number, status: "draft", ...body, created_at: new Date().toISOString() } }, { status: 201, headers: CORS });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { items, ...orderData } = body;
    const { data: order, error } = await supabase.from("sales_orders").insert(orderData).select().single();
    if (error) throw error;
    if (items?.length) {
      const lineItems = items.map((item: any) => ({ ...item, order_id: order.id }));
      await supabase.from("sales_order_items").insert(lineItems);
    }
    return NextResponse.json({ data: { ...order, items } }, { status: 201, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
