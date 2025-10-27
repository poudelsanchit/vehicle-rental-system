import FeaturedVehicles from "@/features/landing-page/Featured-Vehicles/components/FeaturedVehicles";
import { IFeaturedVehicle } from "@/features/landing-page/Featured-Vehicles/types/types";
import HeroSection from "@/features/landing-page/hero-section/components/HeroSection";
import HowItWorks from "@/features/landing-page/how-it-works/components/HowItWorks";
import Testimonials from "@/features/testimonials/client/components/Testimonials";
import { ITestimonial } from "@/features/testimonials/types/types";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    weight: ["300", "400", "500", "700"],
    style: ["normal"],
    subsets: ["latin"],
});

export async function getFeaturedVehicles(): Promise<IFeaturedVehicle[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/v1/featured`, {
            cache: 'no-store', // or use 'force-cache' for static data
            // Alternative: next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!res.ok) {
            throw new Error('Failed to fetch vehicles');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching featured Vehicles:', error);
        return []; // Return empty array on error
    }
}

async function getTestimonials(): Promise<ITestimonial[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/v1/testimonials`, {
            cache: 'no-store', // or use 'force-cache' for static data
            // Alternative: next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!res.ok) {
            throw new Error('Failed to fetch testimonials');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return []; // Return empty array on error
    }
}

export default async function Home() {
    const testimonials = await getTestimonials();
    const featuredVehicles = await getFeaturedVehicles()

    return (
        <>
            <div className={poppins.className}>
                <HeroSection />
                <HowItWorks />
                <FeaturedVehicles showTopBorder featuredVehiclesData={featuredVehicles} />
                <Testimonials testimonials={testimonials} />

            </div>
        </>
    );
}