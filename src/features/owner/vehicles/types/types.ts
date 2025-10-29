export interface IVehicle {
  id: string; // unique identifier (UUID or DB id)
  title: string; // display name of vehicle
  brand: string; // e.g. Toyota, Honda
  model: string; // e.g. Corolla, Civic
  year: number; // manufacturing year
  type: "Car" | "Bike" | "SUV" | "Van" | "Truck"; // vehicle category
  transmission: "Manual" | "Automatic"; // gearbox type
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid"; // fuel system
  color: string; // vehicle color
  seatingCapacity: number; // number of seats

  registrationNumber: string; // license plate number
  pricePerDay: number; // rental cost per day (in your currency)
  available: boolean; // currently available for rent
  pickupLocation: string; // pickup/drop location

  bluebookImage: string; // URL of bluebook photo
  insuranceDocumentImage: string; // URL of insurance document
  insuranceValidTill: string; // ISO date (YYYY-MM-DD)
  vehicleFrontPhoto: string;
  vehicleBackPhoto: string;
  vehicleInteriorPhoto: string;
  vehicleSidePhoto: string;

  createdAt: string; // ISO date
}
