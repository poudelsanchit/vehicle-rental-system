import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

// GET - Test endpoint to verify booking functionality
export async function GET() {
  try {
    // Test database connection and booking model
    const bookingCount = await prisma.booking.count();
    const vehicleCount = await prisma.vehicle.count();
    
    return NextResponse.json({
      message: "Booking system is ready!",
      stats: {
        totalBookings: bookingCount,
        totalVehicles: vehicleCount,
      },
      endpoints: {
        createBooking: "POST /api/v1/bookings",
        getUserBookings: "GET /api/v1/bookings",
        cancelBooking: "PATCH /api/v1/bookings/[id]",
      },
    });
  } catch (error) {
    console.error("Error testing booking system:", error);
    return NextResponse.json(
      { error: "Booking system test failed", details: error },
      { status: 500 }
    );
  }
}