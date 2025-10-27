"use client";

import { useState, useEffect } from "react";
import { Trash2, RotateCcw, Search } from "lucide-react";
import { supabase } from "@/utils/supabase"; 
import { toast } from "sonner";

interface DeletedVault {
  id: string;
  name: string;
  balance: string; // 
  deleted_at: string;
  files_count: number;
  members: string[];
  owner_address: string;
}

export default function TrashPage() {
  const [deletedVaults, setDeletedVaults] = useState<DeletedVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDeletedVaults();
  }, []);

  const loadDeletedVaults = async () => {
    try {
      // Get deleted vaults from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: vaults, error } = await supabase
        .from("vaults")
        .select(`
          *,
          files:files(count)
        `)
        .eq("status", "deleted")
        .gte("deleted_at", thirtyDaysAgo.toISOString())
        .order("deleted_at", { ascending: false });

      if (error) throw error;

      // Format the data
      const formattedVaults: DeletedVault[] = vaults.map(vault => ({
        id: vault.id,
        name: vault.name,
        balance: vault.funding || "0", // Adjust based on your balance field
        deleted_at: vault.deleted_at,
        files_count: vault.files[0]?.count || 0,
        members: vault.members || [],
        owner_address: vault.owner_address
      }));

      setDeletedVaults(formattedVaults);
    } catch (error) {
      console.error('Failed to load deleted vaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (vaultId: string) => {
    try { 
      // Restore vault by updating status and clearing deleted_at
      const { error: vaultError } = await supabase
        .from("vaults")
        .update({
          status: 'active',
          deleted_at: null,
        })
        .eq("id", vaultId);

      if (vaultError) throw vaultError;

      // Restore associated files
      const { error: filesError } = await supabase
        .from("files")
        .update({
          status: 'active',
          deleted_at: null,
        })
        .eq("vault_id", vaultId);

      if (filesError) {
        console.error('Error restoring files:', filesError);
      }

      // Remove from local state
      setDeletedVaults(prev => prev.filter(vault => vault.id !== vaultId));
      toast.success('Vault restored successfully');
    } catch (error) {
      console.error('Failed to restore vault:', error);
      toast.error('Failed to restore vault');
    }
  };

  const handlePermanentDelete = async (vaultId: string) => {
    if (!confirm("Are you sure you want to permanently delete this vault? This action cannot be undone.")) {
      return;
    }

    try {
      const { error: filesError } = await supabase
        .from("files")
        .delete()
        .eq("vault_id", vaultId);

      if (filesError) throw filesError;

      const { error: vaultError } = await supabase
        .from("vaults")
        .delete()
        .eq("id", vaultId);

      if (vaultError) throw vaultError;

      // Remove from local state
      setDeletedVaults(prev => prev.filter(vault => vault.id !== vaultId));
      toast.success('Vault permanently deleted');
    } catch (error) {
      console.error('Failed to permanently delete vault:', error);
      toast.error('Failed to delete vault');
    }
  };

  const filteredVaults = deletedVaults.filter(vault =>
    vault.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysUntilPermanentDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const permanentDeletionDate = new Date(deletedDate);
    permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 30);
    const daysLeft = Math.ceil((permanentDeletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trash</h1>
        <p className="text-gray-600">
          Vaults and files that have been deleted. They will be permanently deleted after 30 days.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search deleted vaults..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Deleted Vaults Grid */}
      {filteredVaults.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted vaults</h3>
          <p className="text-gray-600">Vaults you delete will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaults.map((vault) => {
            const daysLeft = getDaysUntilPermanentDeletion(vault.deleted_at);
            
            return (
              <div key={vault.id} className="border rounded-lg p-4 bg-gray-50 relative">
                {/* Days Left Indicator */}
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {daysLeft}d left
                </div>

                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{vault.name}</h4>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Deleted
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>Balance: {vault.balance}</p>
                  <p>Files: {vault.files_count}</p>
                  <p>Members: {vault.members.length}</p>
                  <p className="text-xs">
                    Deleted: {new Date(vault.deleted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(vault.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(vault.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    title="Permanently delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}