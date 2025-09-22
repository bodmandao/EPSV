"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { X } from "lucide-react";
import { isAddress } from "viem";

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
    if (!address || !isAddress(address)) return alert("Enter a valid address");

    setLoading(true);

    try {
      // fetch current members
      const { data: vault, error: fetchError } = await supabase
        .from("vaults")
        .select("members")
        .eq("id", vaultId)
        .single();

      if (fetchError) throw fetchError;

      const currentMembers = vault.members || [];
      if (currentMembers.includes(address)) {
        alert("Member already exists in this vault");
        setLoading(false);
        return;
      }

      // update members array
      const { error: updateError } = await supabase
        .from("vaults")
        .update({ members: [...currentMembers, address] })
        .eq("id", vaultId);

      if (updateError) throw updateError;

      alert("Member added successfully");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error adding member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold mb-4">Add Member</h3>

        <input
          type="text"
          placeholder="0x... wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-[#1d3557] text-sm mb-4"
        />

        <button
          onClick={handleAddMember}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
      </div>
    </div>
  );
}
