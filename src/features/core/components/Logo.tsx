import Image from "next/image";

export default function Logo() {
    return <Image src={'/logo.jpg'} width={500} height={500} alt="logo" className="rounded-full " />

}