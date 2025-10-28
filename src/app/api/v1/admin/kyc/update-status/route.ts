import { prisma } from "@/features/core/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Types
type KYCStatus = "PENDING" | "APPROVED" | "REJECTED";

interface UpdateStatusRequest {
  kycId: string;
  status: KYCStatus;
  rejectionReason?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdateStatusRequest = await request.json();
    const { kycId, status, rejectionReason } = body;

    // Validate required fields
    if (!kycId || !status) {
      return NextResponse.json(
        { error: "KYC ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // If status is REJECTED, rejection reason should be provided
    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting KYC" },
        { status: 400 }
      );
    }

    // Check if KYC record exists
    const existingKYC = await prisma.kYC.findUnique({
      where: { id: kycId },
      include: { user: true },
    });

    if (!existingKYC) {
      return NextResponse.json(
        { error: "KYC record not found" },
        { status: 404 }
      );
    }

    // Update KYC status
    const updatedKYC = await prisma.kYC.update({
      where: { id: kycId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        verifiedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    // If status is APPROVED, update user's isVerified to true
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: existingKYC.userId },
        data: { isVerified: true },
      });
    }

    // If status is REJECTED or PENDING, set user's isVerified to false
    if (status === "REJECTED" || status === "PENDING") {
      await prisma.user.update({
        where: { id: existingKYC.userId },
        data: { isVerified: false },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `KYC status updated to ${status}`,
        data: updatedKYC,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating KYC status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
