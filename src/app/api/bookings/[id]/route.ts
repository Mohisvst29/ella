import { NextResponse } from "next/server";
import connectToDatabase, { Booking } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();
    
    await Booking.findByIdAndUpdate(id, { status: data.status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
