"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card";
import { Button } from "@/features/core/components/button";
import { Badge } from "@/features/core/components/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const pidx = searchParams.get('pidx');
        const txnId = searchParams.get('txnId');
        const amount = searchParams.get('amount');
        const mobile = searchParams.get('mobile');

        if (!pidx) {
          throw new Error('Payment ID not found');
        }

        // Get pending booking data from localStorage
        const pendingBookingStr = localStorage.getItem('pendingBooking');
        if (!pendingBookingStr) {
          throw new Error('Booking data not found');
        }

        const pendingBooking = JSON.parse(pendingBookingStr);

        // Verify payment with backend
        const response = await fetch('/api/khalti/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pidx,
            bookingData: pendingBooking,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          setBookingData(result.booking);
          setPaymentData(result.paymentData);
          
          // Clear pending booking data
          localStorage.removeItem('pendingBooking');
          
          toast.success('Payment successful! Your booking has been created.');
        } else {
          throw new Error(result.message || 'Payment verification failed');
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        toast.error(error instanceof Error ? error.message : 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoToBookings = () => {
    router.push('/user/bookings');
  };

  const handleGoHome = () => {
    router.push('/user/vehicles');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              There was an issue with your payment. Please try again or contact support.
            </p>
            <div className="space-y-2">
              <Button onClick={handleGoHome} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/contact')} className="w-full">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <p className="text-gray-600">Your booking has been created successfully</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Transaction ID:</span></div>
              <div className="font-mono">{paymentData?.transaction_id}</div>
              
              <div><span className="font-medium">Amount Paid:</span></div>
              <div className="font-semibold">Rs. {paymentData?.amount?.toLocaleString()}</div>
              
              <div><span className="font-medium">Payment Method:</span></div>
              <div>
                <Badge className="bg-purple-100 text-purple-800">Khalti</Badge>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {bookingData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Booking Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Vehicle:</span></div>
                <div>{bookingData.vehicle.brand} {bookingData.vehicle.model}</div>
                
                <div><span className="font-medium">Booking ID:</span></div>
                <div className="font-mono">{bookingData.id}</div>
                
                <div><span className="font-medium">Duration:</span></div>
                <div>{bookingData.totalDays} day{bookingData.totalDays > 1 ? 's' : ''}</div>
                
                <div><span className="font-medium">Status:</span></div>
                <div>
                  <Badge variant="secondary">Pending Owner Approval</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Your booking is pending approval from the vehicle owner</li>
              <li>• You will be notified once the owner confirms your booking</li>
              <li>• You can track your booking status in the "My Bookings" section</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleGoToBookings} className="flex-1">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              Browse More Vehicles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}