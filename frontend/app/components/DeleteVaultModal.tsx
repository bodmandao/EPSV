"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";
import { parseEther, zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/utils/contract";

interface DeleteVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
  vaultName: string;
  vaultOwner: string;
  vaultBalance: string;
  onDeleteSuccess: () => void;
}

export default function DeleteVaultModal({ 
  isOpen, 
  onClose, 
  vaultId, 
  vaultName, 
  vaultOwner,
  vaultBalance,
  onDeleteSuccess 
}: DeleteVaultModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { address } = useAccount();

  const isOwner = address?.toLowerCase() === vaultOwner.toLowerCase();
    const { writeContractAsync, isPending } = useWriteContract();

  const handleDelete = async () => {
  if (!isOwner) {
    toast.error("Only the vault owner can delete this vault");
    return;
  }

  setIsDeleting(true);
  
  try {
    // Withdraw funds from the vault
    if (vaultBalance && parseFloat(vaultBalance) > 0) {
      await withdrawVaultFunds(vaultId, address!);
    }

    // Soft delete the vault and reset funding to zero
    const { error: vaultError } = await supabase
      .from("vaults")
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        funding: {
          amount: 0,
          currency: "OG" 
        }
      })
      .eq("id", vaultId);

    if (vaultError) throw vaultError;

    // Mark associated files as deleted
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

    toast.success('Vault deleted and funds withdrawn');
    onDeleteSuccess();
    onClose();
  } catch (error) {
    console.error('Error deleting vault:', error);
    toast.error('Failed to delete vault');
  } finally {
    setIsDeleting(false);
  }
};
  const withdrawVaultFunds = async (vaultId: string, ownerAddress: string) => {
    try {
      // Get vault details including the token and balance
      const { data: vault, error } = await supabase
        .from("vaults")
        .select("funding, encrypted_key")
        .eq("id", vaultId)
        .single();

      if (error) throw error;

      if (!vault.funding || parseFloat(vault.funding.amount) === 0) {
        return; // No funds to withdraw
      }

        const valueInWei = parseEther(vault.funding.amount.toString());
      
      const withdrawalSuccess = await writeContractAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: "withdraw",
                args: [zeroAddress, address, valueInWei],
                value: valueInWei,
            });
            

      if (!withdrawalSuccess) {
        throw new Error("Failed to withdraw funds from contract");
      }

      toast.success(`Withdrawn ${vault.funding} to your wallet`);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw new Error('Failed to withdraw vault funds');
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
            <h2 className="text-lg font-semibold text-gray-900">
              {isOwner ? "Delete Vault" : "Access Denied"}
            </h2>
            <p className="text-sm text-gray-600">
              {isOwner 
                ? "This action will withdraw funds and delete the vault" 
                : "Only the vault owner can delete this vault"
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isOwner ? (
            <div className="text-center py-4">
              <div className="bg-red-100 p-3 rounded-lg mb-4">
                <AlertTriangle className="text-red-600 mx-auto mb-2" size={32} />
                <p className="text-red-700 font-medium">You are not the vault owner</p>
              </div>
              <p className="text-gray-600 text-sm">
                Only the vault creator can delete this vault and withdraw funds.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-semibold">"{vaultName}"</span>?
              </p>
              
              {/* Funds Withdrawal Info */}
              {vaultBalance && parseFloat(vaultBalance) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Wallet size={16} />
                    <span className="font-medium">Funds Withdrawal</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {vaultBalance} will be automatically withdrawn to your wallet address:
                  </p>
                  <p className="text-xs font-mono text-blue-600 mt-1 bg-blue-100 p-1 rounded">
                    {address}
                  </p>
                </div>
              )}

              <ul className="text-sm text-gray-600 space-y-1 mb-6">
                <li>• Funds will be withdrawn to your wallet</li>
                <li>• Vault and files will be moved to trash</li>
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete & Withdraw
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}