import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/core/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const location = searchParams.get("location") || "";

    const currentDate = new Date();
    
    // Get user session for personalized recommendations
    const session = await getServerSession(authOptions);
    let userPreferredCategory: string | null = null;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          bookings: {
            where: {
              status: {
                in: ["CONFIRMED", "COMPLETED"],
              },
            },
            include: {
              vehicle: {
                select: {
                  category: true,
                },
              },
            },
          },
        },
      });
      
      // Determine user's preferred category based on booking history
      if (user && user.bookings.length > 0) {
        const categoryCount: Record<string, number> = {};
        
        user.bookings.forEach(booking => {
          const cat = booking.vehicle.category;
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        
        // Get the most booked category
        const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
        if (sortedCategories.length > 0) {
          userPreferredCategory = sortedCategories[0][0];
        }
      }
    }
    
    // Build where clause for filtering
    const whereClause: any = {
      available: true,
      verificationStatus: "APPROVED", // Only show approved vehicles
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add type filter
    if (type) {
      whereClause.type = type;
    }

    // Add category filter
    if (category) {
      whereClause.category = category;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      whereClause.pricePerDay = {};
      if (minPrice) whereClause.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.pricePerDay.lte = parseFloat(maxPrice);
    }

    // Add location filter
    if (location) {
      whereClause.pickupLocation = { contains: location, mode: "insensitive" };
    }

    // Get all vehicles matching the filters with feedback data
    const allVehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            endDate: {
              gte: currentDate, // Only consider bookings that haven't ended yet
            },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Filter vehicles based on date availability
    const availableVehicles = allVehicles.filter(vehicle => {
      // If no date range specified, check if vehicle is currently available (not booked for today)
      if (!startDate || !endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const hasCurrentBooking = vehicle.bookings.some(booking => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          
          // Check if today falls within any booking period
          return bookingStart <= today && bookingEnd > today;
        });
        
        return !hasCurrentBooking;
      }

      // Check if vehicle is available for the specified date range
      const requestStart = new Date(startDate);
      const requestEnd = new Date(endDate);

      const hasConflict = vehicle.bookings.some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        return (
          (bookingStart <= requestStart && bookingEnd > requestStart) ||
          (bookingStart < requestEnd && bookingEnd >= requestEnd) ||
          (bookingStart >= requestStart && bookingEnd <= requestEnd)
        );
      });

      return !hasConflict;
    });

    // Get feedback ratings for all available vehicles
    const vehicleIds = availableVehicles.map(v => v.id);
    const feedbackData = await prisma.feedback.groupBy({
      by: ['vehicleId'],
      where: {
        vehicleId: {
          in: vehicleIds,
        },
      },
      _avg: {
        overallRating: true,
      },
      _count: {
        id: true,
      },
    });
    
    // Create a map of vehicle ratings
    const ratingsMap = new Map(
      feedbackData.map(f => [
        f.vehicleId,
        {
          avgRating: f._avg.overallRating || 0,
          ratingCount: f._count.id,
        },
      ])
    );
    
    // Sort vehicles based on recommendation logic
    const sortedVehicles = availableVehicles.sort((a, b) => {
      // 1. Prioritize user's preferred category
      if (userPreferredCategory) {
        const aMatchesPreference = a.category === userPreferredCategory ? 1 : 0;
        const bMatchesPreference = b.category === userPreferredCategory ? 1 : 0;
        
        if (aMatchesPreference !== bMatchesPreference) {
          return bMatchesPreference - aMatchesPreference;
        }
      }
      
      // 2. Sort by average rating (higher is better)
      const aRating = ratingsMap.get(a.id)?.avgRating || 0;
      const bRating = ratingsMap.get(b.id)?.avgRating || 0;
      
      if (aRating !== bRating) {
        return bRating - aRating;
      }
      
      // 3. Sort by number of ratings (more reviews = more popular)
      const aCount = ratingsMap.get(a.id)?.ratingCount || 0;
      const bCount = ratingsMap.get(b.id)?.ratingCount || 0;
      
      if (aCount !== bCount) {
        return bCount - aCount;
      }
      
      // 4. Finally, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Remove the bookings data and add rating info to the response
    const vehiclesResponse = sortedVehicles.map(vehicle => {
      const { bookings, ...vehicleData } = vehicle;
      const ratingInfo = ratingsMap.get(vehicle.id);
      
      return {
        ...vehicleData,
        avgRating: ratingInfo?.avgRating || 0,
        ratingCount: ratingInfo?.ratingCount || 0,
      };
    });

    return NextResponse.json(vehiclesResponse);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}