import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

// In-memory webhook store for demo mode
const demoWebhooks = [
  { id: "1", url: "https://hooks.slack.com/services/xxx", events: ["invoice.paid", "order.created"], active: true, created_at: "2026-02-10T10:00:00Z", deliveries: 47, last_delivery: "2026-02-15T04:30:00Z" },
  { id: "2", url: "https://api.zapier.com/hooks/catch/xxx", events: ["stock.low", "contact.created"], active: true, created_at: "2026-02-12T14:00:00Z", deliveries: 12, last_delivery: "2026-02-14T22:15:00Z" },
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  return NextResponse.json({
    data: demoWebhooks,
    meta: { total: demoWebhooks.length },
    available_events: [
      "invoice.created", "invoice.sent", "invoice.paid", "invoice.overdue",
      "order.created", "order.confirmed", "order.invoiced",
      "contact.created", "contact.updated",
      "product.created", "product.updated",
      "stock.low", "stock.out",
      "payment.received", "payment.failed",
      "employee.created", "payroll.processed",
    ],
  }, { headers: CORS });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const webhook = {
    id: crypto.randomUUID(),
    url: body.url,
    events: body.events || [],
    active: true,
    created_at: new Date().toISOString(),
    deliveries: 0,
    last_delivery: null,
  };
  return NextResponse.json({ data: webhook }, { status: 201, headers: CORS });
}
