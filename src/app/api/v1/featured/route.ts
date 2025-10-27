import { NextResponse } from "next/server";

export async function GET() {
  try {
    const featuredVehicles = [
      {
        id: "1",
        name: "BMW X5",
        type: "SUV",
        year: 2006,
        seats: 4,
        transmission: "Semi-Automatic",
        fuelType: "Hybrid",
        location: "New York",
        pricePerDay: 300,
        availabilityStatus: "Available Now",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "2",
        name: "Tesla Model 3",
        type: "Sedan",
        year: 2022,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Electric",
        location: "San Francisco",
        pricePerDay: 250,
        availabilityStatus: "Available Now",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "4",
        name: "Toyota Hilux",
        type: "Pickup",
        year: 2018,
        seats: 5,
        transmission: "Manual",
        fuelType: "Diesel",
        location: "Sydney",
        pricePerDay: 180,
        availabilityStatus: "Unavailable",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "5",
        name: "Toyota Hilux",
        type: "Pickup",
        year: 2018,
        seats: 5,
        transmission: "Manual",
        fuelType: "Diesel",
        location: "Sydney",
        pricePerDay: 180,
        availabilityStatus: "Unavailable",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "6",
        name: "Toyota Hilux",
        type: "Pickup",
        year: 2018,
        seats: 5,
        transmission: "Manual",
        fuelType: "Diesel",
        location: "Sydney",
        pricePerDay: 180,
        availabilityStatus: "Unavailable",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "7",
        name: "BMW X5",
        type: "SUV",
        year: 2006,
        seats: 4,
        transmission: "Semi-Automatic",
        fuelType: "Hybrid",
        location: "New York",
        pricePerDay: 300,
        availabilityStatus: "Available Now",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "8",
        name: "Tesla Model 3",
        type: "Sedan",
        year: 2022,
        seats: 5,
        transmission: "Automatic",
        fuelType: "Electric",
        location: "San Francisco",
        pricePerDay: 250,
        availabilityStatus: "Available Now",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "9",
        name: "Toyota Hilux",
        type: "Pickup",
        year: 2018,
        seats: 5,
        transmission: "Manual",
        fuelType: "Diesel",
        location: "Sydney",
        pricePerDay: 180,
        availabilityStatus: "Unavailable",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
      {
        id: "10",
        name: "Toyota Hilux",
        type: "Pickup",
        year: 2018,
        seats: 5,
        transmission: "Manual",
        fuelType: "Diesel",
        location: "Sydney",
        pricePerDay: 180,
        availabilityStatus: "Unavailable",
        imageUrl:
          "https://i.pinimg.com/1200x/2f/b9/e7/2fb9e727fa912717d0c654fb096678e4.jpg",
      },
    ];

    return NextResponse.json(featuredVehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
