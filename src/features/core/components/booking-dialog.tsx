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

    setLoading(true);

    try {
      // Create booking request directly without payment
      const bookingData = {
        vehicleId: vehicle.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        contactPhone: formData.contactPhone,
        pickupTime: formData.pickupTime,
        specialRequests: formData.specialRequests,
        totalAmount,
        totalDays,
      };

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const result = await response.json();
      
      toast.success("Booking request submitted successfully! The owner will review and respond to your request.");
      
      // Reset form and close dialog
      setFormData({
        startDate: "",
        endDate: "",
        contactPhone: "",
        pickupTime: "",
        specialRequests: "",
      });
      setOpen(false);

    } catch (error) {
      console.error("Booking creation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setFormData({
      startDate: "",
      endDate: "",
      contactPhone: "",
      pickupTime: "",
      specialRequests: "",
    });
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
          <DialogTitle>Book {vehicle.brand} {vehicle.model}</DialogTitle>
          <DialogDescription>
            Fill in the details below to request a booking. The owner will review and respond to your request.
          </DialogDescription>
        </DialogHeader>

        <div>
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
                  <span>Estimated Total:</span>
                  <span className="text-green-600">Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  * Payment will be arranged directly with the owner after booking confirmation
                </p>
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
                {loading ? "Submitting..." : "Submit Booking Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}