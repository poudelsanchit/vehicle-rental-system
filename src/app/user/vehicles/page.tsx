"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/features/core/components/card";
import { Badge } from "@/features/core/components/badge";
import { Button } from "@/features/core/components/button";
import { Skeleton } from "@/features/core/components/skeleton";
import { BookingDialog } from "@/features/core/components/booking-dialog";

interface Vehicle {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    type: string;
    transmission: string;
    fuelType: string;
    color: string;
    seatingCapacity: number;
    pricePerDay: number;
    pickupLocation: string;
    vehicleFrontPhoto: string;
    user: {
        username: string;
        email: string;
    };
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await fetch("/api/v1/vehicles");
                if (!response.ok) {
                    throw new Error("Failed to fetch vehicles");
                }
                const data = await response.json();
                setVehicles(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Available Vehicles</h1>
                <div className="flex items-center gap-4 mb-2">
                    <p className="text-gray-600">
                        Browse through our collection of {vehicles.length} available vehicles
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                        ✓ Currently Available
                    </Badge>
                </div>
            </div>

            {vehicles.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No vehicles available</h2>
                    <p className="text-gray-600">Check back later for new listings</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full">
                                <Image
                                    src={vehicle.vehicleFrontPhoto}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>

                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">
                                        {vehicle.brand} {vehicle.model}
                                    </CardTitle>
                                    <Badge variant="secondary">{vehicle.year}</Badge>
                                </div>
                                <CardDescription>{vehicle.title}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">{vehicle.type}</Badge>
                                    <Badge variant="outline">{vehicle.transmission}</Badge>
                                    <Badge variant="outline">{vehicle.fuelType}</Badge>
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                        Available Now
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium">Color:</span> {vehicle.color}
                                    </div>
                                    <div>
                                        <span className="font-medium">Seats:</span> {vehicle.seatingCapacity}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium">Pickup:</span> {vehicle.pickupLocation}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <span className="text-2xl font-bold text-green-600">
                                            Rs. {vehicle.pricePerDay.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500">/day</span>
                                    </div>
                                    <BookingDialog vehicle={vehicle}>
                                        <Button>Book Now</Button>
                                    </BookingDialog>
                                </div>

                                <div className="text-xs text-gray-500 border-t pt-2">
                                    Listed by: {vehicle.user.username}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}