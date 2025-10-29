import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card"
import { Car, CreditCard, Calendar } from "lucide-react"

export default function HowItWorks() {
    const steps = [
        {
            icon: <Car className="h-8 w-8 " />,
            title: "1. Browse Vehicles",
            description: "Explore a wide range of cars, bikes, and scooters listed by trusted owners.",
        },
        {
            icon: <Calendar className="h-8 w-8 " />,
            title: "2. Book Your Ride",
            description: "Select your preferred vehicle, choose dates, and confirm your booking instantly.",
        },
        {
            icon: <CreditCard className="h-8 w-8 " />,
            title: "3. Pay & Drive",
            description: "Make secure payments and pick up your vehicle for an amazing ride experience.",
        },
    ]

    return (
        <section className="py-20 ">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold mb-16 ">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <Card key={i} className="border border-gray-200 rounded-lg hover:border-gray-300 transition shadow-none">
                            <CardHeader className="flex flex-col items-center space-y-4 pb-4">
                                {step.icon}
                                <CardTitle className="text-lg font-semibold ">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-secondary-foreground text-sm leading-relaxed">{step.description}</CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
