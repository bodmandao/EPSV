"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";
import { isAddress } from "viem";
import { toast } from "sonner"; 

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
}

export default function AddMemberModal({ isOpen, onClose, vaultId }: AddMemberModalProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddMember = async () => {
    if (!address) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (!isAddress(address)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading("Adding member...");

      // Fetch current members
      const { data: vault, error: fetchError } = await supabase
        .from("vaults")
        .select("members")
        .eq("id", vaultId)
        .single();

      if (fetchError) throw fetchError;

      const currentMembers = vault.members || [];
      
      // Check if member already exists
      if (currentMembers.includes(address.toLowerCase())) {
        toast.error("This member already exists in the vault", { id: loadingToast });
        setLoading(false);
        return;
      }

      // Update members array (normalize to lowercase for consistency)
      const { error: updateError } = await supabase
        .from("vaults")
        .update({ members: [...currentMembers, address.toLowerCase()] })
        .eq("id", vaultId);

      if (updateError) throw updateError;

      // Success toast
      toast.success("Member added successfully! 🎉", { id: loadingToast });
      
      // Reset form and close modal
      setAddress("");
      onClose();
      
    } catch (err) {
      console.error("Error adding member:", err);
      
      // Error handling with specific messages
      if (err instanceof Error) {
        if (err.message.includes("network") || err.message.includes("fetch")) {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error("Failed to add member. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAddress(""); // Reset input when closing
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold mb-4">Add Member</h3>

        <input
          type="text"
          placeholder="0x... wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-[#1d3557] text-sm mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          disabled={loading}
        />

        <button
          onClick={handleAddMember}
          disabled={loading || !address.trim()}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Enter a valid Ethereum wallet address
        </p>
      </div>
    </div>
  );
}