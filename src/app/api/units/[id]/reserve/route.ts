import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, reservations, customers, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity, createNotification } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unitId = parseInt(id);
    const body = await request.json();

    const {
      customerId,
      customerName,
      agentId,
      agentName,
      reservationAmount,
      expiryDate,
      notes,
      documentUrl,
    } = body;

    const targetUnit = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    if (!targetUnit || targetUnit.length === 0) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
    }

    const currentUnit = targetUnit[0];

    if (currentUnit.status === "Sold") {
      return NextResponse.json({ success: false, error: "Sold units cannot be reserved." }, { status: 400 });
    }

    const project = await db.select().from(projects).where(eq(projects.id, currentUnit.projectId)).limit(1);
    const projectName = project[0]?.name || "Value 9 Mall";

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Create reservation
    const newReservation = await db.insert(reservations).values({
      customerId: parseInt(customerId),
      customerName: customerName || "Customer",
      unitId,
      unitNumber: currentUnit.unitNumber,
      projectId: currentUnit.projectId,
      projectName,
      agentId: agentId ? parseInt(agentId) : currentUnit.assignedAgentId,
      agentName: agentName || "Sales Agent",
      reservationDate: todayStr,
      reservationAmount: reservationAmount.toString(),
      expiryDate: expiryDate || "2025-06-30",
      status: "Active",
      notes: notes || "Unit reserved via CRM",
      documentUrl: documentUrl || "",
    }).returning();

    // 2. Automatically update unit status to Reserved & assign current customer
    await db.update(units).set({
      status: "Reserved",
      currentCustomerId: parseInt(customerId),
      updatedAt: new Date(),
    }).where(eq(units.id, unitId));

    // 3. Log Activity & Notification
    await logActivity({
      action: "Unit Reserved",
      entityType: "reservation",
      entityId: newReservation[0].id,
      entityName: currentUnit.unitNumber,
      oldValue: currentUnit.status,
      newValue: "Reserved",
      details: `Unit ${currentUnit.unitNumber} reserved by ${customerName} (Deposit: ${parseFloat(reservationAmount).toLocaleString()} EGP)`,
    });

    await createNotification({
      title: `Unit ${currentUnit.unitNumber} Reserved`,
      message: `Reserved by ${customerName} with deposit EGP ${parseFloat(reservationAmount).toLocaleString()}`,
      type: "reservation",
      link: `/units/${unitId}`,
    });

    return NextResponse.json({ success: true, reservation: newReservation[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
