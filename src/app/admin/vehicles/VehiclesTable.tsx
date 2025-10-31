import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Clock, XCircle, X, Car, MapPin, Calendar, DollarSign } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/features/core/components/select';
import { Button } from '@/features/core/components/button';
import { Textarea } from "@/features/core/components/textarea";
import { Label } from "@/features/core/components/label";
import { Badge } from "@/features/core/components/badge";
import {
    Dialog, DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/features/core/components/dialog";

type VerificationStatus = 'PENDING' | 'ACCEPTED_FOR_PAYMENT' | 'REJECTED' | 'APPROVED';
type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED';

interface Vehicle {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    registrationNumber: string;
    verificationStatus: VerificationStatus;
    paymentStatus: PaymentStatus;
    verificationFee: number;
    rejectionReason?: string;
    pricePerDay: number;
    pickupLocation: string;
    fuelType: string;
    transmission: string;
    seatingCapacity: number;
    type: string;
    category: string;
    color: string;
    // Vehicle photos
    vehicleFrontPhoto: string;
    vehicleBackPhoto: string;
    vehicleInteriorPhoto: string;
    vehicleSidePhoto: string;
    // Documents
    bluebookImage: string;
    insuranceDocumentImage: string;
    insuranceValidTill: string;
    user: {
        username: string;
        email: string;
    };
    createdAt: string;
    verifiedAt?: string;
}

interface VehiclesTableProps {
    vehicles: Vehicle[];
    onStatusUpdate: (vehicleId: string, status: VerificationStatus, rejectionReason?: string) => Promise<void>;
}

export default function VehiclesTable({ vehicles, onStatusUpdate }: VehiclesTableProps) {
    const [updating, setUpdating] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showRejectionDialog, setShowRejectionDialog] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleStatusChange = async (vehicleId: string, newStatus: VerificationStatus) => {
        // If status is REJECTED, show dialog for rejection reason
        if (newStatus === 'REJECTED') {
            setSelectedVehicleId(vehicleId);
            setShowRejectionDialog(true);
            return;
        }

        // For other statuses, update directly
        setUpdating(vehicleId);
        await onStatusUpdate(vehicleId, newStatus);
        setUpdating(null);
    };

    const handleRejectionSubmit = async () => {
        if (!selectedVehicleId || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setUpdating(selectedVehicleId);
        await onStatusUpdate(selectedVehicleId, 'REJECTED', rejectionReason);
        setUpdating(null);
        setShowRejectionDialog(false);
        setRejectionReason('');
        setSelectedVehicleId(null);
    };

    const getVerificationStatusBadge = (status: VerificationStatus) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                    </Badge>
                );
            case 'ACCEPTED_FOR_PAYMENT':
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <DollarSign className="w-3 h-3 mr-1" /> Accepted for Payment
                    </Badge>
                );
            case 'PENDING':
                return (
                    <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                );
        }
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case 'PAID':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Paid
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge variant="destructive">
                        Failed
                    </Badge>
                );
            case 'UNPAID':
                return (
                    <Badge variant="secondary">
                        Unpaid
                    </Badge>
                );
        }
    };

    if (vehicles.length === 0) {
        return (
            <div className="text-center py-12">
                No vehicles found for verification
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Vehicle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Images
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Pricing
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Verification Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Payment Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Submitted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle.id}>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm">{vehicle.title}</div>
                                        <div className="text-sm ">
                                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                                        </div>
                                        <div className="text-xs text-gray-200 flex items-center">
                                            <Car className="w-3 h-3 mr-1" />
                                            {vehicle.registrationNumber}
                                        </div>
                                        <div className="text-xs text-gray-200 flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {vehicle.pickupLocation}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm">{vehicle.user.username}</div>
                                        <div className="text-xs text-gray-200">{vehicle.user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1 text-xs">
                                        <div><span className="font-medium">Type:</span> {vehicle.type}</div>
                                        <div><span className="font-medium">Category:</span> {vehicle.category}</div>
                                        <div><span className="font-medium">Fuel:</span> {vehicle.fuelType}</div>
                                        <div><span className="font-medium">Transmission:</span> {vehicle.transmission}</div>
                                        <div><span className="font-medium">Seats:</span> {vehicle.seatingCapacity}</div>
                                        <div><span className="font-medium">Color:</span> {vehicle.color}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-gray-300">Vehicle Photos</div>
                                        <div className="flex gap-1 flex-wrap">
                                            {[
                                                { src: vehicle.vehicleFrontPhoto, label: 'Front' },
                                                { src: vehicle.vehicleBackPhoto, label: 'Back' },
                                                { src: vehicle.vehicleInteriorPhoto, label: 'Interior' },
                                                { src: vehicle.vehicleSidePhoto, label: 'Side' }
                                            ].map((photo, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setPreviewImage(photo.src)}
                                                    className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                                    title={photo.label}
                                                >
                                                    <Image
                                                        src={photo.src}
                                                        alt={photo.label}
                                                        fill
                                                        className="object-cover cursor-pointer"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-xs font-medium text-gray-300 mt-2">Documents</div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setPreviewImage(vehicle.bluebookImage)}
                                                className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                                title="Bluebook"
                                            >
                                                <Image
                                                    src={vehicle.bluebookImage}
                                                    alt="Bluebook"
                                                    fill
                                                    className="object-cover cursor-pointer"
                                                />
                                            </button>
                                            <button
                                                onClick={() => setPreviewImage(vehicle.insuranceDocumentImage)}
                                                className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                                title="Insurance"
                                            >
                                                <Image
                                                    src={vehicle.insuranceDocumentImage}
                                                    alt="Insurance"
                                                    fill
                                                    className="object-cover cursor-pointer"
                                                />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-200">
                                            Insurance valid till: {new Date(vehicle.insuranceValidTill).toLocaleDateString()}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            NPR {vehicle.pricePerDay.toLocaleString()}/day
                                        </div>
                                        <div className="text-xs text-gray-200">
                                            Verification Fee: NPR {vehicle.verificationFee.toLocaleString()}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        {getVerificationStatusBadge(vehicle.verificationStatus)}
                                        {vehicle.verifiedAt && (
                                            <div className="text-xs text-gray-200">
                                                Verified: {new Date(vehicle.verifiedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                        {vehicle.rejectionReason && (
                                            <div className="text-xs text-red-600 max-w-xs">
                                                {vehicle.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getPaymentStatusBadge(vehicle.paymentStatus)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-200">
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(vehicle.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {vehicle.verificationStatus === 'PENDING' && (
                                        <div className="space-y-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusChange(vehicle.id, 'ACCEPTED_FOR_PAYMENT')}
                                                disabled={updating === vehicle.id}
                                                className="w-full"
                                            >
                                                Accept for Payment
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleStatusChange(vehicle.id, 'REJECTED')}
                                                disabled={updating === vehicle.id}
                                                className="w-full"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                    {vehicle.verificationStatus === 'ACCEPTED_FOR_PAYMENT' && vehicle.paymentStatus === 'PAID' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleStatusChange(vehicle.id, 'APPROVED')}
                                            disabled={updating === vehicle.id}
                                            className="w-full"
                                        >
                                            Approve Vehicle
                                        </Button>
                                    )}
                                    {vehicle.verificationStatus === 'ACCEPTED_FOR_PAYMENT' && vehicle.paymentStatus === 'UNPAID' && (
                                        <div className="text-xs text-blue-600 text-center">
                                            Waiting for payment
                                        </div>
                                    )}
                                    {(vehicle.verificationStatus === 'APPROVED' || vehicle.verificationStatus === 'REJECTED') && (
                                        <Select
                                            value={vehicle.verificationStatus}
                                            onValueChange={(value) => handleStatusChange(vehicle.id, value as VerificationStatus)}
                                            disabled={updating === vehicle.id}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        Pending
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="ACCEPTED_FOR_PAYMENT">
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-4 h-4 mr-2" />
                                                        Accept for Payment
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="APPROVED">
                                                    <div className="flex items-center">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approved
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="REJECTED">
                                                    <div className="flex items-center">
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Rejected
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="relative w-full h-full">
                            <Image
                                src={previewImage}
                                alt="Vehicle Preview"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Dialog */}
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Vehicle Verification</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this vehicle verification. This will help the owner understand what needs to be corrected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="e.g., Vehicle documents are not clear, registration number doesn't match, etc."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectionDialog(false);
                                setRejectionReason('');
                                setSelectedVehicleId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectionSubmit}
                            disabled={!rejectionReason.trim()}
                        >
                            Reject Vehicle
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}