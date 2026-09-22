import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, reservations, sales, units, users, documents, activities } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);

    if (!customer || customer.length === 0) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const currentCustomer = customer[0];

    const customerReservations = await db.select().from(reservations).where(eq(reservations.customerId, customerId)).orderBy(desc(reservations.createdAt));
    const customerSales = await db.select().from(sales).where(eq(sales.customerId, customerId)).orderBy(desc(sales.createdAt));
    const customerDocs = await db.select().from(documents).where(and(eq(documents.entityType, "customer"), eq(documents.entityId, customerId)));
    const customerTimeline = await db.select().from(activities).where(eq(activities.entityId, customerId)).orderBy(desc(activities.timestamp));

    const agent = currentCustomer.assignedAgentId
      ? await db.select().from(users).where(eq(users.id, currentCustomer.assignedAgentId)).limit(1)
      : [];

    return NextResponse.json({
      success: true,
      customer: {
        ...currentCustomer,
        agentName: agent[0]?.name || "Unassigned",
      },
      reservations: customerReservations,
      sales: customerSales,
      documents: customerDocs,
      timeline: customerTimeline,
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
    const customerId = parseInt(id);
    const body = await request.json();

    const updated = await db.update(customers).set({
      fullName: body.fullName,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      nationalId: body.nationalId,
      address: body.address,
      jobTitle: body.jobTitle,
      company: body.company,
      interestedProjects: body.interestedProjects,
      preferredUnitTypes: body.preferredUnitTypes,
      assignedAgentId: body.assignedAgentId ? parseInt(body.assignedAgentId) : undefined,
      status: body.status,
      notes: body.notes,
    }).where(eq(customers.id, customerId)).returning();

    await logActivity({
      action: "Customer Profile Updated",
      entityType: "customer",
      entityId: customerId,
      entityName: updated[0]?.fullName,
      details: `Updated details for customer ${updated[0]?.fullName}`,
    });

    return NextResponse.json({ success: true, customer: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
