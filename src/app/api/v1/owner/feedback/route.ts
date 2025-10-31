import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/features/core/lib/prisma";
import { authOptions } from "@/features/core/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all feedback for vehicles owned by this user
    const feedback = await prisma.feedback.findMany({
      where: {
        booking: {
          vehicle: {
            userId: userId,
          },
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
            vehicle: {
              select: {
                id: true,
                title: true,
                brand: true,
                model: true,
                year: true,
                vehicleFrontPhoto: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate overall statistics
    if (feedback.length > 0) {
      const avgVehicleRating = feedback.reduce((sum, f) => sum + f.vehicleRating, 0) / feedback.length;
      const avgServiceRating = feedback.reduce((sum, f) => sum + f.serviceRating, 0) / feedback.length;
      const avgOverallRating = feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length;
      const recommendationRate = (feedback.filter(f => f.wouldRecommend).length / feedback.length) * 100;

      // Group feedback by vehicle
      const vehicleStats = feedback.reduce((acc, f) => {
        const vehicleId = f.vehicleId;
        if (!acc[vehicleId]) {
          acc[vehicleId] = {
            vehicle: f.booking.vehicle,
            feedbackCount: 0,
            avgVehicleRating: 0,
            avgServiceRating: 0,
            avgOverallRating: 0,
            recommendationRate: 0,
            ratings: [],
          };
        }
        
        acc[vehicleId].feedbackCount += 1;
        acc[vehicleId].ratings.push({
          vehicleRating: f.vehicleRating,
          serviceRating: f.serviceRating,
          overallRating: f.overallRating,
          wouldRecommend: f.wouldRecommend,
        });

        return acc;
      }, {} as any);

      // Calculate averages for each vehicle
      Object.keys(vehicleStats).forEach(vehicleId => {
        const stats = vehicleStats[vehicleId];
        const ratings = stats.ratings;
        
        stats.avgVehicleRating = Math.round((ratings.reduce((sum: number, r: any) => sum + r.vehicleRating, 0) / ratings.length) * 10) / 10;
        stats.avgServiceRating = Math.round((ratings.reduce((sum: number, r: any) => sum + r.serviceRating, 0) / ratings.length) * 10) / 10;
        stats.avgOverallRating = Math.round((ratings.reduce((sum: number, r: any) => sum + r.overallRating, 0) / ratings.length) * 10) / 10;
        stats.recommendationRate = Math.round((ratings.filter((r: any) => r.wouldRecommend).length / ratings.length) * 100);
        
        delete stats.ratings; // Remove raw ratings from response
      });

      return NextResponse.json({
        feedback,
        statistics: {
          totalReviews: feedback.length,
          avgVehicleRating: Math.round(avgVehicleRating * 10) / 10,
          avgServiceRating: Math.round(avgServiceRating * 10) / 10,
          avgOverallRating: Math.round(avgOverallRating * 10) / 10,
          recommendationRate: Math.round(recommendationRate),
        },
        vehicleStats: Object.values(vehicleStats),
      });
    }

    return NextResponse.json({
      feedback: [],
      statistics: {
        totalReviews: 0,
        avgVehicleRating: 0,
        avgServiceRating: 0,
        avgOverallRating: 0,
        recommendationRate: 0,
      },
      vehicleStats: [],
    });
  } catch (error) {
    console.error("Error fetching owner feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}