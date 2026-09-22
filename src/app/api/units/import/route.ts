import { NextResponse } from "next/server";
import { db } from "@/db";
import { units, projects } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { logActivity } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, projectId = 1, confirmImport = false } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "No import items provided" }, { status: 400 });
    }

    const existingUnits = await db.select().from(units);
    const existingNumbers = new Set(existingUnits.map(u => u.unitNumber.toUpperCase().trim()));

    const validStatuses = ["Available", "Hold", "Reserved", "Contracted", "Sold", "Cancelled"];
    const validFloors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "Roof"];

    const validationReport = {
      total: items.length,
      validCount: 0,
      invalidCount: 0,
      duplicateCount: 0,
      errors: [] as { row: number; unitNumber: string; issues: string[] }[],
      preview: [] as any[],
    };

    const validToInsert: any[] = [];

    items.forEach((item: any, idx: number) => {
      const row = idx + 1;
      const unitNumber = (item.unitNumber || item.code || item["Unit Number"] || item["كود الوحـدة"] || "").toString().trim();
      const area = parseFloat(item.area || item["Area"] || item["المساحة"] || "0");
      const basePrice = parseFloat(item.basePrice || item.price || item["Price"] || item["السعر"] || "0");
      const floor = (item.floor || item["Floor"] || item["الدور"] || "Ground Floor").toString();
      const unitType = (item.unitType || item.type || item["Unit Type"] || item["نوع الوحـدة"] || "Commercial").toString();
      const status = (item.status || item["Status"] || "Available").toString();

      const issues: string[] = [];

      if (!unitNumber) issues.push("Missing Unit Number");
      if (existingNumbers.has(unitNumber.toUpperCase())) {
        issues.push("Duplicate Unit Number (already exists in database)");
        validationReport.duplicateCount++;
      }
      if (isNaN(area) || area <= 0) issues.push("Invalid Area SQM value");
      if (isNaN(basePrice) || basePrice <= 0) issues.push("Invalid Price value");

      if (issues.length > 0) {
        validationReport.invalidCount++;
        validationReport.errors.push({ row, unitNumber: unitNumber || `Row ${row}`, issues });
      } else {
        validationReport.validCount++;
        const pricePerSqm = (basePrice / area).toFixed(2);
        const discountPercent = parseFloat(item.discountPercent || "0");
        const discount = basePrice * (discountPercent / 100);
        const netPrice = basePrice - discount;

        const preparedObj = {
          projectId: parseInt(projectId),
          unitNumber,
          phaseName: item.phaseName || "Phase 1",
          buildingName: item.buildingName || "Main Mall Building",
          floor,
          unitType,
          bedrooms: parseInt(item.bedrooms || "0"),
          bathrooms: parseInt(item.bathrooms || "1"),
          area: area.toString(),
          gardenArea: (item.gardenArea || 0).toString(),
          terraceArea: (item.terraceArea || 0).toString(),
          view: item.view || "Plaza View",
          orientation: item.orientation || "North",
          parking: item.parking || "Available",
          status: validStatuses.includes(status) ? status : "Available",
          basePrice: basePrice.toString(),
          currentPrice: basePrice.toString(),
          pricePerSqm,
          discount: discount.toString(),
          discountPercent: discountPercent.toString(),
          netPrice: netPrice.toString(),
          notes: item.notes || "Imported from Excel",
        };

        validationReport.preview.push(preparedObj);
        validToInsert.push(preparedObj);
      }
    });

    if (confirmImport) {
      if (validToInsert.length === 0) {
        return NextResponse.json({ success: false, error: "No valid rows to import." }, { status: 400 });
      }

      const inserted = await db.insert(units).values(validToInsert).returning();

      await logActivity({
        action: "Bulk Unit Excel Import",
        entityType: "unit",
        details: `Imported ${inserted.length} units into Project #${projectId}`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${inserted.length} units!`,
        insertedCount: inserted.length,
      });
    }

    // Return Validation Report Preview
    return NextResponse.json({
      success: true,
      report: validationReport,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
