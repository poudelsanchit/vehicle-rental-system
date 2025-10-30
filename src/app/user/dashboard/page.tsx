"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card";
import { Badge } from "@/features/core/components/badge";
import { Button } from "@/features/core/components/button";
import { toast } from "sonner";
import { Calendar, Car, CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

interface UserDashboardData {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  monthlySpent: number;
  monthlySpendingChart: { month: string; amount: number }[];
  bookingStatusChart: { status: string; count: number; fill: string }[];
  vehicleTypeChart: { type: string; count: number; fill: string }[];
  recentBookings: {
    id: string;
    vehicleName: string;
    ownerName: string;
    bookingDate: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: string;
    vehicleImage: string;
  }[];
  favoriteVehicles: {
    vehicleName: string;
    type: string;
    category: string;
    bookingCount: number;
    totalSpent: number;
    image: string;
  }[];
}

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/v1/user/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", icon: Clock },
      confirmed: { variant: "default" as const, label: "Confirmed", icon: CheckCircle },
      completed: { variant: "default" as const, label: "Completed", icon: CheckCircle },
      cancelled: { variant: "destructive" as const, label: "Cancelled", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardData.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              NPR {dashboardData.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NPR {dashboardData.monthlySpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current month spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.bookingStatusChart.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Type Preference */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Type Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.vehicleTypeChart.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm">{item.type}</span>
                  </div>
                  <span className="font-semibold">{item.count} bookings</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={booking.vehicleImage}
                    alt={booking.vehicleName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{booking.vehicleName}</h4>
                  <p className="text-sm text-gray-600">Owner: {booking.ownerName}</p>
                  <p className="text-sm text-gray-600">
                    {booking.startDate} to {booking.endDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">NPR {booking.amount.toLocaleString()}</p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
            {dashboardData.recentBookings.length === 0 && (
              <p className="text-center text-gray-500 py-8">No bookings yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Vehicles */}
      {dashboardData.favoriteVehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Booked Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.favoriteVehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.vehicleName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{vehicle.vehicleName}</h5>
                    <p className="text-xs text-gray-600">{vehicle.type} • {vehicle.category.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-600">
                      {vehicle.bookingCount} bookings • NPR {vehicle.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}