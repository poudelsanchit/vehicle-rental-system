'use client'

import { Button } from "@/features/core/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/features/core/components/form";
import { Input } from "@/features/core/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/core/components/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/features/core/components/sheet";
import { ImageUpload } from "@/features/verification/kyc/components/ImageUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";


export const vehicleFormSchema = z.object({
    // Basic Info
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
    brand: z.string().min(2, "Brand must be at least 2 characters").max(50, "Brand must be less than 50 characters"),
    model: z.string().min(1, "Model must be at least 1 character").max(50, "Model must be less than 50 characters"),

    // Fix: Use z.number() with preprocess instead of z.coerce
    year: z.preprocess(
        (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
        z.number()
            .min(1900, "Year must be 1900 or later")
            .max(new Date().getFullYear() + 1, `Year cannot be more than ${new Date().getFullYear() + 1}`)
    ),

    type: z.enum(["CAR", "BIKE", "SUV", "VAN", "TRUCK"], {
        errorMap: () => ({ message: "Please select a vehicle type" })
    }),
    transmission: z.enum(["MANUAL", "AUTOMATIC"], {
        errorMap: () => ({ message: "Please select transmission type" })
    }),
    fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"], {
        errorMap: () => ({ message: "Please select fuel type" })
    }),
    color: z.string().min(2, "Color must be at least 2 characters").max(30, "Color must be less than 30 characters"),

    // Fix: Use z.number() with preprocess
    seatingCapacity: z.preprocess(
        (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
        z.number()
            .min(1, "Seating capacity must be at least 1")
            .max(50, "Seating capacity cannot exceed 50")
    ),

    // Registration & Rental
    registrationNumber: z.string()
        .min(3, "Registration number must be at least 3 characters")
        .max(20, "Registration number must be less than 20 characters")
        .regex(/^[A-Z0-9\s-]+$/i, "Only letters, numbers, spaces and hyphens allowed"),

    // Fix: Use z.number() with preprocess
    pricePerDay: z.preprocess(
        (val) => (val === "" || val === null || val === undefined) ? undefined : Number(val),
        z.number()
            .min(0, "Price must be 0 or greater")
            .max(1000000, "Price seems unreasonably high")
    ),
    pickupLocation: z.string().min(3, "Pickup location must be at least 3 characters").max(200, "Pickup location must be less than 200 characters"),

    // Insurance
    insuranceValidTill: z.string().min(1, "Insurance expiry date is required"),

    // Documents
    bluebookImage: z
        .instanceof(File, { message: "Bluebook image is required" })
        .refine((file) => file.size > 0, "Bluebook image is required")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            "Only JPEG, PNG, and WebP images are allowed"
        ),
    insuranceDocumentImage: z
        .instanceof(File, { message: "Insurance document is required" })
        .refine((file) => file.size > 0, "Insurance document is required")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            "Only JPEG, PNG, and WebP images are allowed"
        ),

    // Photos
    vehicleFrontPhoto: z
        .instanceof(File, { message: "Front photo is required" })
        .refine((file) => file.size > 0, "Front photo is required")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            "Only JPEG, PNG, and WebP images are allowed"
        ),
    vehicleBackPhoto: z
        .instanceof(File, { message: "Back photo is required" })
        .refine((file) => file.size > 0, "Back photo is required")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            "Only JPEG, PNG, and WebP images are allowed"
        ),
    vehicleInteriorPhoto: z
        .instanceof(File, { message: "Interior photo is required" })
        .refine((file) => file.size > 0, "Interior photo is required")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            "Only JPEG, PNG, and WebP images are allowed"
        ),
    vehicleSidePhoto: z
        .instanceof(File, { message: "Side photo is required" })
        .refine((file) => file.size > 0, "Side photo is required")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be under 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
            "Only JPEG, PNG, and WebP images are allowed"
        ),
});

// Add this type export to help TypeScript
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;




