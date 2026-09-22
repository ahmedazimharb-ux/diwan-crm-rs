import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateProjectDescription } from "@/lib/projectDescription";
import { logActivity } from "@/lib/audit";

// POST -> generates and saves an AI-style marketing description from the
// project's own structured fields. { save?: boolean } — defaults to true.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const save = body.save !== false;

    const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    const project = rows[0];

    const description = generateProjectDescription({
      name: project.name,
      developer: project.developer,
      location: project.location,
      projectType: project.projectType,
      totalLandArea: project.totalLandArea,
      numberOfUnits: project.numberOfUnits,
      deliveryDate: project.deliveryDate,
      constructionStatus: project.constructionStatus,
      amenities: project.amenities as string[],
    });

    if (save) {
      await db.update(projects).set({ description }).where(eq(projects.id, projectId));
      await logActivity({
        action: "AI Description Generated",
        entityType: "project",
        entityId: projectId,
        entityName: project.name,
        details: "Generated marketing description from project data",
      });
    }

    return NextResponse.json({ success: true, description });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
