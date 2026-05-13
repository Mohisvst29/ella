import { NextResponse } from "next/server";
import connectToDatabase, { SiteSetting } from "@/lib/db";

export async function POST(request: Request) {
  return PATCH(request);
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    await connectToDatabase();
    
    // We update each setting or create it if it doesn't exist
    const promises = Object.entries(data).map(([key, value]) => {
      return SiteSetting.findOneAndUpdate(
        { key },
        { value: value as string },
        { upsert: true, new: true }
      );
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
