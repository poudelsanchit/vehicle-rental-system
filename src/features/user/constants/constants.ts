// constants.ts
import {
  Car,
  LayoutDashboard,
  Settings,
  Ticket,
} from "lucide-react";

export const UserHeaderData = {
  name: "Go Gadi",
  logo: Car,
  description: "User Panel",
};

export const UserNavMainData = {
  items: [
    {
      title: "Dashboard",
      url: "/user",
      icon: LayoutDashboard,
    },
    {
      title: "vehicles",
      url: "/user/vehicles",
      icon: Car,
    },
    {
      title: "Bookings",
      url: "/user/bookings",
      icon: Ticket,
    },
    {
      title: "Settings",
      url: "/user/settings",
      icon: Settings,
    },
  ],
};
