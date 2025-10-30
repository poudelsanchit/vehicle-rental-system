import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/features/core/lib/prisma";
import { authOptions } from "@/features/core/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status, rejectionReason } = await request.json();
    const vehicleId = params.id;

    // Validate status
    const validStatuses = ["PENDING", "ACCEPTED_FOR_PAYMENT", "REJECTED", "APPROVED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Update vehicle verification status
    const updateData: any = {
      verificationStatus: status,
      verifiedBy: session.user.id,
    };

    if (status === "REJECTED") {
      updateData.rejectionReason = rejectionReason;
    } else if (status === "APPROVED") {
      updateData.verifiedAt = new Date();
      updateData.available = true; // Make vehicle available for booking
    } else if (status === "ACCEPTED_FOR_PAYMENT") {
      updateData.rejectionReason = null; // Clear any previous rejection reason
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Vehicle verification status updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Error updating vehicle verification:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle verification" },
      { status: 500 }
    );
  }
}