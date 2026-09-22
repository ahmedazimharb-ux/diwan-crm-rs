import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, users, reservations, sales, units } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
    const allUsers = await db.select().from(users);
    const allReservations = await db.select().from(reservations);
    const allSales = await db.select().from(sales);

    const agentMap = new Map(allUsers.map(u => [u.id, u.name]));

    let filtered = allCustomers.map(c => {
      const custRes = allReservations.filter(r => r.customerId === c.id);
      const custSales = allSales.filter(s => s.customerId === c.id);
      return {
        ...c,
        agentName: c.assignedAgentId ? agentMap.get(c.assignedAgentId) : "Unassigned",
        reservationsCount: custRes.length,
        purchasesCount: custSales.length,
        totalSpent: custSales.reduce((acc, s) => acc + parseFloat(s.netSaleValue || "0"), 0),
      };
    });

    if (status && status !== "all") {
      filtered = filtered.filter(c => c.status === status);
    }
    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, customers: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newCustomer = await db.insert(customers).values({
      fullName: body.fullName,
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      email: body.email || "",
      nationalId: body.nationalId || "",
      address: body.address || "",
      jobTitle: body.jobTitle || "",
      company: body.company || "",
      interestedProjects: body.interestedProjects || [],
      preferredUnitTypes: body.preferredUnitTypes || [],
      assignedAgentId: body.assignedAgentId ? parseInt(body.assignedAgentId) : null,
      status: body.status || "Active Buyer",
      notes: body.notes || "",
    }).returning();

    await logActivity({
      action: "Customer Profile Created",
      entityType: "customer",
      entityId: newCustomer[0].id,
      entityName: newCustomer[0].fullName,
      details: `Created customer profile for ${newCustomer[0].fullName}`,
    });

    return NextResponse.json({ success: true, customer: newCustomer[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
