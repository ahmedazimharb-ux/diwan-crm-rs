import { NextResponse } from "next/server";
import { db } from "@/db";
import { commissions, users, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus");
    const agentId = searchParams.get("agentId");

    const allCommissions = await db.select().from(commissions).orderBy(desc(commissions.createdAt));

    let filtered = allCommissions;
    if (paymentStatus && paymentStatus !== "all") {
      filtered = filtered.filter(c => c.paymentStatus === paymentStatus);
    }
    if (agentId && agentId !== "all") {
      filtered = filtered.filter(c => c.agentId === parseInt(agentId));
    }

    const totalCommissionsVal = filtered.reduce((acc, c) => acc + parseFloat(c.commissionAmount || "0"), 0);
    const paidCommissionsVal = filtered.filter(c => c.paymentStatus === "Paid").reduce((acc, c) => acc + parseFloat(c.commissionAmount || "0"), 0);
    const pendingCommissionsVal = filtered.filter(c => c.paymentStatus === "Pending" || c.paymentStatus === "Approved").reduce((acc, c) => acc + parseFloat(c.commissionAmount || "0"), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalCommissionsVal,
        paidCommissionsVal,
        pendingCommissionsVal,
      },
      commissions: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
