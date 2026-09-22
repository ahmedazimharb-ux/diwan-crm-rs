import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, priceHistory } from "@/db/schema";
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

    const { newPrice, reason, changedByName = "Ahmed Al-Mansi", changedByUserId = 1 } = body;

    const unit = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    if (!unit || unit.length === 0) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 });
    }

    const currentUnit = unit[0];
    const oldPriceNum = parseFloat(currentUnit.currentPrice || currentUnit.basePrice);
    const newPriceNum = parseFloat(newPrice);

    if (isNaN(newPriceNum) || newPriceNum <= 0) {
      return NextResponse.json({ success: false, error: "Invalid price value" }, { status: 400 });
    }

    const changeAmt = newPriceNum - oldPriceNum;
    const percentageChange = oldPriceNum > 0 ? (changeAmt / oldPriceNum) * 100 : 0;

    const areaNum = parseFloat(currentUnit.area || "1");
    const pricePerSqmNum = areaNum > 0 ? newPriceNum / areaNum : 0;
    const discountPercentNum = parseFloat(currentUnit.discountPercent || "0");
    const discountAmount = newPriceNum * (discountPercentNum / 100);
    const netPriceNum = newPriceNum - discountAmount;

    // Update unit
    const updatedUnit = await db.update(units).set({
      currentPrice: newPriceNum.toFixed(2),
      basePrice: newPriceNum.toFixed(2),
      pricePerSqm: pricePerSqmNum.toFixed(2),
      discount: discountAmount.toFixed(2),
      netPrice: netPriceNum.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(units.id, unitId)).returning();

    // Log price history
    const historyRecord = await db.insert(priceHistory).values({
      unitId,
      oldPrice: oldPriceNum.toFixed(2),
      newPrice: newPriceNum.toFixed(2),
      changeAmount: changeAmt.toFixed(2),
      percentageChange: percentageChange.toFixed(2),
      changedByUserId,
      changedByName,
      reason: reason || "Manual price adjustment",
    }).returning();

    // Log activity audit
    await logActivity({
      userId: changedByUserId,
      userName: changedByName,
      action: "Price Change",
      entityType: "unit",
      entityId: unitId,
      entityName: currentUnit.unitNumber,
      oldValue: `${oldPriceNum.toLocaleString()} EGP`,
      newValue: `${newPriceNum.toLocaleString()} EGP`,
      details: `Price for Unit ${currentUnit.unitNumber} updated by ${changedByName}. Reason: ${reason || "N/A"}`,
    });

    await createNotification({
      title: `Price Changed: Unit ${currentUnit.unitNumber}`,
      message: `Price updated from ${oldPriceNum.toLocaleString()} EGP to ${newPriceNum.toLocaleString()} EGP`,
      type: "price",
      link: `/units/${unitId}`,
    });

    return NextResponse.json({
      success: true,
      unit: updatedUnit[0],
      priceHistory: historyRecord[0],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
