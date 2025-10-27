// Updated AppSidebar component
"use client";

import {
  LucideIcon,
} from "lucide-react";
import DefaultImage from "@/../public/default.jpg";
import {
  Sidebar, SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../../core/components/sidebar";
import { NavMain } from "./nav-main";
import { SidebarHeaderComponent } from "./sidebar-header";
import { NavUser } from "./nav-user";
import { IHeaderData } from "../types/types";


interface IUserData {
  name?: string;
  email: string;
  id?: string;
  userId?: string;
  isVerified?: boolean;
  role?: string;
}
interface INavMainData {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  headerData: IHeaderData;
  userData: IUserData;
  navMainData: INavMainData;
}

export function AppSidebar({
  headerData,
  userData,
  navMainData,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderComponent team={headerData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData.items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: userData.name || "Anonymous User",
            email: userData.email,
            avatar: DefaultImage.src, // fallback avatar
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
