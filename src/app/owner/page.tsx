import OwnerDashboard from "@/features/owner/dashboard/components/OwnerDashboard";
import { OwnerDashboardMockData } from "@/features/owner/dashboard/mockData/OwnerDashboardMockData";

export default function App() {
    return <OwnerDashboard dashboardData={OwnerDashboardMockData} />
}