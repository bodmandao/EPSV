import DashboardLayout from "@/app/components/DashboardLayout";
import CreateVaultBanner from "@/app/components/CreateVaultBanner";
import VaultGrid from "@/app/components/VaultGrid";
import SharedVaultGrid from "../components/SharedVaultGrid";

export default function VaultsPage() {
  return (
    <DashboardLayout>
      {/* Top Right Button */}
      <div className="flex justify-end mb-4">
        <button className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
          Create Vault
        </button>
      </div>

      <CreateVaultBanner />
      <SharedVaultGrid />
    </DashboardLayout>
  );
}
