import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

// Demo data for when Supabase is not configured
const DEMO_PRODUCTS = [
  { id: "1", name: "Widget Pro X", sku: "WPX-001", barcode: "7891234560001", category: "Electronics", cost_price: 25.00, sell_price: 49.99, stock_quantity: 3, unit: "pcs", is_active: true },
  { id: "2", name: "Cable USB-C 2m", sku: "CUSBC-2M", barcode: "7891234560002", category: "Accessories", cost_price: 5.00, sell_price: 14.99, stock_quantity: 8, unit: "pcs", is_active: true },
  { id: "3", name: "Laptop Stand Adjustable", sku: "LSA-100", barcode: "7891234560003", category: "Accessories", cost_price: 18.00, sell_price: 39.99, stock_quantity: 45, unit: "pcs", is_active: true },
  { id: "4", name: "Wireless Mouse Pro", sku: "WMP-200", barcode: "7891234560004", category: "Electronics", cost_price: 12.00, sell_price: 29.99, stock_quantity: 120, unit: "pcs", is_active: true },
  { id: "5", name: "Screen Protector Ultra", sku: "SPU-300", barcode: "7891234560005", category: "Accessories", cost_price: 2.00, sell_price: 9.99, stock_quantity: 12, unit: "pcs", is_active: true },
  { id: "6", name: "Desk Organizer Premium", sku: "DOP-400", barcode: "7891234560006", category: "Office", cost_price: 15.00, sell_price: 34.99, stock_quantity: 67, unit: "pcs", is_active: true },
  { id: "7", name: "Webcam HD 1080p", sku: "WHD-500", barcode: "7891234560007", category: "Electronics", cost_price: 35.00, sell_price: 79.99, stock_quantity: 28, unit: "pcs", is_active: true },
  { id: "8", name: "Keyboard Mechanical", sku: "KM-600", barcode: "7891234560008", category: "Electronics", cost_price: 45.00, sell_price: 99.99, stock_quantity: 55, unit: "pcs", is_active: true },
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const offset = (page - 1) * limit;

  if (!isSupabaseConfigured()) {
    let filtered = [...DEMO_PRODUCTS];
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    if (category) filtered = filtered.filter(p => p.category === category);
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, { headers: CORS });
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*", { count: "exact" });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    }, { headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const body = await request.json();
    return NextResponse.json({ data: { id: crypto.randomUUID(), ...body, created_at: new Date().toISOString() } }, { status: 201, headers: CORS });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
