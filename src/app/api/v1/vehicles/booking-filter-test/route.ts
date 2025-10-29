import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function GET() {
  try {
    const currentDate = new Date();
    
    // Get comprehensive data for testing
    const totalVehicles = await prisma.vehicle.count();
    const availableVehicles = await prisma.vehicle.count({
      where: { available: true }
    });
    
    const totalBookings = await prisma.booking.count();
    const activeBookings = await prisma.booking.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        endDate: { gte: currentDate }
      }
    });

    // Get vehicles with their booking status
    const vehiclesWithBookings = await prisma.vehicle.findMany({
      where: { available: true },
      include: {
        bookings: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            endDate: { gte: currentDate }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            user: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    const availableForBooking = vehiclesWithBookings.filter(v => v.bookings.length === 0);
    const currentlyBooked = vehiclesWithBookings.filter(v => v.bookings.length > 0);

    // Test the actual API endpoint
    const apiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/vehicles`);
    const apiVehicles = apiResponse.ok ? await apiResponse.json() : [];

    return NextResponse.json({
      message: "Booking Filter Test Results",
      timestamp: new Date().toISOString(),
      
      statistics: {
        totalVehicles,
        availableVehicles,
        totalBookings,
        activeBookings,
        availableForBooking: availableForBooking.length,
        currentlyBooked: currentlyBooked.length,
        apiReturnedVehicles: Array.isArray(apiVehicles) ? apiVehicles.length : 0
      },

      filteringResults: {
        description: "Vehicles are filtered out if they have active bookings (PENDING or CONFIRMED status with endDate >= current date)",
        
        availableVehicles: availableForBooking.map(v => ({
          id: v.id,
          title: v.title,
          registrationNumber: v.registrationNumber,
          brand: v.brand,
          model: v.model,
          status: "Available for booking"
        })),

        bookedVehicles: currentlyBooked.map(v => ({
          id: v.id,
          title: v.title,
          registrationNumber: v.registrationNumber,
          brand: v.brand,
          model: v.model,
          status: "Currently booked",
          activeBookings: v.bookings.map(b => ({
            bookingId: b.id,
            renter: b.user.username,
            startDate: b.startDate,
            endDate: b.endDate,
            status: b.status,
            daysRemaining: Math.ceil((new Date(b.endDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
          }))
        }))
      },

      validation: {
        filteringWorking: availableForBooking.length === (Array.isArray(apiVehicles) ? apiVehicles.length : 0),
        message: availableForBooking.length === (Array.isArray(apiVehicles) ? apiVehicles.length : 0) 
          ? "✅ Filtering is working correctly - API returns only available vehicles"
          : "❌ Filtering issue detected - API count doesn't match available count"
      },

      recommendations: [
        "Vehicles with active bookings are automatically hidden from the user interface",
        "Only vehicles without PENDING or CONFIRMED bookings are shown",
        "This prevents double-booking and ensures accurate availability",
        "Owners can still see all their vehicles in the owner dashboard"
      ]
    });

  } catch (error) {
    console.error("Error in booking filter test:", error);
    return NextResponse.json(
      { error: "Failed to run booking filter test", details: error },
      { status: 500 }
    );
  }
}