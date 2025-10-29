import { Badge } from "@/features/core/components/badge";
import { Card, CardContent } from "@/features/core/components/card";
import BookingsTable from "@/features/owner/bookings/components/BookingsTable";
import { BookingsMockData } from "@/features/owner/bookings/mockdata/mockdata";


export default function BookingsPage() {
    return <div className="min-h-screen py-2">
        <div className=" mb-4">
            {/* Header */}
            <div className="flex  flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="sm:text-3xl text-2xl font-bold">Bookings Management</h1>
                    <p className="sm:mt-2 mt-1">
                        Manage all of the client's bookings here
                    </p>
                </div>
            </div>
            {/* Stats */}
        </div>
        <Card>
            <CardContent >
                <div className="mb-4 flex items-center  gap-4">
                    <Badge variant="outline" className="text-sm">
                        {/* Total Testimonials: {testimonials?.length} */}
                        Total Bookings: 10

                    </Badge>
                </div>
                <BookingsTable bookings={BookingsMockData} />
            </CardContent>
        </Card>
    </div>
}