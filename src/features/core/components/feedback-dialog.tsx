"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/core/components/dialog";
import { Button } from "@/features/core/components/button";
import { Textarea } from "@/features/core/components/textarea";
import { Label } from "@/features/core/components/label";
import { Checkbox } from "@/features/core/components/checkbox";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  vehicle: {
    title: string;
    brand: string;
    model: string;
  };
}

interface FeedbackDialogProps {
  booking: Booking;
  children: React.ReactNode;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackDialog({ booking, children, onFeedbackSubmitted }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleRating: 0,
    serviceRating: 0,
    overallRating: 0,
    vehicleReview: "",
    serviceReview: "",
    wouldRecommend: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.vehicleRating === 0 || formData.serviceRating === 0 || formData.overallRating === 0) {
      toast.error("Please provide all ratings");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      toast.success("Thank you for your feedback!");

      // Reset form and close dialog
      setFormData({
        vehicleRating: 0,
        serviceRating: 0,
        overallRating: 0,
        vehicleReview: "",
        serviceReview: "",
        wouldRecommend: false,
      });
      setOpen(false);

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      vehicleRating: 0,
      serviceRating: 0,
      overallRating: 0,
      vehicleReview: "",
      serviceReview: "",
      wouldRecommend: false,
    });
    setOpen(false);
  };

  const StarRating = ({
    rating,
    onRatingChange,
    label
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            Share your feedback about {booking.vehicle.brand} {booking.vehicle.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Rating */}
          <StarRating
            rating={formData.vehicleRating}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, vehicleRating: rating }))}
            label="Vehicle Condition & Quality"
          />

          {/* Service Rating */}
          <StarRating
            rating={formData.serviceRating}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, serviceRating: rating }))}
            label="Service Experience"
          />

          {/* Overall Rating */}
          <StarRating
            rating={formData.overallRating}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, overallRating: rating }))}
            label="Overall Experience"
          />

          {/* Vehicle Review */}
          <div className="space-y-2">
            <Label htmlFor="vehicleReview">Vehicle Review (Optional)</Label>
            <Textarea
              id="vehicleReview"
              placeholder="Tell us about the vehicle condition, cleanliness, performance..."
              value={formData.vehicleReview}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleReview: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Service Review */}
          <div className="space-y-2">
            <Label htmlFor="serviceReview">Service Review (Optional)</Label>
            <Textarea
              id="serviceReview"
              placeholder="Tell us about the booking process, owner communication, pickup/return experience..."
              value={formData.serviceReview}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceReview: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Recommendation */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wouldRecommend"
              checked={formData.wouldRecommend}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, wouldRecommend: checked as boolean }))
              }
            />
            <Label htmlFor="wouldRecommend">
              I would recommend this vehicle to others
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}