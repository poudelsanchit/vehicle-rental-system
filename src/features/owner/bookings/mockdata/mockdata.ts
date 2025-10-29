// Interface for booking data
export interface IBookingData {
  id: string;
  registrationNumber: string;
  vehicleName: string;
  pricePerDay: number;
  bookingDate: string;
  bookedTillDate: string;
  renterDetails: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  paymentStatus: "pending" | "completed" | "failed";
  totalAmount: number;
  bookingStatus: "active" | "completed" | "cancelled";
}

// Mock data for bookings
export const BookingsMockData: IBookingData[] = [
  {
    id: "BK001",
    registrationNumber: "BA-12-PA-5678",
    vehicleName: "Toyota Hiace",
    pricePerDay: 8500,
    bookingDate: "2025-10-20",
    bookedTillDate: "2025-10-30",
    renterDetails: {
      id: "RNT001",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@email.com",
      phone: "+977-9841234567",
    },
    paymentStatus: "completed",
    totalAmount: 85000,
    bookingStatus: "active",
  },
  {
    id: "BK002",
    registrationNumber: "BA-03-CHA-1234",
    vehicleName: "Honda Civic",
    pricePerDay: 5000,
    bookingDate: "2025-10-25",
    bookedTillDate: "2025-11-02",
    renterDetails: {
      id: "RNT002",
      name: "Priya Thapa",
      email: "priya.thapa@email.com",
      phone: "+977-9856781234",
    },
    paymentStatus: "pending",
    totalAmount: 40000,
    bookingStatus: "active",
  },
  {
    id: "BK003",
    registrationNumber: "GA-01-AA-9999",
    vehicleName: "Mahindra Scorpio",
    pricePerDay: 6500,
    bookingDate: "2025-10-15",
    bookedTillDate: "2025-10-28",
    renterDetails: {
      id: "RNT003",
      name: "Suman Gurung",
      email: "suman.gurung@email.com",
      phone: "+977-9812345678",
    },
    paymentStatus: "completed",
    totalAmount: 84500,
    bookingStatus: "active",
  },
  {
    id: "BK004",
    registrationNumber: "BA-05-PA-7777",
    vehicleName: "Hyundai Creta",
    pricePerDay: 7000,
    bookingDate: "2025-10-10",
    bookedTillDate: "2025-10-20",
    renterDetails: {
      id: "RNT004",
      name: "Anita Rai",
      email: "anita.rai@email.com",
      phone: "+977-9823456789",
    },
    paymentStatus: "completed",
    totalAmount: 70000,
    bookingStatus: "completed",
  },
  {
    id: "BK005",
    registrationNumber: "KA-01-PA-3333",
    vehicleName: "Suzuki Swift",
    pricePerDay: 4500,
    bookingDate: "2025-10-28",
    bookedTillDate: "2025-11-05",
    renterDetails: {
      id: "RNT005",
      name: "Bikash Shrestha",
      email: "bikash.shrestha@email.com",
      phone: "+977-9834567890",
    },
    paymentStatus: "pending",
    totalAmount: 36000,
    bookingStatus: "active",
  },
  {
    id: "BK006",
    registrationNumber: "BA-02-PA-4444",
    vehicleName: "Toyota Fortuner",
    pricePerDay: 12000,
    bookingDate: "2025-10-18",
    bookedTillDate: "2025-10-27",
    renterDetails: {
      id: "RNT006",
      name: "Ramesh Paudel",
      email: "ramesh.paudel@email.com",
      phone: "+977-9845678901",
    },
    paymentStatus: "completed",
    totalAmount: 108000,
    bookingStatus: "active",
  },
  {
    id: "BK007",
    registrationNumber: "LU-01-PA-2222",
    vehicleName: "Nissan Kicks",
    pricePerDay: 5500,
    bookingDate: "2025-10-22",
    bookedTillDate: "2025-10-29",
    renterDetails: {
      id: "RNT007",
      name: "Kavita Tamang",
      email: "kavita.tamang@email.com",
      phone: "+977-9856789012",
    },
    paymentStatus: "pending",
    totalAmount: 38500,
    bookingStatus: "active",
  },
  {
    id: "BK008",
    registrationNumber: "BA-08-PA-5555",
    vehicleName: "Maruti Ertiga",
    pricePerDay: 6000,
    bookingDate: "2025-10-05",
    bookedTillDate: "2025-10-15",
    renterDetails: {
      id: "RNT008",
      name: "Deepak Karki",
      email: "deepak.karki@email.com",
      phone: "+977-9867890123",
    },
    paymentStatus: "completed",
    totalAmount: 60000,
    bookingStatus: "completed",
  },
  {
    id: "BK009",
    registrationNumber: "BA-11-PA-6666",
    vehicleName: "KIA Seltos",
    pricePerDay: 8000,
    bookingDate: "2025-10-26",
    bookedTillDate: "2025-11-03",
    renterDetails: {
      id: "RNT009",
      name: "Sarita Adhikari",
      email: "sarita.adhikari@email.com",
      phone: "+977-9878901234",
    },
    paymentStatus: "pending",
    totalAmount: 64000,
    bookingStatus: "active",
  },
  {
    id: "BK010",
    registrationNumber: "BA-07-PA-8888",
    vehicleName: "Ford Endeavour",
    pricePerDay: 13000,
    bookingDate: "2025-10-12",
    bookedTillDate: "2025-10-25",
    renterDetails: {
      id: "RNT010",
      name: "Krishna Bahadur",
      email: "krishna.bahadur@email.com",
      phone: "+977-9889012345",
    },
    paymentStatus: "completed",
    totalAmount: 169000,
    bookingStatus: "completed",
  },
];
