"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/features/core/components/breadcrumb";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/features/core/components/sidebar";
import { Separator } from "@/features/core/components/separator";
import { AppSidebar } from "../../core/components/app-sidebar";
import { useUserData } from "@/features/sidebar/hooks/useUserData";
import { navMainData } from "@/features/sidebar/constants/constants";
import { UserHeaderData, UserNavMainData } from "../constants/constants";

export function UserSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const userData = useUserData();

    return (
        <SidebarProvider>
            <AppSidebar
                headerData={UserHeaderData}
                userData={userData}
                navMainData={UserNavMainData}
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" variant="secondary" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <Link href="/user">Home</Link>
                                </BreadcrumbItem>
                                <>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink >
                                            {pathname === "/user"
                                                ? "Dashboard"
                                                : pathname.split("/")[2]}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                </>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}