import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function GET() {
  try {
    const currentDate = new Date();
    
    // First, get all vehicles that are approved and available
    const allVehicles = await prisma.vehicle.findMany({
      where: {
        available: true,
        verificationStatus: "APPROVED", // Only show approved vehicles
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
              gte: currentDate, // Only consider bookings that haven't ended yet
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out vehicles that have active bookings
    const availableVehicles = allVehicles.filter(vehicle => {
      // If vehicle has no active bookings, it's available
      return vehicle.bookings.length === 0;
    });

    // Remove the bookings data from the response (we don't need to expose it to frontend)
    const vehiclesResponse = availableVehicles.map(vehicle => {
      const { bookings, ...vehicleData } = vehicle;
      return vehicleData;
    });

    return NextResponse.json(vehiclesResponse);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}