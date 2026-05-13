import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      client_name,
      mobile,
      email,
      event_type,
      venue_location,
      package: pkg,
      additional_services,
      notes,
    } = body;

    if (!client_name || !mobile || !event_type || !pkg) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO bookings (client_name, mobile, email, event_type, venue_location, package, additional_services, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      client_name,
      mobile,
      email || null,
      event_type,
      venue_location || null,
      pkg,
      additional_services || null,
      notes || null
    );

    return NextResponse.json(
      { success: true, id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();
    const bookings = db
      .prepare("SELECT * FROM bookings ORDER BY created_at DESC")
      .all();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}
