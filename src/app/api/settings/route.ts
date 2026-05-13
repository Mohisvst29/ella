import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const db = getDb();
    
    // data should be an object of key-value pairs
    const stmt = db.prepare("UPDATE site_settings SET value = ? WHERE key = ?");
    const insertStmt = db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)");
    
    // We run in a transaction for safety
    const transaction = db.transaction((settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
         insertStmt.run(value, key);
      }
    });

    transaction(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
