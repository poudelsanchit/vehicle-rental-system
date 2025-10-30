"use client";

import { useState, useEffect } from "react";
import { Button } from "@/features/core/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card";
import { Badge } from "@/features/core/components/badge";
import { Textarea } from "@/features/core/components/textarea";
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
  user: {
    username: string;
    email: string;
  };
  createdAt: string;
}

export default function VehiclesVerification() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/v1/admin/vehicles");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (vehicleId: string, status: string, reason?: string) => {
    try {
      const response = await fetch(`/api/v1/admin/vehicles/${vehicleId}/verification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          rejectionReason: reason,
        }),
      });

      if (response.ok) {
        toast.success(`Vehicle ${status.toLowerCase()} successfully`);
        fetchVehicles();
        setRejectionReason(prev => ({ ...prev, [vehicleId]: "" }));
      } else {
        toast.error("Failed to update verification status");
      }
    } catch (error) {
      toast.error("Error updating verification status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending" },
      ACCEPTED_FOR_PAYMENT: { variant: "default" as const, label: "Accepted for Payment" },
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
        <h1 className="text-3xl font-bold">Vehicle Verification</h1>
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
                  <p className="text-sm text-muted-foreground">
                    Owner: {vehicle.user.username} ({vehicle.user.email})
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(vehicle.verificationStatus)}
                  {getPaymentBadge(vehicle.paymentStatus)}
                  <span className="text-sm font-medium">
                    Fee: NPR {vehicle.verificationFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {vehicle.rejectionReason}
                    </p>
                  </div>
                )}

                {vehicle.verificationStatus === "PENDING" && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => updateVerificationStatus(vehicle.id, "ACCEPTED_FOR_PAYMENT")}
                      className="flex-1"
                    >
                      Accept for Payment
                    </Button>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Rejection reason..."
                        value={rejectionReason[vehicle.id] || ""}
                        onChange={(e) =>
                          setRejectionReason(prev => ({
                            ...prev,
                            [vehicle.id]: e.target.value
                          }))
                        }
                      />
                      <Button
                        variant="destructive"
                        onClick={() =>
                          updateVerificationStatus(
                            vehicle.id,
                            "REJECTED",
                            rejectionReason[vehicle.id]
                          )
                        }
                        disabled={!rejectionReason[vehicle.id]?.trim()}
                        className="w-full"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {vehicle.verificationStatus === "ACCEPTED_FOR_PAYMENT" &&
                  vehicle.paymentStatus === "PAID" && (
                    <Button
                      onClick={() => updateVerificationStatus(vehicle.id, "APPROVED")}
                      className="w-full"
                    >
                      Approve Vehicle
                    </Button>
                  )}

                {vehicle.verificationStatus === "ACCEPTED_FOR_PAYMENT" &&
                  vehicle.paymentStatus === "UNPAID" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        Waiting for owner to complete payment of NPR {vehicle.verificationFee.toLocaleString()}
                      </p>
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
              <p className="text-muted-foreground">No vehicles found for verification.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}