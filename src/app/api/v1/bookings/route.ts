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

// POST - Create new booking (now handled through payment verification)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: "Direct booking creation is disabled. Please use the payment flow.",
      message: "Bookings must be created through the payment verification process to ensure payment is completed first."
    },
    { status: 400 }
  );
}