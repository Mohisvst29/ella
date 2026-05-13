import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = getDb();
    
    const stmt = db.prepare(`
      INSERT INTO gallery_items (title, category, image_url, location, year, featured)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title || "Untitled",
      data.category || "Wedding",
      data.image_url,
      data.location || "",
      data.year || new Date().getFullYear(),
      data.featured ? 1 : 0
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error("Error adding gallery item:", error);
    return NextResponse.json({ error: "Failed to add gallery item" }, { status: 500 });
  }
}
