// constants.ts
import { Car, Settings, User } from "lucide-react";

export const headerData = {
  name: "Go Gadi",
  logo: Car,
  description: "Admin Panel",
};

export const navMainData = {
  items: [
    {
      title: "Users",
      url: "/admin",
      icon: User,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};
