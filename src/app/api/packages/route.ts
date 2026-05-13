import getDb from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = getDb();
    const packages = db.prepare("SELECT * FROM packages WHERE active=1 ORDER BY price ASC").all();
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}
