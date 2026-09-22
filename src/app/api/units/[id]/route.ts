import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, projects, priceHistory, reservations, sales, customers, users, paymentPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logActivity, createNotification } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unitId = parseInt(id);

    const unit = await db.select().from(units).where(eq(units.id, unitId)).limit(1);

    if (!unit || unit.length === 0) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
    }

    const currentUnit = unit[0];

    const project = await db.select().from(projects).where(eq(projects.id, currentUnit.projectId)).limit(1);
    const history = await db.select().from(priceHistory).where(eq(priceHistory.unitId, unitId)).orderBy(desc(priceHistory.createdAt));
    const reservationList = await db.select().from(reservations).where(eq(reservations.unitId, unitId)).orderBy(desc(reservations.createdAt));
    const saleList = await db.select().from(sales).where(eq(sales.unitId, unitId)).orderBy(desc(sales.createdAt));
    const plan = currentUnit.paymentPlanId ? await db.select().from(paymentPlans).where(eq(paymentPlans.id, currentUnit.paymentPlanId)).limit(1) : [];
    const agent = currentUnit.assignedAgentId ? await db.select().from(users).where(eq(users.id, currentUnit.assignedAgentId)).limit(1) : [];
    const customer = currentUnit.currentCustomerId ? await db.select().from(customers).where(eq(customers.id, currentUnit.currentCustomerId)).limit(1) : [];

    return NextResponse.json({
      success: true,
      unit: {
        ...currentUnit,
        projectName: project[0]?.name || "Value 9 Mall",
        paymentPlan: plan[0] || null,
        agent: agent[0] || null,
        customer: customer[0] || null,
      },
      priceHistory: history,
      reservations: reservationList,
      sales: saleList,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unitId = parseInt(id);
    const body = await request.json();

    const existingUnit = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    if (!existingUnit || existingUnit.length === 0) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
    }

    const oldStatus = existingUnit[0].status;
    const newStatus = body.status || oldStatus;

    const updated = await db.update(units).set({
      unitNumber: body.unitNumber,
      floor: body.floor,
      unitType: body.unitType,
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : undefined,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : undefined,
      area: body.area,
      gardenArea: body.gardenArea,
      terraceArea: body.terraceArea,
      view: body.view,
      orientation: body.orientation,
      parking: body.parking,
      status: newStatus,
      paymentPlanId: body.paymentPlanId ? parseInt(body.paymentPlanId) : undefined,
      assignedAgentId: body.assignedAgentId ? parseInt(body.assignedAgentId) : undefined,
      currentCustomerId: body.currentCustomerId ? parseInt(body.currentCustomerId) : undefined,
      notes: body.notes,
      updatedAt: new Date(),
    }).where(eq(units.id, unitId)).returning();

    if (oldStatus !== newStatus) {
      await logActivity({
        action: "Unit Status Change",
        entityType: "unit",
        entityId: unitId,
        entityName: updated[0].unitNumber,
        oldValue: oldStatus,
        newValue: newStatus,
        details: `Unit ${updated[0].unitNumber} status changed from ${oldStatus} to ${newStatus}`,
      });
      await createNotification({
        title: `Unit ${updated[0].unitNumber} Status Updated`,
        message: `Status changed to ${newStatus}`,
        type: "price",
        link: `/units/${unitId}`,
      });
    }

    return NextResponse.json({ success: true, unit: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
