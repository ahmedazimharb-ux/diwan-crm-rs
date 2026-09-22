import { NextResponse } from "next/server";
import { db } from "@/db";
import { reservations, units, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { logActivity, createNotification } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const allReservations = await db.select().from(reservations).orderBy(desc(reservations.createdAt));

    let filtered = allReservations;
    if (status && status !== "all") {
      filtered = filtered.filter(r => r.status === status);
    }
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(r =>
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.unitNumber && r.unitNumber.toLowerCase().includes(q)) ||
        (r.projectName && r.projectName.toLowerCase().includes(q)) ||
        (r.agentName && r.agentName.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, reservations: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const unit = await db.select().from(units).where(eq(units.id, parseInt(body.unitId))).limit(1);
    if (!unit || unit.length === 0) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
    }

    const currentUnit = unit[0];

    const project = await db.select().from(projects).where(eq(projects.id, currentUnit.projectId)).limit(1);

    const newRes = await db.insert(reservations).values({
      customerId: parseInt(body.customerId),
      customerName: body.customerName,
      unitId: parseInt(body.unitId),
      unitNumber: currentUnit.unitNumber,
      projectId: currentUnit.projectId,
      projectName: project[0]?.name || "Value 9 Mall",
      agentId: body.agentId ? parseInt(body.agentId) : currentUnit.assignedAgentId,
      agentName: body.agentName || "Sales Agent",
      reservationDate: body.reservationDate || new Date().toISOString().split("T")[0],
      reservationAmount: body.reservationAmount.toString(),
      expiryDate: body.expiryDate,
      status: body.status || "Active",
      notes: body.notes || "",
      documentUrl: body.documentUrl || "",
    }).returning();

    // Automatically set unit status to Reserved
    await db.update(units).set({
      status: "Reserved",
      currentCustomerId: parseInt(body.customerId),
      updatedAt: new Date(),
    }).where(eq(units.id, parseInt(body.unitId)));

    await logActivity({
      action: "Reservation Created",
      entityType: "reservation",
      entityId: newRes[0].id,
      entityName: currentUnit.unitNumber,
      newValue: "Reserved",
      details: `Unit ${currentUnit.unitNumber} reserved by ${body.customerName}`,
    });

    return NextResponse.json({ success: true, reservation: newRes[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
