import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const db = getDb();
    
    const stmt = db.prepare(`
      UPDATE packages 
      SET name = ?, name_ar = ?, price = ?, description = ?, description_ar = ?, features = ?, features_ar = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name,
      data.name_ar,
      data.price,
      data.description,
      data.description_ar,
      JSON.stringify(data.features),
      JSON.stringify(data.features_ar),
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}
