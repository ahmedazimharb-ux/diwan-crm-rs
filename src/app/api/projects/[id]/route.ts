import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, units, buildings, paymentPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

    if (!project || project.length === 0) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const projectUnits = await db.select().from(units).where(eq(units.projectId, projectId));
    const projectBuildings = await db.select().from(buildings).where(eq(buildings.projectId, projectId));
    const projectPlans = await db.select().from(paymentPlans).where(eq(paymentPlans.projectId, projectId));

    // Stats
    const totalUnits = projectUnits.length;
    const availableUnits = projectUnits.filter(u => u.status === "Available").length;
    const reservedUnits = projectUnits.filter(u => u.status === "Reserved").length;
    const soldUnits = projectUnits.filter(u => u.status === "Sold" || u.status === "Contracted").length;
    const holdUnits = projectUnits.filter(u => u.status === "Hold").length;
    const totalInventoryValue = projectUnits.reduce((acc, u) => acc + parseFloat(u.netPrice || "0"), 0);

    return NextResponse.json({
      success: true,
      project: project[0],
      stats: {
        totalUnits,
        availableUnits,
        reservedUnits,
        soldUnits,
        holdUnits,
        totalInventoryValue,
      },
      buildings: projectBuildings,
      paymentPlans: projectPlans,
      units: projectUnits,
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
    const projectId = parseInt(id);
    const body = await request.json();

    const updated = await db.update(projects).set({
      name: body.name,
      developer: body.developer,
      location: body.location,
      address: body.address,
      description: body.description,
      projectType: body.projectType,
      deliveryDate: body.deliveryDate,
      constructionStatus: body.constructionStatus,
      totalLandArea: body.totalLandArea,
      numberOfBuildings: body.numberOfBuildings ? parseInt(body.numberOfBuildings) : undefined,
      numberOfUnits: body.numberOfUnits ? parseInt(body.numberOfUnits) : undefined,
      amenities: body.amenities,
      status: body.status,
    }).where(eq(projects.id, projectId)).returning();

    await logActivity({
      action: "Project Updated",
      entityType: "project",
      entityId: projectId,
      entityName: updated[0]?.name,
      details: `Updated project settings & info for ${updated[0]?.name}`,
    });

    return NextResponse.json({ success: true, project: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    await db.update(projects).set({ status: "Archived" }).where(eq(projects.id, projectId));

    await logActivity({
      action: "Project Archived",
      entityType: "project",
      entityId: projectId,
      details: `Archived project #${projectId}`,
    });

    return NextResponse.json({ success: true, message: "Project archived successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
