// constants.ts
import { Building, Settings, User } from "lucide-react";

export const headerData = {
  name: "Project Management System",
  logo: Building,
  description: "Super Admin Panel",
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
