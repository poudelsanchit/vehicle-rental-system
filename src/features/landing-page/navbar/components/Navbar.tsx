// components/navbar/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/features/core/components/button";
import { cn } from "@/features/core/lib/utils";
import { Menu, X } from "lucide-react";

const menuItems = [
    { name: "Home", href: "/" },
    { name: "Vehicles", href: "/vehicles" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Contact", href: "/contact" },
];

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);


    return (
        <header>
            <nav className="fixed top-0 z-20 w-full px-2 font-semibold">
                <div
                    className=
                    "mx-auto  px-6 transition-all duration-300 lg:px-12"

                >
                    <div className="relative bg-background flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        {/* Logo */}
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 text-xl text-black dark:text-white"
                            >
                                GO GADI
                            </Link>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                            >
                                <Menu
                                    className={cn(
                                        "m-auto size-6 duration-200",
                                        menuOpen && "rotate-180 scale-0 opacity-0"
                                    )}
                                />
                                <X
                                    className={cn(
                                        "absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200",
                                        menuOpen && "rotate-0 scale-100 opacity-100"
                                    )}
                                />
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mobile & Desktop Actions */}
                        <div
                            className={cn(
                                "mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
                                menuOpen ? "block" : "hidden",
                                "lg:flex"
                            )}
                        >
                            {/* Mobile Menu */}
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="block text-muted-foreground duration-150 hover:text-accent-foreground"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">



                                <Button
                                    asChild
                                    size="sm"
                                    variant="secondary"
                                >
                                    <Link href="/auth/register">
                                        <span className="font-semibold">List Your Vehicle</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    <Link href="/auth/login">
                                        <span className="font-semibold">Login</span>
                                    </Link>
                                </Button>


                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header >
    );
};