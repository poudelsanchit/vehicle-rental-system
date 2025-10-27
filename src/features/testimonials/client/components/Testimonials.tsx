import { InfiniteSlider } from "@/features/animations/components/infinite-slider";
import { AnimatedButton } from "@/features/animations/components/animated-component";
import { fadeInDown } from "@/features/core/hooks/use-scroll-animation";
import TestimonialCard from "./TestimonialCard";
import { ITestimonial } from "../../types/types";

interface ITestimonialsProps {
    testimonials?: ITestimonial[]
}

export default function Testimonials({ testimonials = [] }: ITestimonialsProps) {
    // Split testimonials into two halves
    const midpoint = Math.ceil(testimonials.length / 2);
    const firstHalf = testimonials?.slice(0, midpoint);
    const secondHalf = testimonials?.slice(midpoint);

    return <div id="testimonials"
        className={`flex lg:flex-row flex-col justify-center items-center w-full sm:mt-24 mt-10 h-max border-t-[0.1px] font-Poppins sm:pt-16 pt-8`}
    >
        <div className="font-Poppins flex flex-col lg:w-[92%] w-[90%]">
            <div className="flex w-full sm:gap-6 gap-4 flex-col">

                <AnimatedButton variants={fadeInDown}>
                    <div className="flex flex-col items-center text-center gap-2">
                        <h1 className="text-3xl font-semibold">Testimonials</h1>
                        <p className="text-muted-foreground">Trusted by clients who value quality and results.</p>
                    </div>
                </AnimatedButton>

                {/* First slider with first half of testimonials */}
                <InfiniteSlider speedOnHover={30} speed={70} gap={16} >
                    {firstHalf?.map((testimonial, index) => (
                        <TestimonialCard index={index} testimonial={testimonial} key={testimonial.id} />
                    ))}
                </InfiniteSlider>

                {/* Second slider with second half of testimonials (reverse direction) */}
                <InfiniteSlider speedOnHover={30} speed={70} gap={16} reverse >
                    {secondHalf?.map((testimonial, index) => (
                        <TestimonialCard index={index} testimonial={testimonial} key={testimonial.id} />
                    ))}
                </InfiniteSlider>
            </div>
        </div>
    </div>
}