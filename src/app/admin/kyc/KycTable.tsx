import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Clock, XCircle, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/features/core/components/select';
import { Button } from '@/features/core/components/button';
import { KYCRecord } from "./page";
import { Textarea } from "@/features/core/components/textarea";
import { Label } from "@/features/core/components/label";
import {
    Dialog, DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/features/core/components/dialog";

type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface KYCTableProps {
    records: KYCRecord[];
    onStatusUpdate: (kycId: string, status: KYCStatus, rejectionReason?: string) => Promise<void>;
}

export default function KYCTable({ records, onStatusUpdate }: KYCTableProps) {
    const [updating, setUpdating] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showRejectionDialog, setShowRejectionDialog] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleStatusChange = async (kycId: string, newStatus: KYCStatus) => {
        // If status is REJECTED, show dialog for rejection reason
        if (newStatus === 'REJECTED') {
            setSelectedRecordId(kycId);
            setShowRejectionDialog(true);
            return;
        }

        // For APPROVED or PENDING, update directly
        setUpdating(kycId);
        await onStatusUpdate(kycId, newStatus);
        setUpdating(null);
    };

    const handleRejectionSubmit = async () => {
        if (!selectedRecordId || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setUpdating(selectedRecordId);
        await onStatusUpdate(selectedRecordId, 'REJECTED', rejectionReason);
        setUpdating(null);
        setShowRejectionDialog(false);
        setRejectionReason('');
        setSelectedRecordId(null);
    };

    const getStatusBadge = (status: KYCStatus) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                    </span>
                );
        }
    };

    if (records.length === 0) {
        return (
            <div className="text-center py-12 ">
                No KYC submissions found
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border ">
                <table className="min-w-full divide-y ">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Full Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Nationality
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Identity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Identity Images
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                License
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                License Images
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Submitted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className=" divide-y divide-gray-200">
                        {records.map((record) => (
                            <tr key={record.id} >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium ">{record.fullName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {record.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {record.userRole}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {record.phoneNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {record.nationality}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        <div className="font-medium ">{record.identityType}</div>
                                        <div className="">{record.identityNumber}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewImage(record.identityPhotoUrl)}
                                            className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                        >
                                            <Image
                                                src={record.identityPhotoUrl}
                                                alt="Identity Front"
                                                height={100}
                                                width={100}
                                                className="object-cover cursor-pointer"
                                            />
                                        </button>
                                        <button
                                            onClick={() => setPreviewImage(record.identityBackPhotoUrl)}
                                            className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                        >
                                            <Image
                                                src={record.identityBackPhotoUrl}
                                                alt="Identity Back"
                                                height={100}
                                                width={100}
                                                className="object-cover"
                                            />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {record.hasLicense ? (
                                        <div className="text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
                                            <span className="text-xs ">
                                                {record.licenseExpiryDate &&
                                                    `Exp: ${new Date(record.licenseExpiryDate).toLocaleDateString()}`
                                                }
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {record.hasLicense && record.licenseFrontPhotoUrl && record.licenseBackPhotoUrl ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setPreviewImage(record.licenseFrontPhotoUrl!)}
                                                className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                            >
                                                <Image
                                                    src={record.licenseFrontPhotoUrl}
                                                    alt="License Front"
                                                    height={100}
                                                    width={100}
                                                    className="object-cover"
                                                />
                                            </button>
                                            <button
                                                onClick={() => setPreviewImage(record.licenseBackPhotoUrl!)}
                                                className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors"
                                            >
                                                <Image
                                                    src={record.licenseBackPhotoUrl}
                                                    alt="License Back"
                                                    height={100}
                                                    width={100}
                                                    className="object-cover"
                                                />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(record.status)}
                                    {record.verifiedAt && (
                                        <div className="text-xs  mt-1">
                                            {new Date(record.verifiedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                    {record.rejectionReason && (
                                        <div className="text-xs text-red-600 mt-1 max-w-xs">
                                            {record.rejectionReason}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                    {new Date(record.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Select
                                        value={record.status}
                                        onValueChange={(value) => handleStatusChange(record.id, value as KYCStatus)}
                                        disabled={updating === record.id}
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50  bg-opacity-75 flex items-center justify-center p-4"
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
                                alt="Preview"
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
                        <DialogTitle>Reject KYC Submission</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this KYC submission. This will help the user understand what needs to be corrected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="e.g., Identity document is not clear, license has expired, etc."
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
                                setSelectedRecordId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectionSubmit}
                            disabled={!rejectionReason.trim()}
                        >
                            Reject KYC
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}