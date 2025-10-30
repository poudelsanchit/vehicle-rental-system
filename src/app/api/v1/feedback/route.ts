import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/features/core/lib/prisma";
import { authOptions } from "@/features/core/lib/auth";

// POST - Create feedback for a completed booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const {
      bookingId,
      vehicleRating,
      serviceRating,
      overallRating,
      vehicleReview,
      serviceReview,
      wouldRecommend,
    } = await request.json();

    // Validate required fields
    if (!bookingId || !vehicleRating || !serviceRating || !overallRating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating values (1-5)
    if (
      vehicleRating < 1 || vehicleRating > 5 ||
      serviceRating < 1 || serviceRating > 5 ||
      overallRating < 1 || overallRating > 5
    ) {
      return NextResponse.json(
        { error: "Ratings must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
        status: "COMPLETED", // Only allow feedback for completed bookings
      },
      include: {
        vehicle: true,
        feedback: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or not completed" },
        { status: 404 }
      );
    }

    // Check if feedback already exists
    if (booking.feedback) {
      return NextResponse.json(
        { error: "Feedback already submitted for this booking" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        bookingId,
        userId: user.id,
        vehicleId: booking.vehicleId,
        vehicleRating,
        serviceRating,
        overallRating,
        vehicleReview: vehicleReview || null,
        serviceReview: serviceReview || null,
        wouldRecommend: wouldRecommend || false,
      },
    });

    return NextResponse.json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}

// GET - Fetch feedback for a specific vehicle or user's feedback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const userId = searchParams.get("userId");

    if (!vehicleId && !userId) {
      return NextResponse.json(
        { error: "Either vehicleId or userId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (vehicleId) whereClause.vehicleId = vehicleId;
    if (userId) whereClause.userId = userId;

    const feedback = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            user: {
              select: {
                username: true,
              },
            },
            vehicle: {
              select: {
                title: true,
                brand: true,
                model: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average ratings if fetching for a vehicle
    if (vehicleId && feedback.length > 0) {
      const avgVehicleRating = feedback.reduce((sum, f) => sum + f.vehicleRating, 0) / feedback.length;
      const avgServiceRating = feedback.reduce((sum, f) => sum + f.serviceRating, 0) / feedback.length;
      const avgOverallRating = feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length;
      const recommendationRate = (feedback.filter(f => f.wouldRecommend).length / feedback.length) * 100;

      return NextResponse.json({
        feedback,
        statistics: {
          totalReviews: feedback.length,
          avgVehicleRating: Math.round(avgVehicleRating * 10) / 10,
          avgServiceRating: Math.round(avgServiceRating * 10) / 10,
          avgOverallRating: Math.round(avgOverallRating * 10) / 10,
          recommendationRate: Math.round(recommendationRate),
        },
      });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}