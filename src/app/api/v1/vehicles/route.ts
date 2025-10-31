import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const location = searchParams.get("location") || "";

    const currentDate = new Date();
    
    // Build where clause for filtering
    const whereClause: any = {
      available: true,
      verificationStatus: "APPROVED", // Only show approved vehicles
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add type filter
    if (type) {
      whereClause.type = type;
    }

    // Add category filter
    if (category) {
      whereClause.category = category;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      whereClause.pricePerDay = {};
      if (minPrice) whereClause.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.pricePerDay.lte = parseFloat(maxPrice);
    }

    // Add location filter
    if (location) {
      whereClause.pickupLocation = { contains: location, mode: "insensitive" };
    }

    // Get all vehicles matching the filters
    const allVehicles = await prisma.vehicle.findMany({
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

    // Filter vehicles based on date availability
    const availableVehicles = allVehicles.filter(vehicle => {
      // If no date range specified, check if vehicle is currently available (not booked for today)
      if (!startDate || !endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const hasCurrentBooking = vehicle.bookings.some(booking => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          
          // Check if today falls within any booking period
          return bookingStart <= today && bookingEnd > today;
        });
        
        return !hasCurrentBooking;
      }

      // Check if vehicle is available for the specified date range
      const requestStart = new Date(startDate);
      const requestEnd = new Date(endDate);

      const hasConflict = vehicle.bookings.some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        return (
          (bookingStart <= requestStart && bookingEnd > requestStart) ||
          (bookingStart < requestEnd && bookingEnd >= requestEnd) ||
          (bookingStart >= requestStart && bookingEnd <= requestEnd)
        );
      });

      return !hasConflict;
    });

    // Remove the bookings data from the response
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