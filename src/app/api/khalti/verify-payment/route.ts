import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { pidx, bookingData } = await request.json();

    if (!pidx) {
      return NextResponse.json(
        { message: "Payment ID (pidx) is required" },
        { status: 400 }
      );
    }

    // Verify payment with Khalti
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const verificationResponse = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers }
    );

    const paymentData = verificationResponse.data;

    // Check if payment was successful
    if (paymentData.status === "Completed") {
      // Payment successful, create the booking
      try {
        // Validate booking data
        const {
          userId,
          vehicleId,
          startDate,
          endDate,
          contactPhone,
          pickupTime,
          specialRequests,
          totalAmount,
          totalDays,
        } = bookingData;

        // Verify the payment amount matches the booking amount
        const paidAmount = paymentData.total_amount / 100; // Convert from paisa to rupees
        if (Math.abs(paidAmount - totalAmount) > 1) { // Allow 1 rupee difference for rounding
          return NextResponse.json(
            { message: "Payment amount mismatch" },
            { status: 400 }
          );
        }

        // Check if vehicle exists and is available
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId },
        });

        if (!vehicle || !vehicle.available) {
          return NextResponse.json(
            { message: "Vehicle is not available" },
            { status: 400 }
          );
        }

        // Check for conflicting bookings
        const start = new Date(startDate);
        const end = new Date(endDate);

        const conflictingBooking = await prisma.booking.findFirst({
          where: {
            vehicleId,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            OR: [
              {
                AND: [
                  { startDate: { lte: start } },
                  { endDate: { gte: start } },
                ],
              },
              {
                AND: [
                  { startDate: { lte: end } },
                  { endDate: { gte: end } },
                ],
              },
              {
                AND: [
                  { startDate: { gte: start } },
                  { endDate: { lte: end } },
                ],
              },
            ],
          },
        });

        if (conflictingBooking) {
          return NextResponse.json(
            { message: "Vehicle is already booked for the selected dates" },
            { status: 400 }
          );
        }

        // Create the booking with payment information
        const booking = await prisma.booking.create({
          data: {
            userId,
            vehicleId,
            startDate: start,
            endDate: end,
            totalDays,
            totalAmount,
            contactPhone,
            pickupTime,
            specialRequests: specialRequests || null,
            status: "PENDING", // Owner still needs to confirm
            // Store payment information in a JSON field or create separate payment table
          },
          include: {
            vehicle: {
              select: {
                title: true,
                brand: true,
                model: true,
                year: true,
                vehicleFrontPhoto: true,
                pickupLocation: true,
                user: {
                  select: {
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        return NextResponse.json({
          message: "Payment verified and booking created successfully",
          booking,
          paymentData: {
            pidx: paymentData.pidx,
            status: paymentData.status,
            amount: paidAmount,
            transaction_id: paymentData.transaction_id,
          },
        });

      } catch (bookingError) {
        console.error("Error creating booking after payment:", bookingError);
        return NextResponse.json(
          { message: "Payment successful but booking creation failed", paymentData },
          { status: 500 }
        );
      }

    } else {
      return NextResponse.json(
        { 
          message: "Payment not completed", 
          status: paymentData.status,
          paymentData 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: "Error verifying payment", error: error },
      { status: 500 }
    );
  }
}