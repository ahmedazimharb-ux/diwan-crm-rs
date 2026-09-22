import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, units } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const allProjects = status
      ? await db.select().from(projects).where(eq(projects.status, status)).orderBy(desc(projects.createdAt))
      : await db.select().from(projects).orderBy(desc(projects.createdAt));

    const allUnits = await db.select().from(units);

    // Attach aggregated stats per project
    const projectsWithStats = allProjects.map(p => {
      const pUnits = allUnits.filter(u => u.projectId === p.id);
      const totalUnits = pUnits.length;
      const availableUnits = pUnits.filter(u => u.status === "Available").length;
      const reservedUnits = pUnits.filter(u => u.status === "Reserved").length;
      const soldUnits = pUnits.filter(u => u.status === "Sold" || u.status === "Contracted").length;
      const totalInventoryVal = pUnits.reduce((acc, u) => acc + parseFloat(u.netPrice || "0"), 0);

      return {
        ...p,
        totalUnits: totalUnits || p.numberOfUnits,
        availableUnits,
        reservedUnits,
        soldUnits,
        totalInventoryVal,
      };
    });

    return NextResponse.json({ success: true, projects: projectsWithStats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProject = await db.insert(projects).values({
      name: body.name,
      developer: body.developer || "Value Real Estate Developments",
      location: body.location,
      address: body.address || "",
      description: body.description || "",
      projectType: body.projectType || "Commercial Mall",
      deliveryDate: body.deliveryDate || "",
      constructionStatus: body.constructionStatus || "Under Construction",
      totalLandArea: body.totalLandArea || "",
      numberOfBuildings: body.numberOfBuildings ? parseInt(body.numberOfBuildings) : 1,
      numberOfUnits: body.numberOfUnits ? parseInt(body.numberOfUnits) : 0,
      amenities: body.amenities || [],
      masterPlanUrl: body.masterPlanUrl || "",
      images: body.images || [],
      videoUrl: body.videoUrl || "",
      brochureUrl: body.brochureUrl || "",
      status: "Active",
    }).returning();

    await logActivity({
      action: "Project Created",
      entityType: "project",
      entityId: newProject[0].id,
      entityName: newProject[0].name,
      newValue: newProject[0].name,
      details: `Created new project ${newProject[0].name} located in ${newProject[0].location}`,
    });

    return NextResponse.json({ success: true, project: newProject[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
