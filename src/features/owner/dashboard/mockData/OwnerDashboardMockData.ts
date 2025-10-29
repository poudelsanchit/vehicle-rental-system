// Interface for Owner Dashboard Data
export interface IOwnerDashboardData {
  // Overview Stats
  totalVehicles: number;
  availableVehicles: number;
  bookedVehicles: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;

  // Revenue Stats
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  completedPayments: number;

  // Monthly Revenue Chart Data
  monthlyRevenueChart: {
    month: string;
    revenue: number;
  }[];

  // Booking Status Chart Data
  bookingStatusChart: {
    status: string;
    count: number;
    fill: string;
  }[];

  // Vehicle Type Distribution
  vehicleTypeChart: {
    type: string;
    count: number;
    fill: string;
  }[];

  // Recent Bookings
  recentBookings: {
    id: string;
    vehicleName: string;
    renterName: string;
    bookingDate: string;
    amount: number;
    status: "active" | "completed" | "cancelled";
  }[];

  // Top Performing Vehicles
  topVehicles: {
    vehicleName: string;
    registrationNumber: string;
    totalBookings: number;
    totalRevenue: number;
  }[];
}

// Mock Data for Owner Dashboard
// Based on actual booking data with realistic calculations
export const OwnerDashboardMockData: IOwnerDashboardData = {
  // Overview Stats
  totalVehicles: 10,
  availableVehicles: 3,
  bookedVehicles: 7,
  totalBookings: 18, // Total historical bookings (10 current + 8 past)
  activeBookings: 7, // Currently active bookings
  completedBookings: 11, // Past completed bookings

  // Revenue Stats
  // Total from all current active bookings: 85000 + 40000 + 84500 + 36000 + 108000 + 38500 + 64000 = 456,000
  // Plus completed bookings revenue: ~680,000
  totalRevenue: 1136000, // NPR (Total revenue from all bookings)
  monthlyRevenue: 456000, // Current month (October - sum of active bookings)
  pendingPayments: 138500, // Pending from 3 bookings (40000 + 36000 + 38500 + 64000)
  completedPayments: 997500, // Completed payments

  // Monthly Revenue Chart Data (Last 6 months)
  // Realistic monthly variations based on tourist season
  monthlyRevenueChart: [
    { month: "May", revenue: 145000 }, // Post-tourist season
    { month: "Jun", revenue: 98000 }, // Low season
    { month: "Jul", revenue: 125000 }, // Monsoon season
    { month: "Aug", revenue: 165000 }, // Pre-festival season
    { month: "Sep", revenue: 218000 }, // Festival season starting
    { month: "Oct", revenue: 385000 }, // Peak tourist season (current)
  ],

  // Booking Status Distribution
  bookingStatusChart: [
    { status: "Active", count: 7, fill: "#3b82f6" },
    { status: "Completed", count: 11, fill: "#22c55e" },
    { status: "Cancelled", count: 0, fill: "#ef4444" },
  ],

  // Vehicle Type Distribution (matches actual vehicle inventory)
  vehicleTypeChart: [
    { type: "SUV", count: 5, fill: "#3b82f6" }, // Scorpio, Creta, Fortuner, Kicks, Seltos
    { type: "Car", count: 2, fill: "#8b5cf6" }, // Civic, Swift
    { type: "Van", count: 1, fill: "#ec4899" }, // Hiace
    { type: "MPV", count: 2, fill: "#f59e0b" }, // Ertiga, (and counting one SUV)
  ],

  // Recent Bookings (Last 5 - matches actual booking data)
  recentBookings: [
    {
      id: "BK005",
      vehicleName: "Suzuki Swift",
      renterName: "Bikash Shrestha",
      bookingDate: "2025-10-28",
      amount: 36000, // 4500/day × 8 days
      status: "active",
    },
    {
      id: "BK009",
      vehicleName: "KIA Seltos",
      renterName: "Sarita Adhikari",
      bookingDate: "2025-10-26",
      amount: 64000, // 8000/day × 8 days
      status: "active",
    },
    {
      id: "BK002",
      vehicleName: "Honda Civic",
      renterName: "Priya Thapa",
      bookingDate: "2025-10-25",
      amount: 40000, // 5000/day × 8 days
      status: "active",
    },
    {
      id: "BK007",
      vehicleName: "Nissan Kicks",
      renterName: "Kavita Tamang",
      bookingDate: "2025-10-22",
      amount: 38500, // 5500/day × 7 days
      status: "active",
    },
    {
      id: "BK004",
      vehicleName: "Hyundai Creta",
      renterName: "Anita Rai",
      bookingDate: "2025-10-10",
      amount: 70000, // 7000/day × 10 days
      status: "completed",
    },
  ],

  // Top Performing Vehicles (Top 5)
  // Based on price per day and estimated booking frequency
  topVehicles: [
    {
      vehicleName: "Toyota Fortuner",
      registrationNumber: "BA-02-PA-4444",
      totalBookings: 5,
      totalRevenue: 324000, // 12000/day × avg 5.4 days/booking × 5 bookings
    },
    {
      vehicleName: "Ford Endeavour",
      registrationNumber: "BA-07-PA-8888",
      totalBookings: 4,
      totalRevenue: 299000, // 13000/day × avg 5.75 days/booking × 4 bookings
    },
    {
      vehicleName: "Toyota Hiace",
      registrationNumber: "BA-12-PA-5678",
      totalBookings: 3,
      totalRevenue: 204000, // 8500/day × avg 8 days/booking × 3 bookings
    },
    {
      vehicleName: "KIA Seltos",
      registrationNumber: "BA-11-PA-6666",
      totalBookings: 3,
      totalRevenue: 152000, // 8000/day × avg 6.3 days/booking × 3 bookings
    },
    {
      vehicleName: "Hyundai Creta",
      registrationNumber: "BA-05-PA-7777",
      totalBookings: 2,
      totalRevenue: 98000, // 7000/day × avg 7 days/booking × 2 bookings
    },
  ],
};
