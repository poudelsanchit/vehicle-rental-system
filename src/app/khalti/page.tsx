"use client";

import { Button } from "@/features/core/components/button";

export default function LoginButton() {
    const handleLoginWithkhalti = async () => {
        const url = "http://localhost:3000/api/khalti/verify";
        const data = {
            amount: Number(3000),
            patientId: "67fb9df8d6de80dde8260e5f",
            products: [
                { product: "Sanchit Poudel", amount: Number(3000), quantity: 1 },
            ],
            payment_method: "khalti",
        };
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const responseData = await response.json();
                khaltiCall(responseData.data);
            }
        } catch (error) {
            console.log("Payment initialization failed. Please try again.");
            console.error("Error during fetch:", error);
        }
    };
    const khaltiCall = (data: any) => {
        window.location.href = data.payment_url;
    };
    return (
        <div className="flex justify-center items-center cursor-pointer ">
            <Button
                onClick={handleLoginWithkhalti}
                variant={"outline"}
                className="cursor-pointer text-white font-medium bg-white hover:bg-neutral-200"
            >
                Upgrade to premium
            </Button>
        </div>
    );
}
