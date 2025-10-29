import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "../rate-limit";

// In-memory cache to prevent duplicate requests (in production, use Redis)
const requestCache = new Map<string, { timestamp: number; response: any }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Apply rate limiting (5 requests per minute per IP)
    const rateLimitResult = rateLimit(clientIP, 5, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          message: "Too many requests. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      );
    }

    // Parse the request body
    const { amount, products, patientId } = await request.json();

    // Validate required fields
    if (!amount || !products || !patientId) {
      return NextResponse.json(
        { message: "Missing required fields: amount, products, or patientId" },
        { status: 400 }
      );
    }

    // Check for duplicate requests
    const cacheKey = `${patientId}_${amount}`;
    const cached = requestCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Returning cached response for:", cacheKey);
      return NextResponse.json(cached.response);
    }

    const formData = {
      return_url: `http://localhost:3000/payment/success`,
      website_url: "http://localhost:3000",
      amount: amount * 100, // Convert to paisa
      purchase_order_id: patientId,
      purchase_order_name: products[0].product,
    };

    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      formData,
      { headers }
    );

    console.log("Khalti PIDX:", response.data.pidx);
    console.log("Booking ID:", formData.purchase_order_id);

    const responseData = {
      message: "Khalti payment initiated successfully",
      payment_method: "khalti",
      data: response.data,
    };

    // Cache the response
    requestCache.set(cacheKey, {
      timestamp: Date.now(),
      response: responseData,
    });

    // Clean up old cache entries
    for (const [key, value] of requestCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_DURATION) {
        requestCache.delete(key);
      }
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Khalti Payment Error:", error);

    // Handle specific Khalti API errors
    if (error.response?.data) {
      return NextResponse.json(
        {
          message: "Khalti API Error",
          error: error.response.data,
          details:
            error.response.data.detail || "Payment initialization failed",
        },
        { status: error.response.status || 500 }
      );
    }

    // Handle network errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return NextResponse.json(
        { message: "Unable to connect to Khalti. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: "Error processing payment",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
