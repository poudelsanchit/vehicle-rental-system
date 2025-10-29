import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Khalti Integration Debug Info",
    environment: {
      khaltiSecretKey: process.env.KHALTI_SECRET_KEY ? "✅ Set" : "❌ Missing",
      nodeEnv: process.env.NODE_ENV,
    },
    commonIssues: {
      "Similar request already being processed": [
        "1. Multiple rapid clicks on payment button",
        "2. Duplicate API calls in quick succession", 
        "3. Browser back/forward navigation during payment",
        "4. Network timeouts causing retries",
        "5. Cached requests with same parameters"
      ],
      solutions: [
        "✅ Added request deduplication with caching",
        "✅ Added rate limiting (5 requests per minute)",
        "✅ Added button disable during processing",
        "✅ Added unique booking identifiers",
        "✅ Added proper error handling"
      ]
    },
    troubleshooting: {
      steps: [
        "1. Check browser console for errors",
        "2. Verify Khalti secret key is set",
        "3. Check network tab for duplicate requests",
        "4. Clear localStorage and try again",
        "5. Wait 30 seconds between payment attempts"
      ]
    },
    endpoints: {
      initializePayment: "/api/khalti/verify",
      verifyPayment: "/api/khalti/verify-payment", 
      debug: "/api/khalti/debug",
      testIntegration: "/api/khalti/test-integration"
    }
  });
}