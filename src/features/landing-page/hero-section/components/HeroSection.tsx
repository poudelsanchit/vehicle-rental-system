import Link from "next/link";
import { AnimatedGroup } from "../../components/animated-group";
import { Button } from "@/features/core/components/button";
import Image from "next/image";
import RentalImage from "../assets/vechile-rent.png";

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: "blur(12px)",
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} as const;

export default function HeroSection() {

    return <section >
        <div className="relative pt-24 md:pt-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">

                    {/* preset="fade-in-blur" speedSegment={0.3} */}
                    <AnimatedGroup variants={transitionVariants}>
                        <div className=" text-balance text-5xl sm:5xl md:text-7xl lg:mt-16 xl:text-[5.25rem] dark:text-white text-black">
                            Find the Perfect Ride, Anytime, Anywhere.
                        </div>

                        <div className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                            Go Gadi helps you rent cars, bikes, and more from trusted vehicle owners across Nepal.
                        </div>
                    </AnimatedGroup>

                    <AnimatedGroup
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.75,
                                    },
                                },
                            },
                            ...transitionVariants,
                        }}
                        className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                    >
                        <div
                            key={1}
                            className="bg-foreground/10 rounded-sm border p-0.5"
                        >
                            <Button
                                asChild
                                size="lg"
                                className="rounded-sm px-5 text-base"
                            >
                                <Link href="/vechicles">
                                    <span className="text-nowrap">Find a Vehicle</span>
                                </Link>
                            </Button>
                        </div>
                        <Button
                            key={2}
                            asChild
                            size="lg"
                            variant="secondary"
                            className=" rounded-sm px-5 dark:text-white text-black "
                        >
                            <Link href="/owner/list">
                                <span className="text-nowrap">List Your Vehicle</span>
                            </Link>
                        </Button>
                    </AnimatedGroup>
                </div>
            </div>

            <AnimatedGroup
                variants={{
                    container: {
                        visible: {
                            transition: {
                                staggerChildren: 0.05,
                                delayChildren: 0.75,
                            },
                        },
                    },
                    ...transitionVariants,
                }}
            >

                <Image
                    src={RentalImage}
                    alt="Car illustration"
                    width={1200}
                    height={400}
                    className="mx-auto"
                />

            </AnimatedGroup>
        </div>
    </section >
}