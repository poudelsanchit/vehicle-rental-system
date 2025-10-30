import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/features/core/lib/prisma";
import { authOptions } from "@/features/core/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vehicles = await prisma.vehicle.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: [
        { verificationStatus: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}