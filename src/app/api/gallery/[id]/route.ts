import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const stmt = db.prepare(`DELETE FROM gallery_items WHERE id = ?`);
    stmt.run(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
