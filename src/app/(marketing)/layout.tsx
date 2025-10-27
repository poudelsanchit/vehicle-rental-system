// app/layout.tsx
import Footer from "@/features/landing-page/Footer/components/Footer";
import { Navbar } from "@/features/landing-page/navbar/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GO GADI",
    description: "Whether it's a quick drive around the city or a weekend getaway, we've got the perfect ride for you",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (

        <>
            <Navbar />
            {children}
            <Footer />
        </>

    );
}
