import { Card, CardContent } from "@/features/core/components/card";
import Image from "next/image";
import { BiSolidQuoteAltLeft } from "react-icons/bi";
import { ITestimonial } from "../../types/types";

interface ITestimonialCardProps {
    testimonial: ITestimonial,
    index: number
}
export default function TestimonialCard({ testimonial, index }: ITestimonialCardProps) {
    return <Card
        key={`${testimonial.content}-${index}`}
        className="sm:w-[28rem] w-[85vw] min-w-[280px] sm:h-60 h-auto min-h-[220px] shrink-0 py-2 cursor-pointer"
    >
        <CardContent className="sm:p-6 p-4 h-full">
            <div className="flex flex-col h-full sm:gap-4 gap-3">
                {/* Quote Icon */}
                <BiSolidQuoteAltLeft
                    size={30}
                    className="text-[#364ee6] sm:w-[30px] sm:h-[30px] w-[24px] h-[24px]"
                />

                {/* Testimonial Content */}
                <blockquote className="sm:text-sm text-xs text-muted-foreground flex items-center flex-1">
                    {`"${testimonial.content}"`}
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-auto">
                    <Image
                        height={48}
                        width={48}
                        src={testimonial.image}
                        alt={`${testimonial.name} avatar`}
                        className="sm:h-12 sm:w-12 h-10 w-10 object-cover rounded-full border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold sm:text-sm text-xs truncate">
                            {testimonial.name}
                        </div>
                        <div className="sm:text-xs text-[10px] text-muted-foreground truncate">
                            {testimonial.role}
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
}