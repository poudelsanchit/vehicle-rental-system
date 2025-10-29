import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vehicleId = searchParams.get('vehicleId');

    // If no dates provided, return all currently available vehicles
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date();

    // Validate dates
    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (start < currentDate) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }

    let whereClause: any = {
      available: true,
    };

    // If checking specific vehicle
    if (vehicleId) {
      whereClause.id = vehicleId;
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
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
            OR: [
              // Booking starts during the requested period
              {
                AND: [
                  { startDate: { lte: end } },
                  { startDate: { gte: start } },
                ],
              },
              // Booking ends during the requested period
              {
                AND: [
                  { endDate: { lte: end } },
                  { endDate: { gte: start } },
                ],
              },
              // Booking spans the entire requested period
              {
                AND: [
                  { startDate: { lte: start } },
                  { endDate: { gte: end } },
                ],
              },
            ],
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

    // Filter vehicles based on availability for the requested dates
    const availableVehicles = vehicles.filter(vehicle => {
      // If vehicle has conflicting bookings, it's not available
      return vehicle.bookings.length === 0;
    });

    // Remove bookings data from response
    const vehiclesResponse = availableVehicles.map(vehicle => {
      const { bookings, ...vehicleData } = vehicle;
      return {
        ...vehicleData,
        availableForDates: true,
      };
    });

    // If checking specific vehicle, return availability status
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 }
        );
      }

      const isAvailable = vehicle.bookings.length === 0;
      const conflictingBookings = vehicle.bookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
      }));

      return NextResponse.json({
        vehicleId: vehicle.id,
        available: isAvailable,
        requestedPeriod: {
          startDate: start,
          endDate: end,
        },
        conflictingBookings: conflictingBookings,
        message: isAvailable 
          ? "Vehicle is available for the requested dates"
          : "Vehicle is not available for the requested dates",
      });
    }

    return NextResponse.json({
      availableVehicles: vehiclesResponse,
      requestedPeriod: {
        startDate: start,
        endDate: end,
      },
      totalAvailable: vehiclesResponse.length,
    });

  } catch (error) {
    console.error("Error checking vehicle availability:", error);
    return NextResponse.json(
      { error: "Failed to check vehicle availability" },
      { status: 500 }
    );
  }
}