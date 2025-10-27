"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

interface DeleteVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultName: string;
  onDeleteSuccess: () => void;
}

export default function DeleteVaultModal({ 
  isOpen, 
  onClose, 
  vaultId, 
  vaultName, 
  onDeleteSuccess 
}: DeleteVaultModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Soft delete 
      const { error: vaultError } = await supabase
        .from("vaults")
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
        })
        .eq("id", vaultId);

      if (vaultError) throw vaultError;

      //  update all files in this vault to mark them as deleted
      const { error: filesError } = await supabase
        .from("files") 
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
        })
        .eq("vault_id", vaultId);

      if (filesError) {
        console.error('Error updating files:', filesError);
       
      }

      toast.success('Vault moved to trash');
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting vault:', error);
      toast.error('Failed to delete vault');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Move to Trash</h2>
            <p className="text-sm text-gray-600">This action can be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to move <span className="font-semibold">"{vaultName}"</span> to trash?
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-6">
            <li>• Vault and its files will be moved to trash</li>
            <li>• You can restore it within 30 days</li>
            <li>• After 30 days, it will be permanently deleted</li>
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Moving...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Move to Trash
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}