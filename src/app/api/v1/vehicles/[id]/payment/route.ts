import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/features/core/lib/prisma";
import { authOptions } from "@/features/core/lib/auth";
import axios from "axios";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const vehicleId = params.id;

    // Check if vehicle exists and belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if vehicle is accepted for payment
    if (vehicle.verificationStatus !== "ACCEPTED_FOR_PAYMENT") {
      return NextResponse.json(
        { error: "Vehicle is not accepted for payment" },
        { status: 400 }
      );
    }

    // Check if payment is already completed
    if (vehicle.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Payment already completed" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.KHALTI_SECRET_KEY) {
      return NextResponse.json(
        { error: "Khalti secret key not configured" },
        { status: 500 }
      );
    }

    if (!process.env.NEXTAUTH_URL) {
      return NextResponse.json(
        { error: "NextAuth URL not configured" },
        { status: 500 }
      );
    }

    // Validate Khalti secret key format (should be 32 characters)
    if (process.env.KHALTI_SECRET_KEY.length !== 32) {
      return NextResponse.json(
        { 
          error: "Invalid Khalti secret key format",
          keyLength: process.env.KHALTI_SECRET_KEY.length,
          expected: 32
        },
        { status: 500 }
      );
    }

    // For testing, use a standard test amount that Khalti accepts
    // In production, you would use the actual verification fee
    const isTestMode = process.env.NODE_ENV !== 'production';
    let amountInPaisa;
    
    if (isTestMode) {
      // Use Khalti's recommended test amount
      amountInPaisa = 100000; // NPR 1000 in paisa (common test amount)
    } else {
      amountInPaisa = Math.round(vehicle.verificationFee * 100);
    }
    
    // Khalti minimum is usually NPR 10 (1000 paisa) and maximum varies
    if (amountInPaisa < 1000) {
      return NextResponse.json(
        { error: "Amount too low for Khalti payment (minimum NPR 10)" },
        { status: 400 }
      );
    }

    if (amountInPaisa > 100000000) { // 1 million NPR in paisa
      return NextResponse.json(
        { error: "Amount too high for Khalti payment" },
        { status: 400 }
      );
    }

    // Initiate Khalti payment
    const formData = {
      return_url: `${process.env.NEXTAUTH_URL}/owner/vehicles/payment/success`,
      website_url: process.env.NEXTAUTH_URL,
      amount: amountInPaisa,
      purchase_order_id: `vehicle_${vehicleId}_${Date.now()}`, // Make it unique
      purchase_order_name: `Vehicle Verification Fee`,
    };

    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    console.log("Khalti payment request:", {
      url: "https://a.khalti.com/api/v2/epayment/initiate/",
      formData,
      headers: { ...headers, Authorization: "Key [HIDDEN]" },
      originalAmount: vehicle.verificationFee,
      amountInPaisa,
      isTestMode
    });

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      formData,
      { headers }
    );

    // Update vehicle with payment ID
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        paymentId: response.data.pidx,
      },
    });

    return NextResponse.json({
      message: "Payment initiated successfully",
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (error: any) {
    console.error("Error initiating vehicle payment:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    
    if (error.response?.data) {
      return NextResponse.json(
        {
          error: "Payment initialization failed",
          details: error.response.data,
          khalti_error: error.response.data,
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to initiate payment",
        message: error.message,
        khalti_secret_exists: !!process.env.KHALTI_SECRET_KEY,
        nextauth_url_exists: !!process.env.NEXTAUTH_URL,
      },
      { status: 500 }
    );
  }
}