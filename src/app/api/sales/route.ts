import { NextResponse } from "next/server";
import { db } from "@/db";
import { sales } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractStatus = searchParams.get("contractStatus");
    const search = searchParams.get("search");

    const allSales = await db.select().from(sales).orderBy(desc(sales.createdAt));

    let filtered = allSales;
    if (contractStatus && contractStatus !== "all") {
      filtered = filtered.filter(s => s.contractStatus === contractStatus);
    }
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(s =>
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        (s.unitNumber && s.unitNumber.toLowerCase().includes(q)) ||
        (s.projectName && s.projectName.toLowerCase().includes(q)) ||
        (s.agentName && s.agentName.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, sales: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
