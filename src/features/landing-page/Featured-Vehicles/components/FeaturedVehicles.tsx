"use client";
import EachVechicleCard from "./EachVechicleCard";
import { AnimatedArrow, AnimatedButton } from "@/features/animations/components/animated-component";
import { ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/features/core/components/breadcrumb";
import { usePathname } from "next/navigation";
import { fadeInDown } from "@/features/core/hooks/use-scroll-animation";
import { IFeaturedVehicle } from "../types/types";

interface PortfolioComponentProps {
    featuredVehiclesData: IFeaturedVehicle[]
    showExploreMoreButton?: boolean;
    showTopBorder?: boolean;
}

export default function FeaturedVehicles({
    featuredVehiclesData,
    showExploreMoreButton = false,
    showTopBorder = false
}: PortfolioComponentProps) {
    const pathname = usePathname();


    const isEmpty = !featuredVehiclesData || featuredVehiclesData.length === 0;


    return (
        <div
            id="projects"
            className={`flex lg:flex-row flex-col justify-center items-center w-full h-max font-Poppins ${showTopBorder ? "border-t border-border sm:mt-24 mt-10 sm:pt-16 pt-8" : "mt-20 sm:pt-2 mb-20"
                }`}
        >
            <div className="font-Poppins flex flex-col lg:w-[92%] w-[90%]">
                <div className="flex w-full flex-col gap-12">
                    {pathname === "/vehicles" ? (
                        <Breadcrumb className="mr-auto font-medium">
                            <BreadcrumbList>
                                <BreadcrumbItem className="dark:text-white text-neutral-800 hover:underline">
                                    <Link href="/">Home</Link>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Vehicles</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    ) : (
                        <AnimatedButton variants={fadeInDown}>
                            <div className="flex flex-col items-center text-center gap-2">
                                <h1 className="text-3xl font-semibold">Featured Vehicles</h1>
                                <p className="text-muted-foreground">Explore our selection of premium vehicles available for your next adventure.</p>
                            </div>
                        </AnimatedButton>
                    )}

                    {isEmpty ? (
                        // Empty State UI
                        <div className="w-full flex flex-col items-center justify-center py-16 px-4 border border-dotted rounded">
                            <div className="flex flex-col items-center text-center space-y-6 max-w-md">
                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                    <FolderOpen className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        No Featured Vehicles Yet
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        We&apos;re currently working on adding featured vehicles.
                                        Check back soon to see our latest vehicles.
                                    </p>
                                </div>
                                <div className="w-full h-px bg-border"></div>
                                <p className="text-xs text-muted-foreground">
                                    Stay tuned for updates
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Projects Grid
                        <>
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {featuredVehiclesData?.map((data) => (
                                    <EachVechicleCard key={data.id} vechicle={data} />
                                ))}
                            </div>
                            {showExploreMoreButton && (
                                <Link
                                    href={"/projects"}
                                    className="h-12 ml-auto w-44 text-sm flex justify-center items-center bg-primary text-primary-foreground rounded-full cursor-pointer px-1 gap-2 hover:scale-105 transition-transform duration-500 hover:bg-primary/90"
                                >
                                    <div>Explore More</div>
                                    <AnimatedArrow className="text-2xl">
                                        <ArrowRight size={17} />
                                    </AnimatedArrow>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}