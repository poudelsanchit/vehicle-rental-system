"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Input } from "@/features/core/components/input"
import {
    Form, FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/features/core/components/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/core/components/select"
import { Button } from "@/features/core/components/button"
import { Textarea } from "@/features/core/components/textarea"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Label } from "@/features/core/components/label"
import { ImageUpload } from "./ImageUpload"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Form schema with validation
const formSchema = z.object({
    // Personal Information
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], "Must select a gender"),
    nationality: z.string().min(2, "Nationality is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),

    // Address
    currentAddress: z.string().min(5, "Current address must be at least 5 characters"),
    permanentAddress: z.string().optional(),

    // Identity Document
    identityType: z.enum(["NATIONAL_ID", "CITIZENSHIP", "PASSPORT"]),
    identityNumber: z.string().min(5, "Identity number is required"),
    identityPhoto: z.instanceof(File, { message: "Identity photo (front) is required" }),
    identityBackPhoto: z.instanceof(File),

    // Profile Photo
    profilePhoto: z.instanceof(File),

    // Emergency Contact
    emergencyContactName: z.string().min(2, "Emergency contact name is required"),
    emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
    emergencyContactRelation: z.string().min(2, "Relationship is required"),
})

type FormValues = z.infer<typeof formSchema>

const steps = [
    { id: 1, name: "Personal Info", fields: ["fullName", "dateOfBirth", "gender", "nationality", "phoneNumber"] },
    { id: 2, name: "Address", fields: ["currentAddress", "permanentAddress"] },
    { id: 3, name: "Identity Document", fields: ["identityType", "identityNumber", "identityPhoto", "identityBackPhoto", "profilePhoto"] },
    { id: 4, name: "Emergency Contact", fields: ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"] },
]

export default function OwnerVerification() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            fullName: "",
            dateOfBirth: "",
            nationality: "",
            phoneNumber: "",
            currentAddress: "",
            permanentAddress: "",
            identityNumber: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
        },
    })

    const validateStep = async (stepNumber: number) => {
        const stepFields = steps[stepNumber - 1].fields
        const isValid = await form.trigger(stepFields as any)
        return isValid
    }

    const nextStep = async () => {
        const isValid = await validateStep(currentStep)
        if (isValid && currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)

        try {
            const formData = new FormData()

            // Append all form fields to FormData
            formData.append('fullName', values.fullName)
            formData.append('dateOfBirth', values.dateOfBirth)
            formData.append('gender', values.gender)
            formData.append('nationality', values.nationality)
            formData.append('phoneNumber', values.phoneNumber)
            formData.append('currentAddress', values.currentAddress)

            // Optional fields
            if (values.permanentAddress) {
                formData.append('permanentAddress', values.permanentAddress)
            }

            // Identity document
            formData.append('identityType', values.identityType)
            formData.append('identityNumber', values.identityNumber)

            // Required image
            formData.append('identityPhoto', values.identityPhoto)

            // Optional images
            if (values.identityBackPhoto) {
                formData.append('identityBackPhoto', values.identityBackPhoto)
            }

            if (values.profilePhoto) {
                formData.append('profilePhoto', values.profilePhoto)
            }

            // Emergency contact
            formData.append('emergencyContactName', values.emergencyContactName)
            formData.append('emergencyContactPhone', values.emergencyContactPhone)
            formData.append('emergencyContactRelation', values.emergencyContactRelation)

            // Send request to API
            const response = await fetch('/api/v1/verification/kyc/owner', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Submission failed')
            }

            toast.success("KYC verification submitted successfully! Your submission is under review.")
            router.push('/verification')


        } catch (error) {
            console.error('Error submitting KYC:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to submit KYC. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Owner KYC Verification</h1>
                    <p className="text-gray-500">Complete your identity verification to start listing vehicles</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.id
                                                ? "bg-blue-600 text-white ring-4 ring-blue-200"
                                                : "bg-gray-300 text-gray-600"
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? "text-green-600" : "text-gray-500"
                                        }`}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-2 transition-all ${currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="rounded-lg border shadow-xl p-8">
                    <Form {...form}>
                        <div className="space-y-6">

                            {/* Step 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <h2 className="text-2xl font-semibold text-gray-400 mb-4">Personal Information</h2>

                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Full Name *</Label>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} className="h-12" />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter your full name as per government ID
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Date of Birth *</Label>
                                                <FormControl>
                                                    <Input type="date" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Gender *</Label>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 w-full">
                                                            <SelectValue placeholder="Select gender" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="MALE">Male</SelectItem>
                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                        <SelectItem value="OTHER">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="nationality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Nationality *</Label>
                                                <FormControl>
                                                    <Input placeholder="Nepali" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Phone Number *</Label>
                                                <FormControl>
                                                    <Input placeholder="+977 9812345678" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 2: Address */}
                            {currentStep === 2 && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <h2 className="text-2xl font-semibold text-gray-400 mb-4">Address Information</h2>

                                    <FormField
                                        control={form.control}
                                        name="currentAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Current Address *</Label>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Street, City, Province, Postal Code"
                                                        className="min-h-24"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanentAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Permanent Address (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Leave blank if same as current address"
                                                        className="min-h-24"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Only fill if different from current address
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 3: Identity Document */}
                            {currentStep === 3 && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <h2 className="text-2xl font-semibold text-gray-400 mb-4">Identity Document</h2>

                                    <FormField
                                        control={form.control}
                                        name="identityType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Document Type *</Label>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 w-full">
                                                            <SelectValue placeholder="Select document type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                                                        <SelectItem value="CITIZENSHIP">Citizenship</SelectItem>
                                                        <SelectItem value="PASSPORT">Passport</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="identityNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Document Number *</Label>
                                                <FormControl>
                                                    <Input placeholder="Enter ID/Citizenship/Passport number" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* UPDATED: Using ImageUpload Component */}
                                    <ImageUpload
                                        label="Identity Document Photo (Front)"
                                        description="Upload clear photo of the front side"
                                        required
                                        value={form.watch('identityPhoto')}
                                        onChange={(file) => form.setValue('identityPhoto', file as File, { shouldValidate: true })}
                                        error={form.formState.errors.identityPhoto?.message}
                                    />

                                    <ImageUpload
                                        label="Identity Document Photo (Back)"
                                        description="Upload clear photo of the back side (optional)"
                                        value={form.watch('identityBackPhoto')}
                                        onChange={(file) => form.setValue('identityBackPhoto', file as File, { shouldValidate: true })}
                                        error={form.formState.errors.identityBackPhoto?.message}
                                    />

                                    <ImageUpload
                                        label="Profile Photo"
                                        description="Upload a clear photo of yourself"
                                        value={form.watch('profilePhoto')}
                                        onChange={(file) => form.setValue('profilePhoto', file as File, { shouldValidate: true })}
                                        error={form.formState.errors.profilePhoto?.message}
                                    />
                                </div>
                            )}

                            {/* Step 4: Emergency Contact */}
                            {currentStep === 4 && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <h2 className="text-2xl font-semibold text-gray-400 mb-1">Emergency Contact</h2>
                                    <p className="text-gray-400 mb-4">Provide details of someone we can contact in case of emergency</p>

                                    <FormField
                                        control={form.control}
                                        name="emergencyContactName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Contact Name *</Label>
                                                <FormControl>
                                                    <Input placeholder="Jane Doe" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="emergencyContactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Contact Phone *</Label>
                                                <FormControl>
                                                    <Input placeholder="+977 9812345678" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="emergencyContactRelation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Relationship *</Label>
                                                <FormControl>
                                                    <Input placeholder="Spouse, Parent, Sibling, Friend" {...field} className="h-12" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}


                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="h-12 px-6"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>

                            {currentStep < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="h-12 px-6"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isSubmitting}
                                    className="h-12 px-6 bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit KYC"}
                                    <Check className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </Form>
                </div>

                {/* Step Indicator */}
                <div className="text-center mt-6 text-gray-600">
                    Step {currentStep} of {steps.length}
                </div>
            </div>
        </div>
    )
}