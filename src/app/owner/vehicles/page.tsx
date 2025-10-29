"use client"
import { Badge } from "@/features/core/components/badge";
import { Card, CardContent } from "@/features/core/components/card";
import CreateVehicle from "@/features/owner/vehicles/components/CreateVehicle";
import VehiclesTable from "@/features/owner/vehicles/components/VehiclesTable";
import { vehicleMockData } from "@/features/owner/vehicles/mockdata/mockdata";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VehcilesPage() {
    const [vehiclesData, setVehiclesData] = useState([])
    const fetchVehiclesData = async () => {
        try {
            const response = await axios.get("/api/v1/owner/vehicle");
            const data = response.data
            if (response.status === 200) {
                setVehiclesData(data.data)
            }

        } catch (error) {
            toast("Error fetching vehiclesData")
        }
    }
    useEffect(() => {
        fetchVehiclesData();
    }, []);


    return <div className="min-h-screen py-2">
        <div className=" mb-4">
            {/* Header */}
            <div className="flex  flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="sm:text-3xl text-2xl font-bold">Vehicles Management</h1>
                    <p className="sm:mt-2 mt-1">
                        Create and manage your vehicles
                    </p>
                </div>
            </div>
            {/* Stats */}
        </div>
        <Card>
            <CardContent >
                <div className="mb-4 flex items-center  gap-4">
                    <CreateVehicle fetchVehiclesData={fetchVehiclesData} />

                    <Badge variant="outline" className="text-sm">
                        {/* Total Testimonials: {testimonials?.length} */}
                        Total Vehicles: {vehiclesData.length}

                    </Badge>
                </div>
                <VehiclesTable vehicles={vehiclesData} />
            </CardContent>
        </Card>
    </div>
}