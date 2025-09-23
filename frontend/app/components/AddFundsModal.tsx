"use client";

import { useState } from "react";
import { parseEther, zeroAddress } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/utils/contract";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    vaultId: string;
}

export default function AddFundsModal({ isOpen, onClose, vaultId }: AddFundsModalProps) {
    const [amount, setAmount] = useState("");
    const { address } = useAccount();
    const router = useRouter()
    const { writeContractAsync, isPending } = useWriteContract();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            if (!amount || !address) {
                toast.error("Please enter an amount and ensure you're connected");
                return;
            }

            if (parseFloat(amount) <= 0) {
                toast.error("Please enter a valid amount");
                return;
            }

            // Show loading toast
            const loadingToast = toast.loading("Processing transaction...");

            const valueInWei = parseEther(amount);

            await writeContractAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: "deposit",
                args: [zeroAddress, address, valueInWei],
                value: valueInWei,
            });

            // Update to success for transaction
            toast.success("Transaction confirmed! Updating database...", { id: loadingToast });

            const { error } = await supabase.rpc("increment_funding", {
                vault_id: vaultId,
                add_amount: amount,
            });

            if (error) {
                console.error("DB update failed:", error);
                toast.error("Database update failed. Please contact support.");
            } else {
                toast.success("Funds added successfully! 🎉");
                console.log("Funding updated in DB ✅");
            }

            setAmount("");
            onClose();
        } catch (err) {
            console.error("Deposit failed:", err);
            
            // Check for specific error types
            if (err instanceof Error) {
                if (err.message.includes("User rejected")) {
                    toast.error("Transaction was cancelled");
                } else if (err.message.includes("insufficient funds")) {
                    toast.error("Insufficient balance for this transaction");
                } else {
                    toast.error("Transaction failed. Please try again.");
                }
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-400 mb-4">Add Funds</h2>
                <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-gray-400 border rounded-md p-2 mb-4 text-sm focus:ring focus:ring-indigo-200"
                    min="0"
                    step="0.0001"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-white text-sm rounded-md bg-gray-500 hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !amount || parseFloat(amount) <= 0}
                        className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isPending ? "Processing..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}