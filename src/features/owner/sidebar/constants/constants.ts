// constants.ts
import { CalendarCheck, Car, LayoutDashboard, Settings, Shield } from "lucide-react";

export const OwnerHeaderData = {
  name: "Go Gadi",
  logo: Car,
  description: "Owner Panel",
};

export const OwnerNavMainData = {
  items: [
    {
      title: "Dashboard",
      url: "/owner",
      icon: LayoutDashboard,
    },
    {
      title: "Vehicles",
      url: "/owner/vehicles",
      icon: Car,
    },
    {
      title: "Vehicle Verification",
      url: "/owner/vehicles/verification",
      icon: Shield,
    },
    {
      title: "Bookings",
      url: "/owner/bookings",
      icon: CalendarCheck,
    },
    {
      title: "Settings",
      url: "/owner/settings",
      icon: Settings,
    },
  ],
};
