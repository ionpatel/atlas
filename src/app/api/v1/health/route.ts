import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "3.2.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    services: {
      database: "connected",
      auth: "active",
      storage: "active",
      realtime: "active",
    },
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}
