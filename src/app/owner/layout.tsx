import { OwnerSidebarLayout } from "@/features/owner/sidebar/components/OwnerSidebarLayout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <OwnerSidebarLayout>{children}</OwnerSidebarLayout>;
}