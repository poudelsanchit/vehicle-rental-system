"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/features/core/components/badge";
import { Card, CardContent } from "@/features/core/components/card";
import { Skeleton } from "@/features/core/components/skeleton";
import BookingsTable from "@/features/owner/bookings/components/BookingsTable";
import { toast } from "sonner";

interface BookingData {
    id: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    contactPhone: string;
    pickupTime: string;
    specialRequests?: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        email: string;
        kyc?: {
            phoneNumber: string;
            fullName: string;
        };
    };
    vehicle: {
        id: string;
        title: string;
        brand: string;
        model: string;
        year: number;
        registrationNumber: string;
        pricePerDay: number;
        vehicleFrontPhoto: string;
    };
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch("/api/v1/owner/bookings");
            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            setBookings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        try {
            const response = await fetch(`/api/v1/owner/bookings/${bookingId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update booking");
            }

            toast.success(`Booking ${status.toLowerCase()} successfully!`);
            fetchBookings(); // Refresh the list
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update booking");
        }
    };

    const getStatusCounts = () => {
        return {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'PENDING').length,
            confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
            completed: bookings.filter(b => b.status === 'COMPLETED').length,
            cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen py-2">
                <div className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </div>
                    </div>
                </div>
                <Card>
                    <CardContent>
                        <div className="mb-4 flex items-center gap-4">
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-2">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-200">{error}</p>
                </div>
            </div>
        );
    }

    const statusCounts = getStatusCounts();

    return (
        <div className="min-h-screen py-2">
            <div className="mb-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="sm:text-3xl text-2xl font-bold">Bookings Management</h1>
                        <p className="sm:mt-2 mt-1">
                            Manage all of your vehicle bookings here
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{statusCounts.total}</div>
                        <p className="text-sm text-gray-200">Total Bookings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
                        <p className="text-sm text-gray-200">Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</div>
                        <p className="text-sm text-gray-200">Confirmed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{statusCounts.completed}</div>
                        <p className="text-sm text-gray-200">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
                        <p className="text-sm text-gray-200">Cancelled</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent>
                    <div className="mb-4 flex items-center gap-4">
                        <Badge variant="outline" className="text-sm ">
                            Total Bookings: {statusCounts.total}
                        </Badge>
                        <Badge variant="outline" className="text-sm bg-yellow-50 text-yellow-700">
                            Pending: {statusCounts.pending}
                        </Badge>
                    </div>
                    <BookingsTable
                        bookings={bookings}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </CardContent>
            </Card>
        </div>
    );
}