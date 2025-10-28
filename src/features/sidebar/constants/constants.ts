// constants.ts
import { Car, Settings, User, Verified } from "lucide-react";

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
      title: "KYC Verification",
      url: "/admin/kyc",
      icon: Verified,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};
