export interface IFeaturedVehicle {
  id: string;
  name: string; // e.g. "BMW X5"
  type: string; // e.g. "SUV"
  year: number; // e.g. 2006
  seats: number; // e.g. 4
  transmission: string; // e.g. "Semi-Automatic"
  fuelType: string; // e.g. "Hybrid"
  location: string; // e.g. "New York"
  pricePerDay: number; // e.g. 300
  availabilityStatus: "Available Now" | "Unavailable";
  imageUrl: string; // Vehicle image URL
}
