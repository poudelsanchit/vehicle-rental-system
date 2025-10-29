// constants.ts
import { CalendarCheck, Car, LayoutDashboard, Settings } from "lucide-react";

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
