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

// POST - Create new booking
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

    const body = await request.json();
    const {
      vehicleId,
      startDate,
      endDate,
      contactPhone,
      pickupTime,
      specialRequests,
    } = body;

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

    if (!vehicle.available) {
      return NextResponse.json(
        { error: "Vehicle is not available" },
        { status: 400 }
      );
    }

    // Calculate total days and amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const totalAmount = totalDays * vehicle.pricePerDay;

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
            ],
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Vehicle is already booked for the selected dates" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        vehicleId,
        startDate: start,
        endDate: end,
        totalDays,
        totalAmount,
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
            year: true,
            vehicleFrontPhoto: true,
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
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}