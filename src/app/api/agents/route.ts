import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, leads, sales, reservations, commissions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allLeads = await db.select().from(leads);
    const allSales = await db.select().from(sales);
    const allReservations = await db.select().from(reservations);
    const allCommissions = await db.select().from(commissions);

    const teamPerformance = allUsers.map(user => {
      const uLeads = allLeads.filter(l => l.assignedAgentId === user.id);
      const uSales = allSales.filter(s => s.agentId === user.id);
      const uRes = allReservations.filter(r => r.agentId === user.id);
      const uComm = allCommissions.filter(c => c.agentId === user.id);

      const totalRevenue = uSales.reduce((acc, s) => acc + parseFloat(s.netSaleValue || "0"), 0);
      const totalCommissions = uComm.reduce((acc, c) => acc + parseFloat(c.commissionAmount || "0"), 0);
      const conversionRate = uLeads.length > 0 ? ((uSales.length / uLeads.length) * 100).toFixed(1) : "0";

      return {
        ...user,
        leadsCount: uLeads.length,
        reservationsCount: uRes.length,
        salesCount: uSales.length,
        totalRevenue,
        totalCommissions,
        conversionRate,
      };
    });

    return NextResponse.json({ success: true, agents: teamPerformance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newUser = await db.insert(users).values({
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      role: body.role || "Sales Agent",
      avatarUrl: body.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      targetSales: (body.targetSales || 15000000).toString(),
      status: "Active",
    }).returning();

    return NextResponse.json({ success: true, user: newUser[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
