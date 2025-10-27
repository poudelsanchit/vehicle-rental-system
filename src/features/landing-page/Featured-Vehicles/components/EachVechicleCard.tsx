import Image from "next/image"
import { AnimatedImageContainer } from "@/features/animations/components/animated-component"
import type { IFeaturedVehicle } from "../types/types"

export default function EachVechicleCard({ vechicle }: { vechicle: IFeaturedVehicle }) {
    return (
        <div className="bg-white rounded-2xl shadow-xs overflow-hidden hover:shadow-sm duration-300 w-full border cursor-pointer ">
            {/* Image Container */}
            <div className="relative h-64 w-full">
                {vechicle.imageUrl}
                <AnimatedImageContainer>
                    <Image src={vechicle.imageUrl} alt={vechicle.name} fill className="object-cover" />
                </AnimatedImageContainer>
            </div>



            {/* Content Container */}
            <div className="p-6">
                {/* Title Section */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{vechicle.name}</h3>
                    <p className="text-gray-600 text-sm">
                        {vechicle.type} • {vechicle.year}
                    </p>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Seats */}
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <span className="text-sm">{vechicle.seats} Seats</span>
                    </div>

                    {/* Fuel Type */}
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm">{vechicle.fuelType}</span>
                    </div>

                    {/* Transmission */}
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                        </svg>
                        <span className="text-sm">{vechicle.transmission}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{vechicle.location}</span>
                    </div>
                </div>
            </div>
            <div className="bg-linear-to-r from-white to-neutral-50 px-6 py-4 border-t ">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${vechicle.pricePerDay}</span>
                    <span className="text-gray-600 font-medium">/ day</span>
                </div>
            </div>
        </div>
    )
}
