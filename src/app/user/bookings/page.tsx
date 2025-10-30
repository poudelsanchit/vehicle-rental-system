"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/core/components/card";
import { Badge } from "@/features/core/components/badge";
import { Button } from "@/features/core/components/button";
import { Skeleton } from "@/features/core/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/features/core/components/alert-dialog";
import { toast } from "sonner";
import { FeedbackDialog } from "@/features/core/components/feedback-dialog";
import { Star } from "lucide-react";

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  contactPhone: string;
  pickupTime: string;
  specialRequests?: string;
  createdAt: string;
  pickupLocation: string;
  feedback?: {
    id: string;
    overallRating: number;
  };
  vehicle: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    vehicleFrontPhoto: string;
    pricePerDay: number;
    pickupLocation: string;
    user: {
      username: string;
      email: string;
    };
  };
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/v1/bookings");
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

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const response = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex">
                <Skeleton className="h-32 w-48" />
                <div className="flex-1 p-6">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">
          Manage your vehicle bookings ({bookings.length} total)
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No bookings found</h2>
          <p className="text-gray-600 mb-4">You haven't made any bookings yet</p>
          <Button onClick={() => window.location.href = "/user/vehicles"}>
            Browse Vehicles
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-32 md:w-48">
                  <Image
                    src={booking.vehicle.vehicleFrontPhoto}
                    alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <CardTitle className="text-xl mb-1">
                        {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})
                      </CardTitle>
                      <CardDescription>{booking.vehicle.title}</CardDescription>
                    </div>
                    <Badge className={statusColors[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="font-medium text-sm text-gray-500">Start Date</span>
                      <p className="font-semibold">{format(new Date(booking.startDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-500">End Date</span>
                      <p className="font-semibold">{format(new Date(booking.endDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-500">Duration</span>
                      <p className="font-semibold">{booking.totalDays} day{booking.totalDays > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-500">Total Amount</span>
                      <p className="font-semibold text-green-600">Rs. {booking.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Pickup Location:</span>
                      <p>{booking.pickupLocation}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Pickup Time:</span>
                      <p>{booking.pickupTime}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Contact:</span>
                      <p>{booking.contactPhone}</p>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mb-4">
                      <span className="font-medium text-sm text-gray-500">Special Requests:</span>
                      <p className="text-sm mt-1">{booking.specialRequests}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      <p>Booked on: {format(new Date(booking.createdAt), "MMM dd, yyyy 'at' HH:mm")}</p>
                      <p>Owner: {booking.vehicle.user.username}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {booking.status === "COMPLETED" && !booking.feedback && (
                        <FeedbackDialog 
                          booking={booking} 
                          onFeedbackSubmitted={fetchBookings}
                        >
                          <Button size="sm" variant="outline">
                            <Star className="h-4 w-4 mr-1" />
                            Rate Experience
                          </Button>
                        </FeedbackDialog>
                      )}
                      
                      {booking.status === "COMPLETED" && booking.feedback && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>Rated {booking.feedback.overallRating}/5</span>
                        </div>
                      )}

                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={cancellingId === booking.id}
                            >
                              {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this booking? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelBooking(booking.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Cancel Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}