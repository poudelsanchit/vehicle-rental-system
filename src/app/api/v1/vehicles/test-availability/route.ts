import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function GET() {
  try {
    const currentDate = new Date();
    
    // Get all vehicles with their booking information
    const allVehicles = await prisma.vehicle.findMany({
      where: {
        available: true,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            endDate: {
              gte: currentDate,
            },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Separate available and booked vehicles
    const availableVehicles = allVehicles.filter(vehicle => vehicle.bookings.length === 0);
    const bookedVehicles = allVehicles.filter(vehicle => vehicle.bookings.length > 0);

    return NextResponse.json({
      message: "Vehicle availability test results",
      summary: {
        totalVehicles: allVehicles.length,
        availableVehicles: availableVehicles.length,
        bookedVehicles: bookedVehicles.length,
      },
      availableVehicles: availableVehicles.map(v => ({
        id: v.id,
        title: v.title,
        brand: v.brand,
        model: v.model,
        registrationNumber: v.registrationNumber,
        owner: v.user.username,
      })),
      bookedVehicles: bookedVehicles.map(v => ({
        id: v.id,
        title: v.title,
        brand: v.brand,
        model: v.model,
        registrationNumber: v.registrationNumber,
        owner: v.user.username,
        activeBookings: v.bookings.map(b => ({
          id: b.id,
          startDate: b.startDate,
          endDate: b.endDate,
          status: b.status,
        })),
      })),
      filteringLogic: {
        description: "Vehicles are filtered out if they have any PENDING or CONFIRMED bookings that haven't ended yet",
        criteria: [
          "Vehicle.available = true",
          "No bookings with status PENDING or CONFIRMED",
          "No bookings with endDate >= current date",
        ],
      },
    });
  } catch (error) {
    console.error("Error testing vehicle availability:", error);
    return NextResponse.json(
      { error: "Failed to test vehicle availability" },
      { status: 500 }
    );
  }
}