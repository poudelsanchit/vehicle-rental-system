import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/features/core/lib/prisma";
import { authOptions } from "@/features/core/lib/auth";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { pidx } = await request.json();

    if (!pidx) {
      return NextResponse.json(
        { error: "Payment ID (pidx) is required" },
        { status: 400 }
      );
    }

    // Find vehicle with this payment ID
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        paymentId: pidx,
        userId: session.user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found for this payment" },
        { status: 404 }
      );
    }

    // Verify payment with Khalti
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const verifyResponse = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers }
    );

    const paymentData = verifyResponse.data;

    if (paymentData.status === "Completed") {
      // Update vehicle payment status
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          paymentStatus: "PAID",
        },
      });

      return NextResponse.json({
        message: "Payment verified successfully",
        status: "success",
        vehicle: {
          id: vehicle.id,
          title: vehicle.title,
          verificationFee: vehicle.verificationFee,
        },
      });
    } else {
      // Update payment status as failed
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.json(
        {
          error: "Payment verification failed",
          status: paymentData.status,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error verifying vehicle payment:", error);
    
    if (error.response?.data) {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: error.response.data,
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}