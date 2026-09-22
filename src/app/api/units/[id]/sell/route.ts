import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, sales, commissions, projects, paymentPlans } from "@/db/schema";
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
      reservationId,
      saleDate,
      contractValue,
      discountAmount,
      netSaleValue,
      paymentPlanId,
      paymentPlanName,
      commissionPercent = 2.5,
      contractStatus = "Signed",
      contractDocumentUrl = "",
    } = body;

    const targetUnit = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    if (!targetUnit || targetUnit.length === 0) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
    }

    const currentUnit = targetUnit[0];
    const project = await db.select().from(projects).where(eq(projects.id, currentUnit.projectId)).limit(1);
    const projectName = project[0]?.name || "Value 9 Mall";

    const netSaleValNum = parseFloat(netSaleValue || currentUnit.netPrice);
    const commPctNum = parseFloat(commissionPercent.toString());
    const commissionAmt = (netSaleValNum * (commPctNum / 100)).toFixed(2);

    // 1. Create Sale Record
    const newSale = await db.insert(sales).values({
      customerId: parseInt(customerId),
      customerName: customerName || "Customer",
      unitId,
      unitNumber: currentUnit.unitNumber,
      projectId: currentUnit.projectId,
      projectName,
      agentId: agentId ? parseInt(agentId) : currentUnit.assignedAgentId,
      agentName: agentName || "Sales Agent",
      reservationId: reservationId ? parseInt(reservationId) : null,
      saleDate: saleDate || new Date().toISOString().split("T")[0],
      contractValue: (contractValue || currentUnit.basePrice).toString(),
      discountAmount: (discountAmount || currentUnit.discount || "0").toString(),
      netSaleValue: netSaleValNum.toString(),
      paymentPlanId: paymentPlanId ? parseInt(paymentPlanId) : currentUnit.paymentPlanId,
      paymentPlanName: paymentPlanName || "Selected Plan",
      commissionAmount: commissionAmt,
      contractStatus: contractStatus,
      contractDocumentUrl,
    }).returning();

    // 2. Automatically update unit status to Sold
    await db.update(units).set({
      status: "Sold",
      currentCustomerId: parseInt(customerId),
      updatedAt: new Date(),
    }).where(eq(units.id, unitId));

    // 3. Create Commission Record
    const finalAgentId = agentId ? parseInt(agentId) : (currentUnit.assignedAgentId || 3);
    const newCommission = await db.insert(commissions).values({
      agentId: finalAgentId,
      agentName: agentName || "Sales Agent",
      projectId: currentUnit.projectId,
      unitId,
      unitNumber: currentUnit.unitNumber,
      saleId: newSale[0].id,
      commissionPercentage: commPctNum.toFixed(2),
      commissionAmount: commissionAmt,
      paymentStatus: "Pending",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: `Commission for Unit ${currentUnit.unitNumber} sale contract #${newSale[0].id}`,
    }).returning();

    // 4. Log Activity Audit & Notification
    await logActivity({
      action: "Unit Sold",
      entityType: "sale",
      entityId: newSale[0].id,
      entityName: currentUnit.unitNumber,
      oldValue: currentUnit.status,
      newValue: "Sold",
      details: `Unit ${currentUnit.unitNumber} sold to ${customerName} for ${netSaleValNum.toLocaleString()} EGP`,
    });

    await createNotification({
      title: `🎉 Unit ${currentUnit.unitNumber} Sold!`,
      message: `Contract signed for ${customerName} (EGP ${netSaleValNum.toLocaleString()})`,
      type: "sale",
      link: `/sales`,
    });

    return NextResponse.json({
      success: true,
      sale: newSale[0],
      commission: newCommission[0],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
