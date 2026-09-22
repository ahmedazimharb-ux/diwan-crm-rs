import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, customers, leads, projects, users, reservations, sales } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: { units: [], customers: [], leads: [], projects: [], agents: [] } });
    }

    const allUnits = await db.select().from(units);
    const allCustomers = await db.select().from(customers);
    const allLeads = await db.select().from(leads);
    const allProjects = await db.select().from(projects);
    const allUsers = await db.select().from(users);

    const matchingUnits = allUnits.filter(u =>
      u.unitNumber.toLowerCase().includes(q) ||
      (u.floor && u.floor.toLowerCase().includes(q)) ||
      (u.unitType && u.unitType.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchingCustomers = allCustomers.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchingLeads = allLeads.filter(l =>
      l.fullName.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.campaign && l.campaign.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchingProjects = allProjects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchingAgents = allUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    ).slice(0, 5);

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        units: matchingUnits,
        customers: matchingCustomers,
        leads: matchingLeads,
        projects: matchingProjects,
        agents: matchingAgents,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
