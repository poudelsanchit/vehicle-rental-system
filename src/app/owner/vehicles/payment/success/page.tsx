"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card";
import { Button } from "@/features/core/components/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed">("loading");
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    
    if (!pidx) {
      setVerificationStatus("failed");
      return;
    }

    verifyPayment(pidx);
  }, [searchParams]);

  const verifyPayment = async (pidx: string) => {
    try {
      const response = await fetch("/api/v1/vehicles/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setVerificationStatus("success");
        setVehicleInfo(data.vehicle);
        toast.success("Payment verified successfully!");
      } else {
        setVerificationStatus("failed");
        toast.error(data.error || "Payment verification failed");
      }
    } catch (error) {
      setVerificationStatus("failed");
      toast.error("Error verifying payment");
    }
  };

  const handleGoToVehicles = () => {
    router.push("/owner/vehicles/verification");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationStatus === "loading" && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {verificationStatus === "success" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {verificationStatus === "failed" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verificationStatus === "loading" && "Verifying Payment..."}
            {verificationStatus === "success" && "Payment Successful!"}
            {verificationStatus === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verificationStatus === "loading" && (
            <p className="text-muted-foreground">
              Please wait while we verify your payment with Khalti...
            </p>
          )}
          
          {verificationStatus === "success" && vehicleInfo && (
            <div className="space-y-3">
              <p className="text-green-600">
                Your payment of NPR {vehicleInfo.verificationFee?.toLocaleString()} has been successfully processed.
              </p>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Vehicle:</strong> {vehicleInfo.title}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Your vehicle is now pending final approval from our admin team.
                </p>
              </div>
            </div>
          )}
          
          {verificationStatus === "failed" && (
            <div className="space-y-3">
              <p className="text-red-600">
                We couldn't verify your payment. This might be due to:
              </p>
              <ul className="text-sm text-muted-foreground text-left space-y-1">
                <li>• Payment was cancelled or incomplete</li>
                <li>• Network connectivity issues</li>
                <li>• Invalid payment reference</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleGoToVehicles}
            className="w-full"
            disabled={verificationStatus === "loading"}
          >
            {verificationStatus === "success" ? "View Vehicle Status" : "Back to Vehicles"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}