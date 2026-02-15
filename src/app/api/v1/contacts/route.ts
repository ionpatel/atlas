import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

const DEMO_CONTACTS = [
  { id: "1", name: "Maple Tech Inc.", email: "info@mapletech.ca", phone: "+1 416-555-0101", type: "customer", company: "Maple Tech Inc.", city: "Toronto", province: "ON", country: "CA", total_revenue: 45200, notes: "Enterprise client, NET 30 terms" },
  { id: "2", name: "Northern Supplies Co.", email: "orders@northernsupplies.ca", phone: "+1 604-555-0202", type: "vendor", company: "Northern Supplies Co.", city: "Vancouver", province: "BC", country: "CA", total_revenue: 0, notes: "Primary hardware supplier" },
  { id: "3", name: "Bay Street Solutions", email: "procurement@baystreet.ca", phone: "+1 416-555-0303", type: "customer", company: "Bay Street Solutions", city: "Toronto", province: "ON", country: "CA", total_revenue: 32100, notes: "Monthly recurring orders" },
  { id: "4", name: "Pacific Retail Group", email: "buying@pacificretail.ca", phone: "+1 778-555-0404", type: "both", company: "Pacific Retail Group", city: "Richmond", province: "BC", country: "CA", total_revenue: 28750, notes: "Both customer and supplier" },
  { id: "5", name: "Ottawa Tech Hub", email: "hello@ottawatech.ca", phone: "+1 613-555-0505", type: "customer", company: "Ottawa Tech Hub", city: "Ottawa", province: "ON", country: "CA", total_revenue: 21800, notes: "Government contracts" },
  { id: "6", name: "Prairie Logistics Ltd.", email: "dispatch@prairielogistics.ca", phone: "+1 306-555-0606", type: "vendor", company: "Prairie Logistics Ltd.", city: "Saskatoon", province: "SK", country: "CA", total_revenue: 0, notes: "Shipping & fulfillment partner" },
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const offset = (page - 1) * limit;

  if (!isSupabaseConfigured()) {
    let filtered = [...DEMO_CONTACTS];
    if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
    if (type) filtered = filtered.filter(c => c.type === type);
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    return NextResponse.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }, { headers: CORS });
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("contacts").select("*", { count: "exact" });
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    if (type) query = query.eq("type", type);
    const { data, error, count } = await query.order("name").range(offset, offset + limit - 1);
    if (error) throw error;
    return NextResponse.json({ data: data || [], meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } }, { headers: CORS });
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
    const { data, error } = await supabase.from("contacts").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
