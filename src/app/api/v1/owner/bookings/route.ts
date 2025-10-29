import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/core/lib/auth";

// GET - Fetch bookings for owner's vehicles
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

    // Check if user is owner
    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Access denied. Owner role required." },
        { status: 403 }
      );
    }

    // Fetch bookings for all vehicles owned by this user
    const bookings = await prisma.booking.findMany({
      where: {
        vehicle: {
          userId: user.id,
        },
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}