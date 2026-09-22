import { NextResponse } from "next/server";
import { db } from "@/db";
import { commissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commId = parseInt(id);
    const body = await request.json();

    const { paymentStatus, notes } = body;

    const todayStr = new Date().toISOString().split("T")[0];

    const updated = await db.update(commissions).set({
      paymentStatus,
      paidDate: paymentStatus === "Paid" ? todayStr : undefined,
      notes: notes,
    }).where(eq(commissions.id, commId)).returning();

    await logActivity({
      action: "Commission Status Updated",
      entityType: "commission",
      entityId: commId,
      entityName: `Commission #${commId}`,
      newValue: paymentStatus,
      details: `Updated commission #${commId} status to ${paymentStatus}`,
    });

    return NextResponse.json({ success: true, commission: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
