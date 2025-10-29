// app/api/vehicles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/core/lib/auth";
import { prisma } from "@/features/core/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const vehicleId = params.id;

    // 2. Check if vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // 3. Check ownership (or if user is ADMIN)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (vehicle.userId !== userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to delete this vehicle" },
        { status: 403 }
      );
    }

    // 4. Delete images from filesystem
    const imagePaths = [
      vehicle.bluebookImage,
      vehicle.insuranceDocumentImage,
      vehicle.vehicleFrontPhoto,
      vehicle.vehicleBackPhoto,
      vehicle.vehicleInteriorPhoto,
      vehicle.vehicleSidePhoto,
    ];

    // Try to delete each image file
    for (const imagePath of imagePaths) {
      if (imagePath) {
        try {
          const fullPath = join(process.cwd(), "public", imagePath);
          await unlink(fullPath);
        } catch (error) {
          // Log error but don't stop deletion process
          console.error(`Failed to delete image: ${imagePath}`, error);
        }
      }
    }

    // 5. Delete vehicle from database
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Vehicle deletion error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete vehicle",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET single vehicle
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: vehicle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch vehicle error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch vehicle",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
