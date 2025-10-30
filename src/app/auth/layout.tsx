import Logo from "@/features/core/components/Logo";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Link
                href={"/"}
                className="absolute top-4 left-4 text-xl font-bold cursor-pointer"
            >
                <Image src={'/logo.jpg'} width={500} height={500} alt="logo" className="rounded-full h-12 w-12 " />
            </Link>
            <main>{children}</main>
        </div>
    );
}
