import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { Button } from '@/features/core/components/button';
import { Label } from '@/features/core/components/label';
import { Input } from '@/features/core/components/input';

interface ImageUploadProps {
    label: string;
    description?: string;
    required?: boolean;
    value?: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    description,
    required = false,
    value,
    onChange,
    error,
    accept = "image/jpeg,image/jpg,image/png,image/webp"
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            onChange(file);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-3">
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            {/* Upload Area */}
            {!value ? (
                <div
                    onClick={handleClick}
                    className="flex cursor-pointer flex-col w-full rounded-lg border border-dashed border-gray-300 bg-white p-6 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-950 transition-colors"
                >
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300">
                            <Camera size={24} />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="text-base font-semibold text-gray-800 dark:text-neutral-200 mb-1">
                                Click to upload image
                            </div>
                            <div className="text-sm text-gray-500 dark:text-neutral-400">
                                <span className="text-xs">
                                    {description || "Supported formats: PNG, JPG, JPEG, WEBP (max 5MB)"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Preview with Remove Button */
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                            <Image
                                height={100}
                                width={100}
                                src={URL.createObjectURL(value)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {value.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(value.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                    </Button>
                </div>
            )}

            {/* Hidden File Input */}
            <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};