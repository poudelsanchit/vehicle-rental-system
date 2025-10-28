// app/api/v1/admin/kyc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/core/lib/auth";
import { prisma } from "@/features/core/lib/prisma";

// GET - Fetch all KYC records
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate and check admin role
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // 2. Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED
    const userRole = searchParams.get("userRole"); // USER, OWNER

    // 3. Build filter conditions
    const whereConditions: any = {};

    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      whereConditions.status = status;
    }

    // 4. Fetch KYC records with user information
    const kycRecords = await prisma.kYC.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" }, // Then by date
      ],
    });

    // 5. Filter by user role if specified (after fetch since role is in User table)
    let filteredRecords = kycRecords;
    if (userRole && ["USER", "OWNER"].includes(userRole)) {
      filteredRecords = kycRecords.filter(
        (record) => record.user.role === userRole
      );
    }

    // 6. Format response
    const formattedRecords = filteredRecords.map((record) => ({
      id: record.id,
      userId: record.userId,
      fullName: record.fullName,
      email: record.user.email,
      phoneNumber: record.phoneNumber,
      nationality: record.nationality,
      identityType: record.identityType,
      identityNumber: record.identityNumber,
      identityPhotoUrl: record.identityPhotoUrl,
      identityBackPhotoUrl: record.identityBackPhotoUrl,
      status: record.status,
      userRole: record.user.role,
      hasLicense: !!record.licenseNumber,
      licenseNumber: record.licenseNumber,
      licenseFrontPhotoUrl: record.licenseFrontPhotoUrl,
      licenseBackPhotoUrl: record.licenseBackPhotoUrl,
      licenseExpiryDate: record.licenseExpiryDate?.toISOString(),
      createdAt: record.createdAt.toISOString(),
      verifiedAt: record.verifiedAt?.toISOString(),
      rejectionReason: record.rejectionReason,
    }));

    return NextResponse.json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords,
    });
  } catch (error) {
    console.error("Error fetching KYC records:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch KYC records",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
