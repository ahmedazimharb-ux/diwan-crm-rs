import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, projects, buildings, paymentPlans, users } from "@/db/schema";
import { desc, eq, and, gte, lte, like, ilike } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get("projectId");
    const floor = searchParams.get("floor");
    const unitType = searchParams.get("unitType");
    const bedrooms = searchParams.get("bedrooms");
    const status = searchParams.get("status");
    const view = searchParams.get("view");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");

    const allUnits = await db.select().from(units).orderBy(desc(units.createdAt));
    const allProjects = await db.select().from(projects);
    const allPlans = await db.select().from(paymentPlans);
    const allAgents = await db.select().from(users);

    // Map projects and agents onto units
    const projectMap = new Map(allProjects.map(p => [p.id, p.name]));
    const planMap = new Map(allPlans.map(p => [p.id, p.name]));
    const agentMap = new Map(allAgents.map(a => [a.id, a.name]));

    let filtered = allUnits.map(u => ({
      ...u,
      projectName: projectMap.get(u.projectId) || "Value 9 Mall",
      paymentPlanName: u.paymentPlanId ? planMap.get(u.paymentPlanId) : "Standard Plan",
      agentName: u.assignedAgentId ? agentMap.get(u.assignedAgentId) : "Unassigned",
    }));

    if (projectId && projectId !== "all") {
      filtered = filtered.filter(u => u.projectId === parseInt(projectId));
    }
    if (floor && floor !== "all") {
      filtered = filtered.filter(u => u.floor === floor);
    }
    if (unitType && unitType !== "all") {
      filtered = filtered.filter(u => u.unitType === unitType);
    }
    if (bedrooms && bedrooms !== "all") {
      filtered = filtered.filter(u => u.bedrooms === parseInt(bedrooms));
    }
    if (status && status !== "all") {
      filtered = filtered.filter(u => u.status === status);
    }
    if (view && view !== "all") {
      filtered = filtered.filter(u => u.view && u.view.toLowerCase().includes(view.toLowerCase()));
    }
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(u =>
        u.unitNumber.toLowerCase().includes(q) ||
        (u.phaseName && u.phaseName.toLowerCase().includes(q)) ||
        (u.buildingName && u.buildingName.toLowerCase().includes(q)) ||
        (u.notes && u.notes.toLowerCase().includes(q))
      );
    }
    if (minPrice) {
      filtered = filtered.filter(u => parseFloat(u.netPrice || "0") >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(u => parseFloat(u.netPrice || "0") <= parseFloat(maxPrice));
    }
    if (minArea) {
      filtered = filtered.filter(u => parseFloat(u.area || "0") >= parseFloat(minArea));
    }
    if (maxArea) {
      filtered = filtered.filter(u => parseFloat(u.area || "0") <= parseFloat(maxArea));
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      units: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const basePrice = parseFloat(body.basePrice || "0");
    const area = parseFloat(body.area || "1");
    const discountPercent = parseFloat(body.discountPercent || "0");
    const discount = basePrice * (discountPercent / 100);
    const netPrice = basePrice - discount;
    const pricePerSqm = area > 0 ? (basePrice / area).toFixed(2) : "0";

    const newUnit = await db.insert(units).values({
      projectId: parseInt(body.projectId),
      buildingId: body.buildingId ? parseInt(body.buildingId) : null,
      unitNumber: body.unitNumber,
      phaseName: body.phaseName || "Phase 1",
      buildingName: body.buildingName || "Main Building",
      floor: body.floor || "Ground Floor",
      unitType: body.unitType || "Retail Store",
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : 0,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : 1,
      area: area.toString(),
      gardenArea: (body.gardenArea || 0).toString(),
      terraceArea: (body.terraceArea || 0).toString(),
      view: body.view || "Plaza View",
      orientation: body.orientation || "North",
      parking: body.parking || "Underground Parking",
      status: body.status || "Available",
      basePrice: basePrice.toString(),
      currentPrice: basePrice.toString(),
      pricePerSqm: pricePerSqm.toString(),
      discount: discount.toString(),
      discountPercent: discountPercent.toString(),
      netPrice: netPrice.toString(),
      commissionPercent: (body.commissionPercent || 2.5).toString(),
      paymentPlanId: body.paymentPlanId ? parseInt(body.paymentPlanId) : null,
      assignedAgentId: body.assignedAgentId ? parseInt(body.assignedAgentId) : null,
      notes: body.notes || "",
    }).returning();

    await logActivity({
      action: "Unit Created",
      entityType: "unit",
      entityId: newUnit[0].id,
      entityName: newUnit[0].unitNumber,
      newValue: `Unit ${newUnit[0].unitNumber} (${newUnit[0].status})`,
      details: `Created new unit ${newUnit[0].unitNumber} in Project #${newUnit[0].projectId}`,
    });

    return NextResponse.json({ success: true, unit: newUnit[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
