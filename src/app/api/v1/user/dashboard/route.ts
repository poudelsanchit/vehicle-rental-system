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

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        vehicle: {
          select: {
            title: true,
            brand: true,
            model: true,
            type: true,
            category: true,
            vehicleFrontPhoto: true,
            pricePerDay: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING").length;
    const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;
    const cancelledBookings = bookings.filter(b => b.status === "CANCELLED").length;

    // Calculate total spent
    const totalSpent = bookings
      .filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Calculate monthly spending (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySpent = bookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear &&
               (b.status === "COMPLETED" || b.status === "CONFIRMED");
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Generate monthly spending chart data (last 6 months)
    const monthlySpendingChart = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthSpending = bookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate.getMonth() === month && 
                 bookingDate.getFullYear() === year &&
                 (b.status === "COMPLETED" || b.status === "CONFIRMED");
        })
        .reduce((sum, b) => sum + b.totalAmount, 0);
      
      monthlySpendingChart.push({
        month: monthNames[month],
        amount: monthSpending,
      });
    }

    // Booking status chart data
    const bookingStatusChart = [
      { 
        status: "Active", 
        count: activeBookings, 
        fill: "#3b82f6" 
      },
      { 
        status: "Completed", 
        count: completedBookings, 
        fill: "#22c55e" 
      },
      { 
        status: "Cancelled", 
        count: cancelledBookings, 
        fill: "#ef4444" 
      },
    ];

    // Vehicle type preference
    const vehicleTypePreference = bookings.reduce((acc, booking) => {
      const type = booking.vehicle.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
    const vehicleTypeChart = Object.entries(vehicleTypePreference).map(([type, count], index) => ({
      type,
      count,
      fill: colors[index % colors.length],
    }));

    // Recent bookings (last 5)
    const recentBookings = bookings
      .slice(0, 5)
      .map(booking => ({
        id: booking.id,
        vehicleName: `${booking.vehicle.brand} ${booking.vehicle.model}`,
        ownerName: booking.vehicle.user.username,
        bookingDate: booking.createdAt.toISOString().split('T')[0],
        startDate: booking.startDate.toISOString().split('T')[0],
        endDate: booking.endDate.toISOString().split('T')[0],
        amount: booking.totalAmount,
        status: booking.status.toLowerCase(),
        vehicleImage: booking.vehicle.vehicleFrontPhoto,
      }));

    // Favorite vehicles (most booked)
    const vehicleBookingCounts = bookings.reduce((acc, booking) => {
      const vehicleKey = `${booking.vehicle.brand} ${booking.vehicle.model}`;
      if (!acc[vehicleKey]) {
        acc[vehicleKey] = {
          vehicleName: vehicleKey,
          type: booking.vehicle.type,
          category: booking.vehicle.category,
          bookingCount: 0,
          totalSpent: 0,
          image: booking.vehicle.vehicleFrontPhoto,
        };
      }
      acc[vehicleKey].bookingCount += 1;
      if (booking.status === "COMPLETED" || booking.status === "CONFIRMED") {
        acc[vehicleKey].totalSpent += booking.totalAmount;
      }
      return acc;
    }, {} as Record<string, any>);

    const favoriteVehicles = Object.values(vehicleBookingCounts)
      .sort((a: any, b: any) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    const dashboardData = {
      // Overview Stats
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,

      // Spending Stats
      totalSpent,
      monthlySpent,

      // Chart Data
      monthlySpendingChart,
      bookingStatusChart,
      vehicleTypeChart,
      recentBookings,
      favoriteVehicles,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}