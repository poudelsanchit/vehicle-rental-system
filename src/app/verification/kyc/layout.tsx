"use client"
import { Button } from "@/features/core/components/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import React from "react"

export default function KYCLAYOUT({ children }: {
    children: React.ReactNode
}) {
    return <div >
        <Button onClick={() => signOut()} className="w-40 absolute top-4 right-4" size="lg">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
        </Button>
        {children}
    </div>
}