import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return NextResponse.redirect(new URL("/blog?subscribed=error", request.url));
    }

    const db = getDb();
    try {
      db.prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)").run(email);
    } catch {
      // Email might already exist - that's fine
    }

    return NextResponse.redirect(new URL("/blog?subscribed=true", request.url));
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.redirect(new URL("/blog?subscribed=error", request.url));
  }
}
