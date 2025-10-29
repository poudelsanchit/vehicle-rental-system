"use client";

import { useState, useEffect } from "react";
import OwnerDashboard from "@/features/owner/dashboard/components/OwnerDashboard";
import { IOwnerDashboardData } from "@/features/owner/dashboard/mockData/OwnerDashboardMockData";
import { toast } from "sonner";

export default function App() {
    const [dashboardData, setDashboardData] = useState<IOwnerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("/api/v1/owner/dashboard");
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
            } else {
                toast.error("Failed to fetch dashboard data");
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Error loading dashboard");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
                    <button 
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return <OwnerDashboard dashboardData={dashboardData} />
}