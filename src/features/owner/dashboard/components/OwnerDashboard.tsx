"use client"

import { Car, DollarSign, Calendar, TrendingUp, Package, Clock } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/core/components/card"
import { Badge } from "@/features/core/components/badge"
import {
    ChartConfig, ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartContainer,
} from "@/features/core/components/chart"

// Interface for Owner Dashboard Data
export interface IOwnerDashboardData {
    totalVehicles: number
    availableVehicles: number
    bookedVehicles: number
    totalBookings: number
    activeBookings: number
    completedBookings: number
    totalRevenue: number
    monthlyRevenue: number
    pendingPayments: number
    completedPayments: number
    monthlyRevenueChart: {
        month: string
        revenue: number
    }[]
    bookingStatusChart: {
        status: string
        count: number
        fill: string
    }[]
    vehicleTypeChart: {
        type: string
        count: number
        fill: string
    }[]
    recentBookings: {
        id: string
        vehicleName: string
        renterName: string
        bookingDate: string
        amount: number
        status: 'active' | 'completed' | 'cancelled'
    }[]
    topVehicles: {
        vehicleName: string
        registrationNumber: string
        totalBookings: number
        totalRevenue: number
    }[]
}

interface IOwnerDashboardProps {
    dashboardData: IOwnerDashboardData
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
        minimumFractionDigits: 0,
    }).format(amount)
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const revenueChartConfig = {
    revenue: {
        label: "Revenue",
        color: "#3b82f6",
    },
} satisfies ChartConfig

const bookingStatusConfig = {
    count: {
        label: "Bookings",
    },
} satisfies ChartConfig

const vehicleTypeConfig = {
    count: {
        label: "Vehicles",
    },
} satisfies ChartConfig

export default function OwnerDashboard({ dashboardData }: IOwnerDashboardProps) {
    return (
        <div className="space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.totalVehicles}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">{dashboardData.availableVehicles} available</span>
                            {" • "}
                            <span className="text-orange-600">{dashboardData.bookedVehicles} booked</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(dashboardData.monthlyRevenue)} this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.totalBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-blue-600">{dashboardData.activeBookings} active</span>
                            {" • "}
                            <span className="text-gray-600">{dashboardData.completedBookings} completed</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(dashboardData.completedPayments)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-orange-600">{formatCurrency(dashboardData.pendingPayments)} pending</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Monthly Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                        <CardDescription>Revenue trend over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={revenueChartConfig}>
                            <BarChart data={dashboardData.monthlyRevenueChart}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Booking Status Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Status</CardTitle>
                        <CardDescription>Distribution of booking statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={bookingStatusConfig} className="h-[200px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Pie
                                    data={dashboardData.bookingStatusChart}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                >
                                    {dashboardData.bookingStatusChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Vehicle Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Types</CardTitle>
                        <CardDescription>Distribution by vehicle type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={vehicleTypeConfig} className="h-[200px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Pie
                                    data={dashboardData.vehicleTypeChart}
                                    dataKey="count"
                                    nameKey="type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                >
                                    {dashboardData.vehicleTypeChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Latest booking activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData.recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{booking.vehicleName}</p>
                                        <p className="text-sm text-muted-foreground">{booking.renterName}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(booking.bookingDate)}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm font-semibold">{formatCurrency(booking.amount)}</p>
                                        <Badge
                                            variant={
                                                booking.status === "active"
                                                    ? "default"
                                                    : booking.status === "completed"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                            className="text-xs"
                                        >
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performing Vehicles */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Vehicles</CardTitle>
                    <CardDescription>Vehicles with highest bookings and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dashboardData.topVehicles.map((vehicle, index) => (
                            <div key={vehicle.registrationNumber} className="flex items-center justify-between border-b pb-3 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{vehicle.vehicleName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{vehicle.registrationNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-semibold">{formatCurrency(vehicle.totalRevenue)}</p>
                                    <p className="text-xs text-muted-foreground">{vehicle.totalBookings} bookings</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}