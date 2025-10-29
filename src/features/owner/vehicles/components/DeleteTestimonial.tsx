'use client'
import { ITestimonial } from "@/app/actions/testimonials";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/features/shared/components/alert-dialog";
import { Button } from "@/features/shared/components/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
interface IDeleteTestimonialProps {
    testimonial: ITestimonial
}
// API service function for delete
async function deleteTestimonialAPI(projectId: string) {
    const response = await fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: projectId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}
export default function DeleteTestimonial({ testimonial }: IDeleteTestimonialProps) {

    const router = useRouter()
    const handleDeleteTestimonial = async () => {
        try {
            const result = await deleteTestimonialAPI(testimonial.id);
            if (result.success) {
                toast.success('Project Deleted Successfully 🗑️', {
                    description: result.message || `Project "${testimonial.name}" has been deleted.`,
                    duration: 5000,
                });
                // Refresh the page to reflect changes
                router.refresh();
            } else {
                toast.error('Failed to Delete Project ❌', {
                    description: result.error || 'Something went wrong. Please try again.',
                    duration: 5000,
                });
            }

        } catch (error) {
            console.error("Error deleting testimonial:", error)
            toast.error("Failed to delete testimonial. Please try again.")
        }
    }
    return <div className="flex items-center justify-end gap-2">
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="icon" className="bg-red-700 hover:bg-red-800">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this testimonial from {testimonial.name}? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteTestimonial}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
}