import DashboardLayout from "@/app/components/DashboardLayout";
import StorageUsage from "@/app/components/StorageUsage";
import BreadcrumbBar from "@/app/components/BreadcrumbBar";
import TrashComponent from "@/app/components/Trash";

export default function TrashPage() {
    return (
        <DashboardLayout>
            <BreadcrumbBar />
            <StorageUsage />
            <TrashComponent />
        </DashboardLayout>
    );
}
