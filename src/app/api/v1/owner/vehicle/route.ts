// app/api/vehicles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  uploadFiles,
  TEAM_NEW_MEMBER_CONFIG,
} from "@/features/core/hooks/file-upload";
import { authOptions } from "@/features/core/lib/auth";
import { prisma } from "@/features/core/lib/prisma";

// Custom config for vehicle documents and photos
const VEHICLE_UPLOAD_CONFIG = {
  ...TEAM_NEW_MEMBER_CONFIG,
  uploadPath: "public/vehicles",
  maxFiles: 1,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
};


export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const available = searchParams.get("available");

    // Build filter object
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (available !== null && available !== undefined) {
      where.available = available === "true";
    }

    // Fetch vehicles from database
    const vehicles = await prisma.vehicle.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: vehicles.length,
        data: vehicles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch vehicles error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch vehicles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


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

    // 2. Check if user is an OWNER
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "OWNER") {
      return NextResponse.json(
        {
          error:
            "Only vehicle owners can create vehicles. Please complete KYC verification first.",
        },
        { status: 403 }
      );
    }

    // 3. Parse form data
    const formData = await req.formData();

    // Extract text fields
    const title = formData.get("title") as string;
    const brand = formData.get("brand") as string;
    const model = formData.get("model") as string;
    const year = formData.get("year") as string;
    const type = formData.get("type") as string;
    const transmission = formData.get("transmission") as string;
    const fuelType = formData.get("fuelType") as string;
    const color = formData.get("color") as string;
    const seatingCapacity = formData.get("seatingCapacity") as string;
    const registrationNumber = formData.get("registrationNumber") as string;
    const pricePerDay = formData.get("pricePerDay") as string;
    const pickupLocation = formData.get("pickupLocation") as string;
    const insuranceValidTill = formData.get("insuranceValidTill") as string;

    // Validate required fields
    if (
      !title ||
      !brand ||
      !model ||
      !year ||
      !type ||
      !transmission ||
      !fuelType ||
      !color ||
      !seatingCapacity ||
      !registrationNumber ||
      !pricePerDay ||
      !pickupLocation ||
      !insuranceValidTill
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate enums
    if (!["CAR", "BIKE", "SUV", "VAN", "TRUCK"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid vehicle type" },
        { status: 400 }
      );
    }

    if (!["MANUAL", "AUTOMATIC"].includes(transmission)) {
      return NextResponse.json(
        { error: "Invalid transmission type" },
        { status: 400 }
      );
    }

    if (!["PETROL", "DIESEL", "ELECTRIC", "HYBRID"].includes(fuelType)) {
      return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 });
    }

    // Check if registration number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "A vehicle with this registration number already exists" },
        { status: 400 }
      );
    }

    // 4. Upload images
    const uploadedUrls: { [key: string]: string | null } = {
      bluebookImage: null,
      insuranceDocumentImage: null,
      vehicleFrontPhoto: null,
      vehicleBackPhoto: null,
      vehicleInteriorPhoto: null,
      vehicleSidePhoto: null,
    };

    // Upload bluebook image (required)
    const bluebookImageFile = formData.get("bluebookImage") as File;
    if (!bluebookImageFile || bluebookImageFile.size === 0) {
      return NextResponse.json(
        { error: "Bluebook image is required" },
        { status: 400 }
      );
    }

    const bluebookResult = await uploadFiles(
      [bluebookImageFile],
      VEHICLE_UPLOAD_CONFIG
    );

    if (!bluebookResult.success || bluebookResult.files.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to upload bluebook image",
          details: bluebookResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.bluebookImage = `/vehicles/${bluebookResult.files[0]}`;

    // Upload insurance document image (required)
    const insuranceImageFile = formData.get("insuranceDocumentImage") as File;
    if (!insuranceImageFile || insuranceImageFile.size === 0) {
      return NextResponse.json(
        { error: "Insurance document image is required" },
        { status: 400 }
      );
    }

    const insuranceResult = await uploadFiles(
      [insuranceImageFile],
      VEHICLE_UPLOAD_CONFIG
    );

    if (!insuranceResult.success || insuranceResult.files.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to upload insurance document image",
          details: insuranceResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.insuranceDocumentImage = `/vehicles/${insuranceResult.files[0]}`;

    // Upload vehicle front photo (required)
    const frontPhotoFile = formData.get("vehicleFrontPhoto") as File;
    if (!frontPhotoFile || frontPhotoFile.size === 0) {
      return NextResponse.json(
        { error: "Vehicle front photo is required" },
        { status: 400 }
      );
    }

    const frontPhotoResult = await uploadFiles(
      [frontPhotoFile],
      VEHICLE_UPLOAD_CONFIG
    );

    if (!frontPhotoResult.success || frontPhotoResult.files.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to upload vehicle front photo",
          details: frontPhotoResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.vehicleFrontPhoto = `/vehicles/${frontPhotoResult.files[0]}`;

    // Upload vehicle back photo (required)
    const backPhotoFile = formData.get("vehicleBackPhoto") as File;
    if (!backPhotoFile || backPhotoFile.size === 0) {
      return NextResponse.json(
        { error: "Vehicle back photo is required" },
        { status: 400 }
      );
    }

    const backPhotoResult = await uploadFiles(
      [backPhotoFile],
      VEHICLE_UPLOAD_CONFIG
    );

    if (!backPhotoResult.success || backPhotoResult.files.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to upload vehicle back photo",
          details: backPhotoResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.vehicleBackPhoto = `/vehicles/${backPhotoResult.files[0]}`;

    // Upload vehicle interior photo (required)
    const interiorPhotoFile = formData.get("vehicleInteriorPhoto") as File;
    if (!interiorPhotoFile || interiorPhotoFile.size === 0) {
      return NextResponse.json(
        { error: "Vehicle interior photo is required" },
        { status: 400 }
      );
    }

    const interiorPhotoResult = await uploadFiles(
      [interiorPhotoFile],
      VEHICLE_UPLOAD_CONFIG
    );

    if (
      !interiorPhotoResult.success ||
      interiorPhotoResult.files.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Failed to upload vehicle interior photo",
          details: interiorPhotoResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.vehicleInteriorPhoto = `/vehicles/${interiorPhotoResult.files[0]}`;

    // Upload vehicle side photo (required)
    const sidePhotoFile = formData.get("vehicleSidePhoto") as File;
    if (!sidePhotoFile || sidePhotoFile.size === 0) {
      return NextResponse.json(
        { error: "Vehicle side photo is required" },
        { status: 400 }
      );
    }

    const sidePhotoResult = await uploadFiles(
      [sidePhotoFile],
      VEHICLE_UPLOAD_CONFIG
    );

    if (!sidePhotoResult.success || sidePhotoResult.files.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to upload vehicle side photo",
          details: sidePhotoResult.errors,
        },
        { status: 500 }
      );
    }

    uploadedUrls.vehicleSidePhoto = `/vehicles/${sidePhotoResult.files[0]}`;

    // 5. Save to database
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: userId,
        title,
        brand,
        model,
        year: parseInt(year),
        type: type as "CAR" | "BIKE" | "SUV" | "VAN" | "TRUCK",
        transmission: transmission as "MANUAL" | "AUTOMATIC",
        fuelType: fuelType as "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID",
        color,
        seatingCapacity: parseInt(seatingCapacity),

        registrationNumber,
        pricePerDay: parseFloat(pricePerDay),
        available: false, // Vehicle unavailable until approved
        pickupLocation,

        // Verification fields
        verificationStatus: "PENDING",
        paymentStatus: "UNPAID",
        verificationFee: 500, // Fixed fee

        insuranceValidTill: new Date(insuranceValidTill),
        bluebookImage: uploadedUrls.bluebookImage!,
        insuranceDocumentImage: uploadedUrls.insuranceDocumentImage!,
        vehicleFrontPhoto: uploadedUrls.vehicleFrontPhoto!,
        vehicleBackPhoto: uploadedUrls.vehicleBackPhoto!,
        vehicleInteriorPhoto: uploadedUrls.vehicleInteriorPhoto!,
        vehicleSidePhoto: uploadedUrls.vehicleSidePhoto!,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Vehicle "${title}" has been created successfully and is pending verification. Please check the verification status page.`,
        data: {
          id: vehicle.id,
          title: vehicle.title,
          registrationNumber: vehicle.registrationNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vehicle creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create vehicle",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
