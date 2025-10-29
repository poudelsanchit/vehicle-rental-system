import { NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}