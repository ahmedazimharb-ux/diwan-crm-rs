import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentPlans, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const allPlans = await db.select().from(paymentPlans).orderBy(desc(paymentPlans.createdAt));
    const allProjects = await db.select().from(projects);

    const projectMap = new Map(allProjects.map(p => [p.id, p.name]));

    let filtered = allPlans.map(plan => ({
      ...plan,
      projectName: plan.projectId ? projectMap.get(plan.projectId) : "All Projects",
    }));

    if (projectId && projectId !== "all") {
      filtered = filtered.filter(p => p.projectId === parseInt(projectId));
    }

    return NextResponse.json({ success: true, paymentPlans: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newPlan = await db.insert(paymentPlans).values({
      projectId: body.projectId ? parseInt(body.projectId) : null,
      name: body.name,
      downPaymentPercent: body.downPaymentPercent.toString(),
      durationYears: body.durationYears.toString(),
      installmentsCount: parseInt(body.installmentsCount),
      installmentFrequency: body.installmentFrequency || "Quarterly",
      discountCashPercent: (body.discountCashPercent || 0).toString(),
      maintenanceDepositPercent: (body.maintenanceDepositPercent || 7).toString(),
      deliveryMonths: body.deliveryMonths ? parseInt(body.deliveryMonths) : 36,
      description: body.description || "",
      isActive: true,
    }).returning();

    await logActivity({
      action: "Payment Plan Created",
      entityType: "payment_plan",
      entityId: newPlan[0].id,
      entityName: newPlan[0].name,
      details: `Created new payment plan '${newPlan[0].name}' (${newPlan[0].downPaymentPercent}% Down, ${newPlan[0].durationYears} Years)`,
    });

    return NextResponse.json({ success: true, paymentPlan: newPlan[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
