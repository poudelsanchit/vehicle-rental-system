"use client";

import { signOut, useSession } from "next-auth/react";
import { Clock, LogOut, Shield, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/features/core/components/button";
import {
  Card, CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/core/components/card";
import { Alert, AlertDescription } from "@/features/core/components/alert";
import Link from "next/link";
import { Skeleton } from "@/features/core/components/skeleton";

export default function VerificationPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Skeleton className="bg-muted/50 h-96 w-full max-w-md p-6 rounded" />
      </div>
    </>
  }

  // You'll need to fetch the KYC status from your database
  // This assumes you've added kycStatus to your session or are fetching it
  const kycStatus = session?.user?.kycStatus; // e.g., "PENDING", "APPROVED", "REJECTED"

  const renderContent = () => {
    switch (kycStatus) {
      case "PENDING":
        return (
          <>
            <div className="mx-auto w-16 h-16  rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Verification Pending
              </CardTitle>
              <CardDescription className="mt-2">
                Your KYC submission is currently under review
              </CardDescription>
            </div>
          </>
        );

      case "REJECTED":
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Verification Rejected
              </CardTitle>
              <CardDescription className="mt-2">
                Your KYC submission was not approved
              </CardDescription>
            </div>
          </>
        );

      default: // No KYC submitted yet
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Verification Required
              </CardTitle>
              <CardDescription className="mt-2">
                Please complete your KYC verification
              </CardDescription>
            </div>
          </>
        );
    }
  };

  const renderAlert = () => {
    switch (kycStatus) {
      case "PENDING":
        return (
          <Alert >
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Your KYC documents are being reviewed by our team. This typically takes 24-48 hours.
              We'll notify you once the verification is complete.
            </AlertDescription>
          </Alert>
        );

      case "REJECTED":
        return (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              Your KYC verification was rejected. Please review the feedback and resubmit your documents.
              <br />
              <Link href="/verification/kyc" className="text-blue-600 underline font-medium">
                Resubmit KYC
              </Link>
            </AlertDescription>
          </Alert>
        );
      case "APPROVED":
        return (
          <Alert className="border-red-200 bg-red-50">
            <CheckCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              Your KYC verification was Accepted. Please reload the site.
            </AlertDescription>
          </Alert>
        );


      default:
        return (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You are logged in as a {session?.user?.role === "OWNER" ? "Vehicle Owner" : "User"}.
              Please complete your KYC verification to access all features.
              <br />
              <Link href="/verification/kyc" className="text-blue-600 underline font-medium">
                Start KYC Verification
              </Link>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          {renderContent()}
        </CardHeader>

        <CardContent className="space-y-6">
          {renderAlert()}

          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Need help? Contact support at</p>
              <p className="font-medium text-foreground">
                info.gogadi@gmail.com
              </p>
            </div>

            <Button onClick={() => signOut()} className="w-full" size="lg" variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}