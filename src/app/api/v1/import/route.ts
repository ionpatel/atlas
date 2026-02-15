import { NextRequest, NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "products";
  
  try {
    const body = await request.json();
    const { data, column_mapping, options } = body;
    
    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Missing or invalid 'data' array" },
        { status: 400, headers: CORS }
      );
    }

    // Validate data
    const results = {
      type,
      total: data.length,
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; field: string; message: string }[],
    };

    // Simulate validation
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (type === "products") {
        if (!row.name) {
          results.errors.push({ row: i + 1, field: "name", message: "Product name is required" });
          results.skipped++;
          continue;
        }
        if (row.sell_price && isNaN(Number(row.sell_price))) {
          results.errors.push({ row: i + 1, field: "sell_price", message: "Invalid price format" });
          results.skipped++;
          continue;
        }
      } else if (type === "contacts") {
        if (!row.name && !row.company) {
          results.errors.push({ row: i + 1, field: "name", message: "Name or company is required" });
          results.skipped++;
          continue;
        }
        if (row.email && !row.email.includes("@")) {
          results.errors.push({ row: i + 1, field: "email", message: "Invalid email format" });
          results.skipped++;
          continue;
        }
      } else if (type === "employees") {
        if (!row.name) {
          results.errors.push({ row: i + 1, field: "name", message: "Employee name is required" });
          results.skipped++;
          continue;
        }
      }
      
      results.imported++;
    }

    return NextResponse.json({
      data: results,
      message: `Import completed: ${results.imported} ${type} imported, ${results.skipped} skipped`,
    }, { 
      status: results.errors.length > 0 ? 207 : 200,
      headers: CORS 
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid request body: " + err.message },
      { status: 400, headers: CORS }
    );
  }
}
