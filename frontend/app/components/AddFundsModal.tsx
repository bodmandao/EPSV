"use client";

import { useState } from "react";
import { parseEther, zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import {CONTRACT_ABI,CONTRACT_ADDRESS } from "@/utils/contract";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
}

export default function AddFundsModal({ isOpen, onClose, vaultId }: AddFundsModalProps) {
  const [amount, setAmount] = useState("");
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      if (!amount || !address) return;

      const valueInWei = parseEther(amount);

      await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "deposit",
        args: [zeroAddress, address, valueInWei],
        value: valueInWei,
      });

      setAmount("");
      onClose();
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add Funds</h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-md p-2 mb-4 text-sm focus:ring focus:ring-indigo-200"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
