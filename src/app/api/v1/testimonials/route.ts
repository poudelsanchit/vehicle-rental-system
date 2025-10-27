import { ITestimonial } from "@/features/testimonials/types/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const testimonials: ITestimonial[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        role: "Business Executive",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        content:
          "Exceptional service! The BMW X5 I rented was in pristine condition and made my business trip incredibly comfortable. The booking process was smooth and the team was very professional.",
        rating: 5,
      },
      {
        id: "2",
        name: "Michael Chen",
        role: "Tech Entrepreneur",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        content:
          "I've used many car rental services, but this one stands out. The Tesla Model 3 was a dream to drive, and the entire experience was seamless from start to finish. Highly recommend!",
        rating: 5,
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        role: "Travel Blogger",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        content:
          "Perfect for my weekend getaway! The customer service was outstanding, and the vehicle exceeded my expectations. Great value for money and I'll definitely be booking again.",
        rating: 5,
      },
      {
        id: "4",
        name: "David Thompson",
        role: "Marketing Director",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        content:
          "Professional service with a wide selection of premium vehicles. The pickup and drop-off process was incredibly convenient. This is now my go-to rental service.",
        rating: 4,
      },
      {
        id: "5",
        name: "Jessica Martinez",
        role: "Event Coordinator",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        content:
          "Rented a luxury SUV for a corporate event and everything was flawless. The vehicle was immaculate and the booking platform was so easy to use. Five stars!",
        rating: 5,
      },
      {
        id: "6",
        name: "James Wilson",
        role: "Photographer",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
        content:
          "Great experience from start to finish. The team went above and beyond to ensure I had the right vehicle for my road trip. The car was comfortable and fuel-efficient.",
        rating: 4,
      },
    ];

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
