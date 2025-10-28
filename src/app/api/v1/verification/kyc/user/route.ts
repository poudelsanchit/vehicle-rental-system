// app/api/v1/verification/kyc/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  TEAM_NEW_MEMBER_CONFIG,
  uploadFiles,
} from "@/features/core/hooks/file-upload";
import { authOptions } from "@/features/core/lib/auth";
import { prisma } from "@/features/core/lib/prisma";

// Custom config for KYC documents
const KYC_UPLOAD_CONFIG = {
  ...TEAM_NEW_MEMBER_CONFIG,
  uploadPath: "public/kyc-documents",
  maxFiles: 1,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
};

export async function POST(req: NextRequest) {
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

    // 2. Check if KYC already exists
    const existingKYC = await prisma.kYC.findUnique({
      where: { userId },
    });

    if (existingKYC) {
      return NextResponse.json(
        { error: "KYC verification already submitted for this user." },
        { status: 400 }
      );
    }

    // 3. Parse form data
    const formData = await req.formData();

    // Extract text fields
    const fullName = formData.get("fullName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gender = formData.get("gender") as string;
    const nationality = formData.get("nationality") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const currentAddress = formData.get("currentAddress") as string;
    const permanentAddress = formData.get("permanentAddress") as string | null;
    const identityType = formData.get("identityType") as string;
    const identityNumber = formData.get("identityNumber") as string;

    // Driver's License fields (required for renters)
    const licenseNumber = formData.get("licenseNumber") as string;
    const licenseExpiryDate = formData.get("licenseExpiryDate") as string;

    // Emergency contact
    const emergencyContactName = formData.get("emergencyContactName") as string;
    const emergencyContactPhone = formData.get(
      "emergencyContactPhone"
    ) as string;
    const emergencyContactRelation = formData.get(
      "emergencyContactRelation"
    ) as string;

    // Validate required fields (including license fields for renters)
    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !nationality ||
      !phoneNumber ||
      !currentAddress ||
      !identityType ||
      !identityNumber ||
      !licenseNumber ||
      !licenseExpiryDate ||
      !emergencyContactName ||
      !emergencyContactPhone ||
      !emergencyContactRelation
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate enums
    if (!["MALE", "FEMALE", "OTHER"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }

    if (!["NATIONAL_ID", "CITIZENSHIP", "PASSPORT"].includes(identityType)) {
      return NextResponse.json(
        { error: "Invalid identity document type" },
        { status: 400 }
      );
    }

    // Validate license expiry date is in the future
    const expiryDate = new Date(licenseExpiryDate);
    if (expiryDate < new Date()) {
      return NextResponse.json(
        {
          error:
            "Driver's license has expired. Please provide a valid license.",
        },
        { status: 400 }
      );
    }

    // 4. Upload images
    const uploadedUrls: { [key: string]: string | null } = {
      identityPhoto: null,
      identityBackPhoto: null,
      profilePhoto: null,
      licenseFrontPhoto: null,
      licenseBackPhoto: null,
    };

    // Upload identity front photo (required)
    const identityPhotoFile = formData.get("identityPhoto") as File;
    if (!identityPhotoFile) {
      return NextResponse.json(
        { error: "Identity photo (front) is required" },
        { status: 400 }
      );
    }

    const identityPhotoResult = await uploadFiles(
      [identityPhotoFile],
      KYC_UPLOAD_CONFIG
    );

    if (
      !identityPhotoResult.success ||
      identityPhotoResult.files.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Failed to upload identity photo",
          details: identityPhotoResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.identityPhoto = `/kyc-documents/${identityPhotoResult.files[0]}`;

    // Upload identity back photo (optional)
    const identityBackPhotoFile = formData.get("identityBackPhoto") as File;
    if (identityBackPhotoFile && identityBackPhotoFile.size > 0) {
      const identityBackPhotoResult = await uploadFiles(
        [identityBackPhotoFile],
        KYC_UPLOAD_CONFIG
      );

      if (
        identityBackPhotoResult.success &&
        identityBackPhotoResult.files.length > 0
      ) {
        uploadedUrls.identityBackPhoto = `/kyc-documents/${identityBackPhotoResult.files[0]}`;
      }
    }

    // Upload profile photo (optional)
    const profilePhotoFile = formData.get("profilePhoto") as File;
    if (profilePhotoFile && profilePhotoFile.size > 0) {
      const profilePhotoResult = await uploadFiles(
        [profilePhotoFile],
        KYC_UPLOAD_CONFIG
      );

      if (profilePhotoResult.success && profilePhotoResult.files.length > 0) {
        uploadedUrls.profilePhoto = `/kyc-documents/${profilePhotoResult.files[0]}`;
      }
    }

    // Upload license front photo (required for renters)
    const licenseFrontPhotoFile = formData.get("licenseFrontPhoto") as File;
    if (!licenseFrontPhotoFile) {
      return NextResponse.json(
        { error: "Driver's license front photo is required" },
        { status: 400 }
      );
    }

    const licenseFrontPhotoResult = await uploadFiles(
      [licenseFrontPhotoFile],
      KYC_UPLOAD_CONFIG
    );

    if (
      !licenseFrontPhotoResult.success ||
      licenseFrontPhotoResult.files.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Failed to upload license front photo",
          details: licenseFrontPhotoResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.licenseFrontPhoto = `/kyc-documents/${licenseFrontPhotoResult.files[0]}`;

    // Upload license back photo (optional)
    const licenseBackPhotoFile = formData.get("licenseBackPhoto") as File;
    if (licenseBackPhotoFile && licenseBackPhotoFile.size > 0) {
      const licenseBackPhotoResult = await uploadFiles(
        [licenseBackPhotoFile],
        KYC_UPLOAD_CONFIG
      );

      if (
        licenseBackPhotoResult.success &&
        licenseBackPhotoResult.files.length > 0
      ) {
        uploadedUrls.licenseBackPhoto = `/kyc-documents/${licenseBackPhotoResult.files[0]}`;
      }
    }

    // 5. Save to database
    const kyc = await prisma.kYC.create({
      data: {
        userId,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender as "MALE" | "FEMALE" | "OTHER",
        nationality,
        phoneNumber,
        currentAddress,
        permanentAddress: permanentAddress || null,
        identityType: identityType as
          | "NATIONAL_ID"
          | "CITIZENSHIP"
          | "PASSPORT",
        identityNumber,
        identityPhotoUrl: uploadedUrls.identityPhoto!,
        identityBackPhotoUrl: uploadedUrls.identityBackPhoto,
        profilePhotoUrl: uploadedUrls.profilePhoto,
        // Driver's License fields
        licenseNumber,
        licenseExpiryDate: new Date(licenseExpiryDate),
        licenseFrontPhotoUrl: uploadedUrls.licenseFrontPhoto!,
        licenseBackPhotoUrl: uploadedUrls.licenseBackPhoto,
        // Emergency contact
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        status: "PENDING",
      },
    });

    // 6. Keep user role as USER (renters don't change to OWNER)
    // No role update needed for renters - they remain as USER

    return NextResponse.json(
      {
        success: true,
        message: "KYC verification submitted successfully",
        data: {
          id: kyc.id,
          status: kyc.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit KYC verification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check KYC status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kyc = await prisma.kYC.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
        // Include license info for renters
        licenseNumber: true,
        licenseExpiryDate: true,
      },
    });

    if (!kyc) {
      return NextResponse.json(
        { exists: false, message: "No KYC submission found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      data: kyc,
    });
  } catch (error) {
    console.error("Error fetching KYC:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
