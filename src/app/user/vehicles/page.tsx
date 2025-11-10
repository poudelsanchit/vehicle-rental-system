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
import { Input } from "@/features/core/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/core/components/select";
import { Skeleton } from "@/features/core/components/skeleton";
import { BookingDialog } from "@/features/core/components/booking-dialog";
import { Search, Filter, Star, Sparkles, TrendingUp } from "lucide-react";

interface Vehicle {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    type: string;
    category: string;
    transmission: string;
    fuelType: string;
    color: string;
    seatingCapacity: number;
    pricePerDay: number;
    pickupLocation: string;
    vehicleFrontPhoto: string;
    avgRating: number;
    ratingCount: number;
    user: {
        username: string;
        email: string;
    };
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState("");
    const [type, setType] = useState("ALL_TYPES");
    const [category, setCategory] = useState("ALL_CATEGORIES");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [location, setLocation] = useState("");

    const fetchVehicles = async (useFilters = false) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (useFilters) {
                if (search) params.append("search", search);
                if (type && type !== "ALL_TYPES") params.append("type", type);
                if (category && category !== "ALL_CATEGORIES") params.append("category", category);
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", endDate);
                if (minPrice) params.append("minPrice", minPrice);
                if (maxPrice) params.append("maxPrice", maxPrice);
                if (location) params.append("location", location);
            }

            const response = await fetch(`/api/v1/vehicles?${params.toString()}`);
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

    // Initial load without filters
    useEffect(() => {
        fetchVehicles(false);
    }, []);

    const handleSearch = () => {
        fetchVehicles(true);
    };

    const clearFilters = () => {
        setSearch("");
        setType("ALL_TYPES");
        setCategory("ALL_CATEGORIES");
        setStartDate("");
        setEndDate("");
        setMinPrice("");
        setMaxPrice("");
        setLocation("");
        // Automatically fetch vehicles after clearing filters
        setTimeout(() => fetchVehicles(false), 100);
    };

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
                <h1 className="text-3xl font-bold mb-4">Available Vehicles</h1>

                {/* Search and Filters */}
                <div className=" p-6 rounded-lg shadow-sm border mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search vehicles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>

                        {/* Location */}
                        <Input
                            placeholder="Location..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />

                        {/* Date Range */}
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <Input
                                type="date"
                                placeholder="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Price Range */}
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Vehicle Type */}
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Vehicle Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL_TYPES">All Types</SelectItem>
                                <SelectItem value="CAR">Car</SelectItem>
                                <SelectItem value="BIKE">Bike</SelectItem>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="VAN">Van</SelectItem>
                                <SelectItem value="TRUCK">Truck</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Vehicle Category */}
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Vehicle Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
                                <SelectItem value="TWO_WHEELER">Two Wheeler</SelectItem>
                                <SelectItem value="FOUR_WHEELER">Four Wheeler</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Search Button */}
                        <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Search className="h-4 w-4 mr-2" />
                            {loading ? "Searching..." : "Search Vehicles"}
                        </Button>

                        {/* Clear Filters */}
                        <Button variant="outline" onClick={clearFilters} disabled={loading}>
                            <Filter className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <p className="text-gray-600">
                        {loading ? "Loading..." : `Found ${vehicles.length} available vehicles`}
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                        ✓ Currently Available
                    </Badge>
                    {(search || type !== "ALL_TYPES" || category !== "ALL_CATEGORIES" || startDate || endDate || minPrice || maxPrice || location) && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters Applied
                        </Badge>
                    )}
                </div>
            </div>

            {vehicles.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-2">No vehicles available</h2>
                    <p className="text-gray-600">Check back later for new listings</p>
                </div>
            ) : (
                <>
                    {/* Recommended Vehicles Section */}
                    {vehicles.length > 0 && vehicles.slice(0, 3).some(v => v.avgRating > 0 || v.ratingCount > 0) && (
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
                                    <Sparkles className="h-5 w-5" />
                                    <h2 className="text-lg font-bold">Recommended For You</h2>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Based on your preferences and top-rated vehicles
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vehicles.slice(0, 3).map((vehicle, index) => (
                                    <Card key={vehicle.id} className="overflow-hidden hover:shadow-xl transition-all border-2 border-purple-200 relative">
                                        {/* Recommended Badge */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                {index === 0 ? "Top Pick" : "Recommended"}
                                            </Badge>
                                        </div>
                                        
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
                                            {vehicle.ratingCount > 0 && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{vehicle.avgRating.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-500">({vehicle.ratingCount} reviews)</span>
                                                </div>
                                            )}
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{vehicle.type}</Badge>
                                                <Badge variant="outline">{vehicle.category.replace('_', ' ')}</Badge>
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
                                                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                                        Book Now
                                                    </Button>
                                                </BookingDialog>
                                            </div>

                                            <div className="text-xs text-gray-500 border-t pt-2">
                                                Listed by: {vehicle.user.username}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Vehicles Section */}
                    {vehicles.length > 3 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full">
                                    <TrendingUp className="h-5 w-5" />
                                    <h2 className="text-lg font-bold">More Available Vehicles</h2>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vehicles.slice(3).map((vehicle) => (
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
                                            {vehicle.ratingCount > 0 && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{vehicle.avgRating.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-500">({vehicle.ratingCount} reviews)</span>
                                                </div>
                                            )}
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{vehicle.type}</Badge>
                                                <Badge variant="outline">{vehicle.category.replace('_', ' ')}</Badge>
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
                        </div>
                    )}

                    {/* Show all vehicles in one section if 3 or fewer */}
                    {vehicles.length <= 3 && (
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
                                        {vehicle.ratingCount > 0 && (
                                            <div className="flex items-center gap-1 mt-2">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{vehicle.avgRating.toFixed(1)}</span>
                                                <span className="text-xs text-gray-500">({vehicle.ratingCount} reviews)</span>
                                            </div>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{vehicle.type}</Badge>
                                            <Badge variant="outline">{vehicle.category.replace('_', ' ')}</Badge>
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
                </>
            )}
        </div>
    );
}