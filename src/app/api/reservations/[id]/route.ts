import { NextResponse } from "next/server";
import { db } from "@/db";
import { reservations, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resId = parseInt(id);
    const body = await request.json();

    const existingRes = await db.select().from(reservations).where(eq(reservations.id, resId)).limit(1);
    if (!existingRes || existingRes.length === 0) {
      return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
    }

    const resItem = existingRes[0];
    const newStatus = body.status;

    const updatedRes = await db.update(reservations).set({
      status: newStatus,
      notes: body.notes !== undefined ? body.notes : resItem.notes,
    }).where(eq(reservations.id, resId)).returning();

    // Business Logic: If reservation expires or gets cancelled, release unit back to Available!
    if (newStatus === "Expired" || newStatus === "Cancelled") {
      await db.update(units).set({
        status: "Available",
        currentCustomerId: null,
        updatedAt: new Date(),
      }).where(eq(units.id, resItem.unitId));

      await logActivity({
        action: `Reservation ${newStatus}`,
        entityType: "unit",
        entityId: resItem.unitId,
        entityName: resItem.unitNumber || "Unit",
        oldValue: "Reserved",
        newValue: "Available",
        details: `Unit ${resItem.unitNumber} returned to Available status because reservation was ${newStatus}.`,
      });
    }

    return NextResponse.json({ success: true, reservation: updatedRes[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