// API service function
async function createVehicleAPI(formData: FormData) {
    const response = await fetch('/api/vehicles', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}


export default function CreateVehicle() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Then update your useForm call:
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: {
            title: "",
            brand: "",
            model: "",
            color: "",
            pickupLocation: "",
            registrationNumber: "",
        },
    });

    async function onSubmit(values: z.infer<typeof vehicleFormSchema>) {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // Append text fields
            formData.append("title", values.title);
            formData.append("brand", values.brand);
            formData.append("model", values.model);
            formData.append("year", values.year.toString());
            formData.append("type", values.type);
            formData.append("transmission", values.transmission);
            formData.append("fuelType", values.fuelType);
            formData.append("color", values.color);
            formData.append("seatingCapacity", values.seatingCapacity.toString());
            formData.append("registrationNumber", values.registrationNumber);
            formData.append("pricePerDay", values.pricePerDay.toString());
            formData.append("pickupLocation", values.pickupLocation);
            formData.append("insuranceValidTill", values.insuranceValidTill);

            // Append image files
            formData.append("bluebookImage", values.bluebookImage);
            formData.append("insuranceDocumentImage", values.insuranceDocumentImage);
            formData.append("vehicleFrontPhoto", values.vehicleFrontPhoto);
            formData.append("vehicleBackPhoto", values.vehicleBackPhoto);
            formData.append("vehicleInteriorPhoto", values.vehicleInteriorPhoto);
            formData.append("vehicleSidePhoto", values.vehicleSidePhoto);

            const result = await createVehicleAPI(formData);

            if (result.success) {
                toast.success("Vehicle Created Successfully! 🎉", {
                    description: result.message || `Vehicle "${values.title}" has been added.`,
                    duration: 5000,
                });

                form.reset();
                setIsSheetOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to Create Vehicle ❌", {
                    description: result.error || "Something went wrong. Please try again.",
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast.error("Submission Error ❌", {
                description: errorMessage,
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleCancel() {
        form.reset();
        setIsSheetOpen(false);
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => setIsSheetOpen(true)}>
                    <Plus className="w-5 h-5" />
                    Add New Vehicle
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl gap-0 pb-2 p-6 md:max-w-2xl lg:max-w-3xl h-full font-medium dark:bg-neutral-950 text-black dark:text-white overflow-y-auto">
                <SheetHeader className="mb-2 p-0 border-b pb-4 gap-0.5">
                    <SheetTitle className="text-xl">Add New Vehicle</SheetTitle>
                    <SheetDescription className="text-sm font-normal">
                        Add a new vehicle to your fleet. All fields marked with * are required.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        {/* Basic Information */}
                        <div className="space-y-4 border-b pb-6">
                            <h3 className="text-sm font-semibold">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Title <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Toyota Corolla 2023 - Premium" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Brand <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Toyota" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Model <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Corolla" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Year <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="2023" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Color <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., White" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="seatingCapacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Seats <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="5" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Type <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CAR">Car</SelectItem>
                                                    <SelectItem value="BIKE">Bike</SelectItem>
                                                    <SelectItem value="SUV">SUV</SelectItem>
                                                    <SelectItem value="VAN">Van</SelectItem>
                                                    <SelectItem value="TRUCK">Truck</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="transmission"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Transmission <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MANUAL">Manual</SelectItem>
                                                    <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fuelType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Fuel Type <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PETROL">Petrol</SelectItem>
                                                    <SelectItem value="DIESEL">Diesel</SelectItem>
                                                    <SelectItem value="ELECTRIC">Electric</SelectItem>
                                                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Registration & Rental */}
                        <div className="space-y-4 border-b pb-6">
                            <h3 className="text-sm font-semibold">Registration & Rental Details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Registration Number <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., BA-1-PA-1234" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pricePerDay"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Price Per Day (NPR) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="5000" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="pickupLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Pickup Location <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Lakeside, Pokhara" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="insuranceValidTill"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Insurance Valid Till <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Documents */}
                        <div className="space-y-4 border-b pb-6">
                            <h3 className="text-sm font-semibold">Documents</h3>


                            <ImageUpload
                                label="Vehicle Bluebook Image"
                                description="Upload clear photo of the vehicle's Bluebook"
                                required
                                value={form.watch('bluebookImage')}
                                onChange={(file) => form.setValue('bluebookImage', file as File, { shouldValidate: true })}
                                error={form.formState.errors.bluebookImage?.message}
                            />
                            <ImageUpload
                                label="Vehicle Insurance Document Photo"
                                description="Upload clear photo of the vehicle's insurance document"
                                required
                                value={form.watch('insuranceDocumentImage')}
                                onChange={(file) => form.setValue('insuranceDocumentImage', file as File, { shouldValidate: true })}
                                error={form.formState.errors.insuranceDocumentImage?.message}
                            />

                        </div>

                        {/* Vehicle Photos */}
                        <div className="space-y-4 border-b pb-6">
                            <h3 className="text-sm font-semibold">Vehicle Photos</h3>
                            <ImageUpload
                                label="Vehicle Back Photo"
                                description="Upload clear photo of the vehicle's back"
                                required
                                value={form.watch('vehicleFrontPhoto')}
                                onChange={(file) => form.setValue('vehicleFrontPhoto', file as File, { shouldValidate: true })}
                                error={form.formState.errors.vehicleFrontPhoto?.message}
                            />
                            <ImageUpload
                                label="Vehicle Back Photo"
                                description="Upload clear photo of the vehicle's back"
                                required
                                value={form.watch('vehicleBackPhoto')}
                                onChange={(file) => form.setValue('vehicleBackPhoto', file as File, { shouldValidate: true })}
                                error={form.formState.errors.vehicleBackPhoto?.message}
                            />
                            <ImageUpload
                                label="Vehicle Side Photo"
                                description="Upload clear photo of the vehicle's side view"
                                required
                                value={form.watch('vehicleSidePhoto')}
                                onChange={(file) => form.setValue('vehicleSidePhoto', file as File, { shouldValidate: true })}
                                error={form.formState.errors.vehicleSidePhoto?.message}
                            />


                            <ImageUpload
                                label="Vehicle Interior Photo"
                                description="Upload clear photo of the vehicle's interior"
                                required
                                value={form.watch('vehicleInteriorPhoto')}
                                onChange={(file) => form.setValue('vehicleInteriorPhoto', file as File, { shouldValidate: true })}
                                error={form.formState.errors.vehicleInteriorPhoto?.message}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="py-5 px-5"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="py-5"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Save Vehicle <Car className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}