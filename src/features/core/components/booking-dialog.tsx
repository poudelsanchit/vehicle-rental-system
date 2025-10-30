"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/core/components/dialog";
import { Button } from "@/features/core/components/button";
import { Input } from "@/features/core/components/input";
import { Label } from "@/features/core/components/label";
import { Textarea } from "@/features/core/components/textarea";
import { Badge } from "@/features/core/components/badge";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  pricePerDay: number;
  pickupLocation: string;
}

interface BookingDialogProps {
  vehicle: Vehicle;
  children: React.ReactNode;
}

export function BookingDialog({ vehicle, children }: BookingDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'booking' | 'payment' | 'processing'>('booking');
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    contactPhone: "",
    pickupTime: "",
    specialRequests: "",
  });

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return days > 0 ? days * vehicle.pricePerDay : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please login to make a booking");
      return;
    }

    if (totalDays <= 0 || totalAmount <= 0) {
      toast.error("Please select valid dates");
      return;
    }

    setPaymentStep('payment');
  };

  const handlePayment = async () => {
    // Prevent multiple clicks
    if (loading) return;

    setLoading(true);
    setPaymentStep('processing');

    try {
      if (!session?.user?.email) {
        throw new Error("User session not found");
      }

      // Get user details
      const userDetailsResponse = await fetch(`/api/v1/user/profile`);
      if (!userDetailsResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }
      const userData = await userDetailsResponse.json();

      // Generate unique booking identifier
      const uniqueBookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare booking data
      const bookingData = {
        userId: userData.id,
        vehicleId: vehicle.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        contactPhone: formData.contactPhone,
        pickupTime: formData.pickupTime,
        specialRequests: formData.specialRequests,
        totalAmount,
        totalDays,
      };

      // Store booking data in localStorage before payment
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

      // Initialize Khalti payment with unique identifier
      const paymentResponse = await fetch("/api/khalti/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount,
          patientId: uniqueBookingId,
          products: [
            {
              product: `${vehicle.brand} ${vehicle.model} - ${totalDays} days`,
              amount: totalAmount,
              quantity: 1
            },
          ],
          payment_method: "khalti",
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || "Failed to initialize payment");
      }

      const paymentData = await paymentResponse.json();

      // Small delay to ensure state is updated before redirect
      setTimeout(() => {
        window.location.href = paymentData.data.payment_url;
      }, 100);

    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initialize payment");
      setPaymentStep('booking');
      // Clear any stored booking data on error
      localStorage.removeItem('pendingBooking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPaymentStep('booking');
    setLoading(false); // Reset loading state
    setFormData({
      startDate: "",
      endDate: "",
      contactPhone: "",
      pickupTime: "",
      specialRequests: "",
    });
    // Clear any pending booking data
    localStorage.removeItem('pendingBooking');
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalDays = formData.startDate && formData.endDate
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalAmount = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {paymentStep === 'booking' && `Book ${vehicle.brand} ${vehicle.model}`}
            {paymentStep === 'payment' && 'Confirm Payment'}
            {paymentStep === 'processing' && 'Processing Payment...'}
          </DialogTitle>
          <DialogDescription>
            {paymentStep === 'booking' && 'Fill in the details below to book this vehicle'}
            {paymentStep === 'payment' && 'Review your booking details and proceed to payment'}
            {paymentStep === 'processing' && 'Please wait while we process your payment...'}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === 'booking' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  min={formData.startDate || format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pickupTime">Preferred Pickup Time</Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => handleInputChange("pickupTime", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requirements or notes..."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                rows={3}
              />
            </div>

            {totalDays > 0 && (
              <div className=" p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{totalDays} day{totalDays > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate per day:</span>
                  <span>Rs. {vehicle.pricePerDay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span className="text-green-600">Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || totalDays <= 0}
                className="flex-1"
              >
                Proceed to Payment
              </Button>
            </div>
          </form>
        )}

        {paymentStep === 'payment' && (
          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Booking Summary</h3>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Vehicle:</span></div>
                <div>{vehicle.brand} {vehicle.model}</div>

                <div><span className="font-medium">Dates:</span></div>
                <div>{format(new Date(formData.startDate), "MMM dd")} - {format(new Date(formData.endDate), "MMM dd, yyyy")}</div>

                <div><span className="font-medium">Duration:</span></div>
                <div>{totalDays} day{totalDays > 1 ? 's' : ''}</div>

                <div><span className="font-medium">Pickup Location:</span></div>
                <div>{vehicle.pickupLocation}</div>

                <div><span className="font-medium">Pickup Time:</span></div>
                <div>{formData.pickupTime}</div>

                <div><span className="font-medium">Contact:</span></div>
                <div>{formData.contactPhone}</div>
              </div>

              {formData.specialRequests && (
                <div>
                  <span className="font-medium text-sm">Special Requests:</span>
                  <p className="text-sm mt-1">{formData.specialRequests}</p>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Rate per day:</span>
                  <span>Rs. {vehicle.pricePerDay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-green-600">Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Khalti Payment
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                You will be redirected to Khalti to complete your payment securely.
                Your booking will be confirmed only after successful payment.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentStep('booking')}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Processing..." : "Pay with Khalti"}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to Khalti payment gateway...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}