import DashboardLayout from "@/app/components/DashboardLayout";
import StorageUsage from "@/app/components/StorageUsage";
import FileGrid from "@/app/components/FileGrid";
import BreadcrumbBar from "../components/BreadcrumbBar";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <BreadcrumbBar />
            <StorageUsage />
            <FileGrid />
        </DashboardLayout>
    );
}
