"use client"
import OwnerVerification from "@/features/verification/kyc/components/OwnerVerification";
import UserVerification from "@/features/verification/kyc/components/UserVerification";
import { useSession } from "next-auth/react";

export default function KYC() {
    const { data: session, status } = useSession();


    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">loading...</div>
    }
    return <>
        {session?.user?.role === "USER" ? <UserVerification /> : <OwnerVerification />}
    </>

}