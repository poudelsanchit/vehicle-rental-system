import { AdminSidebarLayout } from "@/features/sidebar/components/AdminSidebarLayout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminSidebarLayout>{children}</AdminSidebarLayout>;
}