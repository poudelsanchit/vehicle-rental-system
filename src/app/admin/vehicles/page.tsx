"use client";

import { useState, useEffect } from "react";
import { Button } from "@/features/core/components/button";
import { Card } from "@/features/core/components/card";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import VehiclesTable from "./VehiclesTable";

type VerificationStatus = 'PENDING' | 'ACCEPTED_FOR_PAYMENT' | 'REJECTED' | 'APPROVED';
type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED';

interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  verificationStatus: VerificationStatus;
  paymentStatus: PaymentStatus;
  verificationFee: number;
  rejectionReason?: string;
  pricePerDay: number;
  pickupLocation: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  type: string;
  category: string;
  color: string;
  // Vehicle photos
  vehicleFrontPhoto: string;
  vehicleBackPhoto: string;
  vehicleInteriorPhoto: string;
  vehicleSidePhoto: string;
  // Documents
  bluebookImage: string;
  insuranceDocumentImage: string;
  insuranceValidTill: string;
  user: {
    username: string;
    email: string;
  };
  createdAt: string;
  verifiedAt?: string;
}

export default function VehiclesVerification() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/v1/admin/vehicles");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch vehicles');
      }
      
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (vehicleId: string, status: VerificationStatus, reason?: string) => {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update verification status');
      }

      toast.success(`Vehicle ${status.toLowerCase().replace('_', ' ')} successfully`);
      fetchVehicles();
    } catch (err) {
      console.error('Error updating verification status:', err);
      toast.error(err instanceof Error ? err.message : "Error updating verification status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vehicle Verification Management</h1>
            <p className="text-gray-500">Review and manage vehicle verification requests</p>
          </div>
          <Button onClick={fetchVehicles} variant="outline">
            Refresh
          </Button>
        </div>
        <VehiclesTable
          vehicles={vehicles}
          onStatusUpdate={updateVerificationStatus}
        />
      </Card>
    </div>
  );
}