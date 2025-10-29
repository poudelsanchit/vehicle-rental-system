import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Khalti Payment Integration Test",
    integration: {
      paymentFlow: [
        "1. User fills booking form",
        "2. User proceeds to payment",
        "3. System initializes Khalti payment",
        "4. User redirected to Khalti gateway",
        "5. After payment, user returns to success page",
        "6. System verifies payment with Khalti",
        "7. If successful, booking is created in database",
        "8. User sees confirmation and booking details"
      ],
      endpoints: {
        initializePayment: "POST /api/khalti/verify",
        verifyPayment: "POST /api/khalti/verify-payment",
        successPage: "/payment/success",
        userProfile: "GET /api/v1/user/profile"
      },
      features: [
        "✅ Payment before booking creation",
        "✅ Khalti payment gateway integration",
        "✅ Payment verification",
        "✅ Booking creation only after successful payment",
        "✅ Payment success page with booking details",
        "✅ Error handling for failed payments",
        "✅ Booking conflict prevention",
        "✅ Amount verification"
      ]
    },
    environment: {
      khaltiSecretKey: process.env.KHALTI_SECRET_KEY ? "✅ Configured" : "❌ Missing",
      returnUrl: "http://localhost:3000/payment/success",
      websiteUrl: "http://localhost:3000"
    }
  });
}