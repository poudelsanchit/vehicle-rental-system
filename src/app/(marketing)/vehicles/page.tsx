import FeaturedVehicles from "@/features/landing-page/Featured-Vehicles/components/FeaturedVehicles";
import { getFeaturedVehicles } from "../page";

export default async function vechiclesPage() {
    const featuredVehicles = await getFeaturedVehicles()

    return <>
        <FeaturedVehicles featuredVehiclesData={featuredVehicles} />
    </>
}