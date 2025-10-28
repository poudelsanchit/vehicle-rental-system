"use client"
import React, { useState, useEffect } from 'react';
import { Card } from '@/features/core/components/card';
import { Loader2, AlertCircle } from 'lucide-react';
import KYCTable from './KycTable';

// Types
export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'USER' | 'OWNER';

export interface KYCRecord {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    nationality: string;
    identityType: string;
    identityPhotoUrl: string;
    identityBackPhotoUrl: string;
    identityNumber: string;
    status: KYCStatus;
    userRole: UserRole;
    hasLicense: boolean;
    licenseExpiryDate?: string;
    licenseFrontPhotoUrl?: string
    licenseBackPhotoUrl?: string
    createdAt: string;
    verifiedAt?: string;
    rejectionReason?: string;
}

// Main Component - Fetches data and passes to table
export default function AdminKYC() {
    const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchKYCRecords();
    }, []);

    const fetchKYCRecords = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/v1/admin/kyc');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch KYC records');
            }

            setKycRecords(data.records || []);
            console.log(data.records)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching KYC records:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (kycId: string, newStatus: KYCStatus, rejectionReason?: string) => {
        try {
            const response = await fetch('/api/v1/admin/kyc/update-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    kycId,
                    status: newStatus,
                    rejectionReason,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status');
            }

            // Refresh the list
            fetchKYCRecords();
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err instanceof Error ? err.message : 'Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-red-800">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <Card className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">KYC Verification Management</h1>
                    <p className="text-gray-500">Review and manage user verification requests</p>
                </div>
                <KYCTable
                    records={kycRecords}
                    onStatusUpdate={handleStatusUpdate}
                />
            </Card>
        </div>
    );
}
