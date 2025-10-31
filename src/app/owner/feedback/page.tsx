"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/core/components/card";
import { Badge } from "@/features/core/components/badge";
import { Button } from "@/features/core/components/button";
import { Skeleton } from "@/features/core/components/skeleton";
import { Star, TrendingUp, Users, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";

interface Feedback {
    id: string;
    vehicleRating: number;
    serviceRating: number;
    overallRating: number;
    vehicleReview?: string;
    serviceReview?: string;
    wouldRecommend: boolean;
    createdAt: string;
    booking: {
        id: string;
        startDate: string;
        endDate: string;
        totalAmount: number;
        user: {
            username: string;
            email: string;
        };
        vehicle: {
            id: string;
            title: string;
            brand: string;
            model: string;
            year: number;
            vehicleFrontPhoto: string;
        };
    };
}

interface VehicleStats {
    vehicle: {
        id: string;
        title: string;
        brand: string;
        model: string;
        year: number;
        vehicleFrontPhoto: string;
    };
    feedbackCount: number;
    avgVehicleRating: number;
    avgServiceRating: number;
    avgOverallRating: number;
    recommendationRate: number;
}

interface FeedbackData {
    feedback: Feedback[];
    statistics: {
        totalReviews: number;
        avgVehicleRating: number;
        avgServiceRating: number;
        avgOverallRating: number;
        recommendationRate: number;
    };
    vehicleStats: VehicleStats[];
}

export default function OwnerFeedbackPage() {
    const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'reviews' | 'vehicles'>('overview');

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await fetch("/api/v1/owner/feedback");
            if (response.ok) {
                const data = await response.json();
                setFeedbackData(data);
            } else {
                toast.error("Failed to fetch feedback data");
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
            toast.error("Error loading feedback");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!feedbackData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Failed to load feedback</h2>
                    <Button onClick={fetchFeedback}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Customer Feedback</h1>
                <Button onClick={fetchFeedback} variant="outline">
                    Refresh
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 border p-1 rounded-lg w-fit">
                <button
                    onClick={() => setSelectedTab('overview')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'overview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : ' hover:text-neutral-50 cursor-pointer'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setSelectedTab('reviews')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'reviews'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : ' hover:text-neutral-50 cursor-pointer'
                        }`}
                >
                    All Reviews
                </button>
                <button
                    onClick={() => setSelectedTab('vehicles')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === 'vehicles'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : ' hover:text-neutral-50 cursor-pointer'
                        }`}
                >
                    By Vehicle
                </button>
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackData.statistics.totalReviews}</div>
                                <p className="text-xs text-muted-foreground">Customer feedback received</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackData.statistics.avgOverallRating}/5</div>
                                <div className="flex items-center gap-1 mt-1">
                                    {renderStars(Math.round(feedbackData.statistics.avgOverallRating))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Vehicle Rating</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackData.statistics.avgVehicleRating}/5</div>
                                <p className="text-xs text-muted-foreground">Vehicle condition & quality</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Recommendation Rate</CardTitle>
                                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{feedbackData.statistics.recommendationRate}%</div>
                                <p className="text-xs text-muted-foreground">Would recommend to others</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Reviews */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feedbackData.feedback.slice(0, 5).map((feedback) => (
                                    <div key={feedback.id} className="border-b pb-4 last:border-b-0">
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                <Image
                                                    src={feedback.booking.vehicle.vehicleFrontPhoto}
                                                    alt={`${feedback.booking.vehicle.brand} ${feedback.booking.vehicle.model}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">
                                                            {feedback.booking.vehicle.brand} {feedback.booking.vehicle.model}
                                                        </h4>
                                                        <p className="text-sm ">
                                                            by {feedback.booking.user.username}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1">
                                                            {renderStars(feedback.overallRating)}
                                                            <span className="text-sm ml-1">{feedback.overallRating}/5</span>
                                                        </div>
                                                        <p className="text-xs ">
                                                            {format(new Date(feedback.createdAt), "MMM dd, yyyy")}
                                                        </p>
                                                    </div>
                                                </div>
                                                {(feedback.vehicleReview || feedback.serviceReview) && (
                                                    <div className="space-y-2">
                                                        {feedback.vehicleReview && (
                                                            <p className="text-sm ">
                                                                <strong>Vehicle:</strong> {feedback.vehicleReview}
                                                            </p>
                                                        )}
                                                        {feedback.serviceReview && (
                                                            <p className="text-sm ">
                                                                <strong>Service:</strong> {feedback.serviceReview}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {feedback.wouldRecommend && (
                                                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
                                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                                        Recommends
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {feedbackData.feedback.length === 0 && (
                                    <p className="text-center  py-8">No reviews yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* All Reviews Tab */}
            {selectedTab === 'reviews' && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Customer Reviews ({feedbackData.feedback.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {feedbackData.feedback.map((feedback) => (
                                <div key={feedback.id} className="border rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                            <Image
                                                src={feedback.booking.vehicle.vehicleFrontPhoto}
                                                alt={`${feedback.booking.vehicle.brand} ${feedback.booking.vehicle.model}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">
                                                        {feedback.booking.vehicle.brand} {feedback.booking.vehicle.model} ({feedback.booking.vehicle.year})
                                                    </h4>
                                                    <p className="text-sm ">
                                                        Customer: {feedback.booking.user.username}
                                                    </p>
                                                    <p className="text-xs ">
                                                        Booking: {format(new Date(feedback.booking.startDate), "MMM dd")} - {format(new Date(feedback.booking.endDate), "MMM dd, yyyy")}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs  mb-1">
                                                        {format(new Date(feedback.createdAt), "MMM dd, yyyy")}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Ratings */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm font-medium ">Vehicle</p>
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(feedback.vehicleRating)}
                                                        <span className="text-sm ml-1">{feedback.vehicleRating}/5</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium ">Service</p>
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(feedback.serviceRating)}
                                                        <span className="text-sm ml-1">{feedback.serviceRating}/5</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium ">Overall</p>
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(feedback.overallRating)}
                                                        <span className="text-sm ml-1">{feedback.overallRating}/5</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reviews */}
                                            {(feedback.vehicleReview || feedback.serviceReview) && (
                                                <div className="space-y-3">
                                                    {feedback.vehicleReview && (
                                                        <div>
                                                            <p className="text-sm font-medium mb-1">Vehicle Review:</p>
                                                            <p className="text-sm  border bg-background text-white  p-3 rounded">
                                                                {feedback.vehicleReview}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {feedback.serviceReview && (
                                                        <div>
                                                            <p className="text-sm font-medium  mb-1">Service Review:</p>
                                                            <p className="text-sm  border bg-background text-white p-3 rounded">
                                                                {feedback.serviceReview}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {feedback.wouldRecommend && (
                                                <Badge variant="outline" className="mt-3 bg-green-50 text-green-700">
                                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                                    Would Recommend
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {feedbackData.feedback.length === 0 && (
                                <p className="text-center  py-8">No reviews yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* By Vehicle Tab */}
            {selectedTab === 'vehicles' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {feedbackData.vehicleStats.map((vehicleStats) => (
                        <Card key={vehicleStats.vehicle.id}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                        <Image
                                            src={vehicleStats.vehicle.vehicleFrontPhoto}
                                            alt={`${vehicleStats.vehicle.brand} ${vehicleStats.vehicle.model}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {vehicleStats.vehicle.brand} {vehicleStats.vehicle.model}
                                        </CardTitle>
                                        <p className="text-sm ">
                                            {vehicleStats.feedbackCount} review{vehicleStats.feedbackCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium ">Vehicle Rating</p>
                                            <div className="flex items-center gap-1">
                                                {renderStars(Math.round(vehicleStats.avgVehicleRating))}
                                                <span className="text-sm ml-1">{vehicleStats.avgVehicleRating}/5</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium ">Service Rating</p>
                                            <div className="flex items-center gap-1">
                                                {renderStars(Math.round(vehicleStats.avgServiceRating))}
                                                <span className="text-sm ml-1">{vehicleStats.avgServiceRating}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium ">Overall Rating</p>
                                            <div className="flex items-center gap-1">
                                                {renderStars(Math.round(vehicleStats.avgOverallRating))}
                                                <span className="text-sm ml-1">{vehicleStats.avgOverallRating}/5</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium ">Recommendation</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {vehicleStats.recommendationRate}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {feedbackData.vehicleStats.length === 0 && (
                        <div className="col-span-2 text-center py-8">
                            <p className="">No vehicle feedback available yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}