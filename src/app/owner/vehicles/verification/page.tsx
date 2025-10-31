"use client";

import { useState, useEffect } from "react";
import { Button } from "@/features/core/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card";
import { Badge } from "@/features/core/components/badge";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  verificationStatus: string;
  paymentStatus: string;
  verificationFee: number;
  rejectionReason?: string;
  createdAt: string;
}

export default function VehicleVerification() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      console.log("Fetching vehicles for verification...");
      const response = await fetch("/api/v1/owner/vehicles");
      console.log("Vehicles response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Vehicles data:", data);
        setVehicles(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch vehicles:", errorData);
        toast.error("Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (vehicleId: string) => {
    setPaymentLoading(vehicleId);
    try {
      console.log("Initiating payment for vehicle:", vehicleId);
      const response = await fetch(`/api/v1/vehicles/${vehicleId}/payment`, {
        method: "POST",
      });

      console.log("Payment response status:", response.status);
      const data = await response.json();
      console.log("Payment response data:", data);

      if (response.ok) {
        // Redirect to Khalti payment page
        window.location.href = data.payment_url;
      } else {
        console.error("Payment initiation failed:", data);
        toast.error(data.error || "Failed to initiate payment");
        if (data.details) {
          console.error("Khalti error details:", data.details);
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Error initiating payment");
    } finally {
      setPaymentLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Under Review" },
      ACCEPTED_FOR_PAYMENT: { variant: "default" as const, label: "Payment Required" },
      REJECTED: { variant: "destructive" as const, label: "Rejected" },
      APPROVED: { variant: "default" as const, label: "Approved" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      UNPAID: { variant: "secondary" as const, label: "Unpaid" },
      PAID: { variant: "default" as const, label: "Paid" },
      FAILED: { variant: "destructive" as const, label: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNPAID;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="p-6">Loading vehicles...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vehicle Verification Status</h1>
        <Button onClick={fetchVehicles} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {vehicle.title} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Registration: {vehicle.registrationNumber}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(vehicle.verificationStatus)}
                  {getPaymentBadge(vehicle.paymentStatus)}
                  <span className="text-sm font-medium">
                    Verification Fee: NPR {vehicle.verificationFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.verificationStatus === "PENDING" && (
                  <div className="p-3 bg-background border border-border rounded-md">
                    <p className="text-sm ">
                      Your vehicle is under review by our admin team. You will be notified once the review is complete.
                    </p>
                  </div>
                )}

                {vehicle.verificationStatus === "REJECTED" && vehicle.rejectionReason && (
                  <div className="p-3 bg-background border border-border  rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {vehicle.rejectionReason}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Please contact support or resubmit your vehicle with the required corrections.
                    </p>
                  </div>
                )}

                {vehicle.verificationStatus === "ACCEPTED_FOR_PAYMENT" &&
                  vehicle.paymentStatus === "UNPAID" && (
                    <div className="space-y-3">
                      <div className="p-3 bg-background border border-border  rounded-md">
                        <p className="text-sm">
                          Great! Your vehicle has been approved for verification.
                          Please complete the payment to finalize the verification process.
                        </p>
                      </div>
                      <Button
                        onClick={() => initiatePayment(vehicle.id)}
                        disabled={paymentLoading === vehicle.id}
                        className="w-full"
                      >
                        {paymentLoading === vehicle.id
                          ? "Processing..."
                          : `Pay NPR ${vehicle.verificationFee.toLocaleString()}`
                        }
                      </Button>
                    </div>
                  )}

                {vehicle.verificationStatus === "ACCEPTED_FOR_PAYMENT" &&
                  vehicle.paymentStatus === "PAID" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        Payment completed successfully! Your vehicle is now pending final approval.
                      </p>
                    </div>
                  )}

                {vehicle.verificationStatus === "APPROVED" && (
                  <div className="p-3  border text-white rounded-md">
                    <p className="text-sm ">
                      🎉 Congratulations! Your vehicle has been approved and is now available for booking.
                    </p>
                  </div>
                )}

                {vehicle.paymentStatus === "FAILED" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      Payment failed. Please try again or contact support if the issue persists.
                    </p>
                    <Button
                      onClick={() => initiatePayment(vehicle.id)}
                      disabled={paymentLoading === vehicle.id}
                      className="mt-2 w-full"
                      variant="outline"
                    >
                      Retry Payment
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Submitted: {new Date(vehicle.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {vehicles.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No vehicles found. Add a vehicle to start the verification process.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}