import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, priceHistory } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { unitIds, action, status, paymentPlanId, priceAdjustmentType, priceAdjustmentValue, reason } = body;

    if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      return NextResponse.json({ success: false, error: "No unit IDs provided" }, { status: 400 });
    }

    const ids = unitIds.map((id: any) => parseInt(id));

    if (action === "change_status") {
      await db.update(units).set({
        status,
        updatedAt: new Date(),
      }).where(inArray(units.id, ids));

      await logActivity({
        action: "Bulk Status Change",
        entityType: "unit",
        details: `Updated status to '${status}' for ${ids.length} units.`,
      });

      return NextResponse.json({ success: true, count: ids.length, message: `Updated ${ids.length} units to ${status}` });
    }

    if (action === "assign_payment_plan") {
      await db.update(units).set({
        paymentPlanId: paymentPlanId ? parseInt(paymentPlanId) : null,
        updatedAt: new Date(),
      }).where(inArray(units.id, ids));

      await logActivity({
        action: "Bulk Payment Plan Assignment",
        entityType: "unit",
        details: `Assigned payment plan ID #${paymentPlanId} to ${ids.length} units.`,
      });

      return NextResponse.json({ success: true, count: ids.length, message: `Assigned payment plan to ${ids.length} units` });
    }

    if (action === "update_price") {
      const targetUnits = await db.select().from(units).where(inArray(units.id, ids));
      const val = parseFloat(priceAdjustmentValue || "0");

      for (const u of targetUnits) {
        const oldPriceNum = parseFloat(u.currentPrice || u.basePrice);
        let newPriceNum = oldPriceNum;

        if (priceAdjustmentType === "percent_increase") {
          newPriceNum = oldPriceNum * (1 + val / 100);
        } else if (priceAdjustmentType === "percent_decrease") {
          newPriceNum = oldPriceNum * (1 - val / 100);
        } else if (priceAdjustmentType === "fixed_price") {
          newPriceNum = val;
        }

        const areaNum = parseFloat(u.area || "1");
        const pricePerSqmNum = areaNum > 0 ? newPriceNum / areaNum : 0;
        const discPercent = parseFloat(u.discountPercent || "0");
        const discAmount = newPriceNum * (discPercent / 100);
        const netPriceNum = newPriceNum - discAmount;

        await db.update(units).set({
          currentPrice: newPriceNum.toFixed(2),
          basePrice: newPriceNum.toFixed(2),
          pricePerSqm: pricePerSqmNum.toFixed(2),
          discount: discAmount.toFixed(2),
          netPrice: netPriceNum.toFixed(2),
          updatedAt: new Date(),
        }).where(inArray(units.id, [u.id]));

        // Log price history
        const changeAmt = newPriceNum - oldPriceNum;
        const pctChange = oldPriceNum > 0 ? (changeAmt / oldPriceNum) * 100 : 0;

        await db.insert(priceHistory).values({
          unitId: u.id,
          oldPrice: oldPriceNum.toFixed(2),
          newPrice: newPriceNum.toFixed(2),
          changeAmount: changeAmt.toFixed(2),
          percentageChange: pctChange.toFixed(2),
          reason: reason || "Bulk price adjustment",
        });
      }

      await logActivity({
        action: "Bulk Price Adjustment",
        entityType: "unit",
        details: `Adjusted prices for ${ids.length} units (${priceAdjustmentType}: ${val})`,
      });

      return NextResponse.json({ success: true, count: ids.length, message: `Price updated for ${ids.length} units` });
    }

    return NextResponse.json({ success: false, error: "Invalid action specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
