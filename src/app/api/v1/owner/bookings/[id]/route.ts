import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/core/lib/auth";

// PATCH - Update booking status (accept/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user is owner
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Access denied. Owner role required." },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    // Validate status
    if (!["CONFIRMED", "CANCELLED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be CONFIRMED, CANCELLED, or PENDING" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to owner's vehicle
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        vehicle: {
          userId: user.id,
        },
      },
      include: {
        vehicle: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 }
      );
    }

    // Allow status changes for pending and confirmed bookings
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot modify cancelled or completed bookings" },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}