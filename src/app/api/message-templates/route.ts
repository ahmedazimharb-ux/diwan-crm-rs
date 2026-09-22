import { NextResponse } from "next/server";
import { db } from "@/db";
import { messageTemplates } from "@/db/schema";
import { DEFAULT_WHATSAPP_TEMPLATES } from "@/lib/whatsapp";

export async function GET() {
  try {
    let rows = await db.select().from(messageTemplates);

    // Auto-seed sensible defaults the first time this is called, so the
    // feature works immediately on any deployment without a manual setup step.
    if (rows.length === 0) {
      rows = await db
        .insert(messageTemplates)
        .values(DEFAULT_WHATSAPP_TEMPLATES.map(t => ({ name: t.name, channel: "whatsapp", content: t.content })))
        .returning();
    }

    return NextResponse.json({ success: true, templates: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, content } = body;
    if (!name || !content) {
      return NextResponse.json({ success: false, error: "name and content are required" }, { status: 400 });
    }
    const [created] = await db.insert(messageTemplates).values({ name, channel: "whatsapp", content }).returning();
    return NextResponse.json({ success: true, template: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
