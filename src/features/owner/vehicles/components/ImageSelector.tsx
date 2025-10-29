import { Button } from "@/features/core/components/button";
import { Input } from "@/features/core/components/input";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";
import z from "zod";
import { UseFormReturn } from "react-hook-form";
import { testimonialFormSchema } from "./CreateVehicle";
import Image from "next/image";
type FormSchema = z.infer<typeof testimonialFormSchema>;

interface ImageSelectorProps {
    form: UseFormReturn<FormSchema>;
    selectedImage: File | null;
}

export default function ImageSelector({ form, selectedImage }: ImageSelectorProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    };

    const removeImage = () => {
        form.resetField("image");
        // Reset file input
        const fileInput = document.getElementById("image-input") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col w-full rounded-lg border border-dashed border-gray-300 bg-white p-6 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-950 transition-colors"
                >
                    <div className="flex items-center gap-4 w-full ">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300">
                            <ImageIcon size={24} />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="text-base font-semibold text-gray-800 dark:text-neutral-200 mb-1">
                                Upload Profile Image
                            </div>
                            <div className="text-sm text-gray-500 dark:text-neutral-400">
                                <span className="text-xs">
                                    Supported formats: PNG, JPG, JPEG, GIF, WEBP (max 5MB )
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <Input
                    ref={fileInputRef}
                    id="image-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                />
            </div>


            {selectedImage && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            <Image
                                height={100}
                                width={100}
                                src={URL.createObjectURL(selectedImage)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{selectedImage.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="text-red-500 hover:text-red-400 hover:bg-red-50"
                    >
                        Remove
                    </Button>
                </div>
            )}
        </div>
    );
}
