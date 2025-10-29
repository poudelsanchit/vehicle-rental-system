import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/core/lib/auth";

// GET - Fetch user's bookings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            vehicleFrontPhoto: true,
            pricePerDay: true,
            pickupLocation: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create new booking request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const {
      vehicleId,
      startDate,
      endDate,
      contactPhone,
      pickupTime,
      specialRequests,
      totalAmount,
      totalDays,
    } = await request.json();

    // Validate required fields
    if (!vehicleId || !startDate || !endDate || !contactPhone || !pickupTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    if (!vehicle.available || vehicle.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Vehicle is not available for booking" },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        vehicleId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            startDate: {
              lte: new Date(startDate),
            },
            endDate: {
              gt: new Date(startDate),
            },
          },
          {
            startDate: {
              lt: new Date(endDate),
            },
            endDate: {
              gte: new Date(endDate),
            },
          },
          {
            startDate: {
              gte: new Date(startDate),
            },
            endDate: {
              lte: new Date(endDate),
            },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "Vehicle is already booked for the selected dates" },
        { status: 400 }
      );
    }

    // Create booking with PENDING status
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        vehicleId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: totalDays || Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)),
        totalAmount: totalAmount || 0,
        status: "PENDING",
        contactPhone,
        pickupTime,
        specialRequests: specialRequests || null,
      },
      include: {
        vehicle: {
          select: {
            title: true,
            brand: true,
            model: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Booking request created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}