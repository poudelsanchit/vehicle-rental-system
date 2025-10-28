import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { amount, products, patientId } = await request.json();

    const formData = {
      return_url: `http://localhost:3000`,
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
    console.log("Auction ID:", formData.purchase_order_id);

    return NextResponse.json({
      message: "Khalti payment initiated successfully",
      payment_method: "khalti",
      data: response.data,
    });
  } catch (error) {
    console.error("Khalti Payment Error:", error);
    return NextResponse.json(
      { message: "Error processing payment", error: error },
      { status: 500 }
    );
  }
}
