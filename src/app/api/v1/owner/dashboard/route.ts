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

    // Get all vehicles owned by the user
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      include: {
        bookings: {
          include: {
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

    // Calculate overview stats
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.available && v.verificationStatus === "APPROVED").length;
    
    // Get all bookings for owner's vehicles
    const allBookings = vehicles.flatMap(v => v.bookings);
    const activeBookings = allBookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING");
    const completedBookings = allBookings.filter(b => b.status === "COMPLETED");
    const bookedVehicles = new Set(activeBookings.map(b => b.vehicleId)).size;

    // Calculate revenue stats
    const totalRevenue = allBookings
      .filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = allBookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear &&
               (b.status === "COMPLETED" || b.status === "CONFIRMED");
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const pendingPayments = allBookings
      .filter(b => b.status === "PENDING")
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const completedPayments = totalRevenue - pendingPayments;

    // Generate monthly revenue chart data (last 6 months)
    const monthlyRevenueChart = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthRevenue = allBookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate.getMonth() === month && 
                 bookingDate.getFullYear() === year &&
                 (b.status === "COMPLETED" || b.status === "CONFIRMED");
        })
        .reduce((sum, b) => sum + b.totalAmount, 0);
      
      monthlyRevenueChart.push({
        month: monthNames[month],
        revenue: monthRevenue,
      });
    }

    // Booking status chart data
    const bookingStatusChart = [
      { 
        status: "Active", 
        count: activeBookings.length, 
        fill: "#3b82f6" 
      },
      { 
        status: "Completed", 
        count: completedBookings.length, 
        fill: "#22c55e" 
      },
      { 
        status: "Cancelled", 
        count: allBookings.filter(b => b.status === "CANCELLED").length, 
        fill: "#ef4444" 
      },
    ];

    // Vehicle type distribution
    const vehicleTypeCounts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
    const vehicleTypeChart = Object.entries(vehicleTypeCounts).map(([type, count], index) => ({
      type,
      count,
      fill: colors[index % colors.length],
    }));

    // Recent bookings (last 5)
    const recentBookings = allBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(booking => {
        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
        return {
          id: booking.id,
          vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : "Unknown Vehicle",
          renterName: booking.user.username,
          bookingDate: booking.createdAt.toISOString().split('T')[0],
          amount: booking.totalAmount,
          status: booking.status.toLowerCase() as "active" | "completed" | "cancelled",
        };
      });

    // Top performing vehicles
    const vehiclePerformance = vehicles.map(vehicle => {
      const vehicleBookings = vehicle.bookings.filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED");
      const totalBookings = vehicleBookings.length;
      const totalRevenue = vehicleBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      
      return {
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        registrationNumber: vehicle.registrationNumber,
        totalBookings,
        totalRevenue,
      };
    })
    .filter(v => v.totalBookings > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

    const dashboardData = {
      // Overview Stats
      totalVehicles,
      availableVehicles,
      bookedVehicles,
      totalBookings: allBookings.length,
      activeBookings: activeBookings.length,
      completedBookings: completedBookings.length,

      // Revenue Stats
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      completedPayments,

      // Chart Data
      monthlyRevenueChart,
      bookingStatusChart,
      vehicleTypeChart,
      recentBookings,
      topVehicles: vehiclePerformance,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching owner dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}