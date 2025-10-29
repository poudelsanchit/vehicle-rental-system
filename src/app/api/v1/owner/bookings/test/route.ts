import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

// GET - Test endpoint to verify owner booking functionality
export async function GET() {
  try {
    // Test database connection and owner booking functionality
    const totalBookings = await prisma.booking.count();
    const totalVehicles = await prisma.vehicle.count();
    const totalOwners = await prisma.user.count({
      where: { role: "OWNER" }
    });
    
    // Get sample booking data structure
    const sampleBooking = await prisma.booking.findFirst({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            kyc: {
              select: {
                phoneNumber: true,
                fullName: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            registrationNumber: true,
            pricePerDay: true,
            vehicleFrontPhoto: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: "Owner booking system is ready!",
      stats: {
        totalBookings,
        totalVehicles,
        totalOwners,
      },
      sampleBookingStructure: sampleBooking,
      endpoints: {
        getOwnerBookings: "GET /api/v1/owner/bookings",
        updateBookingStatus: "PATCH /api/v1/owner/bookings/[id]",
      },
      availableStatuses: ["CONFIRMED", "CANCELLED"],
    });
  } catch (error) {
    console.error("Error testing owner booking system:", error);
    return NextResponse.json(
      { error: "Owner booking system test failed", details: error },
      { status: 500 }
    );
  }
}