import { NextResponse } from "next/server";
import { db } from "@/db";
import { sales } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const saleId = parseInt(id);
    const body = await request.json();

    const updatedSale = await db.update(sales).set({
      contractStatus: body.contractStatus,
      contractDocumentUrl: body.contractDocumentUrl,
    }).where(eq(sales.id, saleId)).returning();

    await logActivity({
      action: "Contract Status Updated",
      entityType: "sale",
      entityId: saleId,
      entityName: updatedSale[0]?.unitNumber || "Contract",
      newValue: body.contractStatus,
      details: `Updated sales contract status to ${body.contractStatus}`,
    });

    return NextResponse.json({ success: true, sale: updatedSale[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
