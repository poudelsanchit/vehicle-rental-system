import { UserSidebarLayout } from "@/features/user/components/UserSidebarLayout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <UserSidebarLayout>{children}</UserSidebarLayout>;
}