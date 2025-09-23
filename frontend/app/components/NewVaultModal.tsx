"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { supabase } from "@/utils/supabase";
import { generateVaultKey } from "@/utils/crypto";
import { isAddress, parseEther, zeroAddress } from "viem";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/utils/contract";
import { toast } from "sonner"; 

interface NewVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewVaultModal({ isOpen, onClose }: NewVaultModalProps) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [funding, setFunding] = useState({
    amount: 0,
    currency: "FIL" as "FIL" | "USDC",
  });
  const [isDeploying, setIsDeploying] = useState(false);

  if (!isOpen) return null;

  const addMember = () => {
    if (!newMember.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (!isAddress(newMember)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    if (members.includes(newMember.toLowerCase())) {
      toast.error("This member is already added");
      return;
    }

    setMembers([...members, newMember.toLowerCase()]);
    setNewMember("");
    toast.success("Member added successfully");
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!name.trim()) {
          toast.error("Please enter a vault name");
          return false;
        }
        return true;
      case 3:
        if (funding.amount <= 0) {
          toast.error("Please enter a valid funding amount");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      if (validateStep()) {
        setStep(step + 1);
      }
      return;
    }

    // Step 4: Create vault
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!validateStep()) return;

    setIsDeploying(true);

    try {
      const loadingToast = toast.loading("Creating vault and processing transaction...");

      // Generate vault key
      const aesKey = await generateVaultKey();
      
      const priceInWei = parseEther(funding.amount.toString());

      // Execute contract call
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "deposit",
        args: [zeroAddress, address, priceInWei],
        value: priceInWei,
      });

      setTxHash(tx);
      toast.success("Transaction submitted! Waiting for confirmation...", { id: loadingToast });

      // Create vault in database
      const { error } = await supabase.from("vaults").insert([
        {
          name: name.trim(),
          owner_address: address,
          members: members.map(m => m.toLowerCase()),
          funding,
          encrypted_key: aesKey,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success("✅ Vault funded & created successfully! 🎉");

      // Reset form and close modal
      setTimeout(() => {
        setName("");
        setMembers([]);
        setFunding({ amount: 0, currency: "FIL" });
        setStep(1);
        onClose();
      }, 2000);

    } catch (err) {
      console.error("Vault creation error:", err);
      
      if (err instanceof Error) {
        if (err.message.includes("User rejected")) {
          toast.error("Transaction was cancelled");
        } else if (err.message.includes("insufficient funds")) {
          toast.error("Insufficient balance for this transaction");
        } else if (err.message.includes("network")) {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error("Failed to create vault. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsDeploying(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setName("");
    setMembers([]);
    setNewMember("");
    setFunding({ amount: 0, currency: "FIL" });
    setStep(1);
    onClose();
  };

  const removeMember = (memberToRemove: string) => {
    setMembers(members.filter(m => m !== memberToRemove));
    toast.info("Member removed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white/80 shadow-xl p-6">
        {/* Title bar */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-bold text-[#1d3557]">New Vault</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-[#e76f51]"
            disabled={isDeploying}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6 text-sm">
          {["Name Vault", "Add Members", "Fund Vault", "Review"].map((label, idx) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`px-2 py-1 rounded-full text-xs ${step === idx + 1
                  ? "bg-[#2a9d8f] text-white"
                  : idx + 1 < step
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                {idx + 1}. {label}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {step === 1 && (
            <div>
              <input
                type="text"
                placeholder="Vault Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 text-[#1d3557] bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length}/50 characters
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... wallet address"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  className="flex-1 rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                  disabled={isDeploying}
                />
                <button
                  onClick={addMember}
                  disabled={isDeploying}
                  className="px-3 py-2 rounded-lg bg-[#2a9d8f] text-white hover:bg-[#21867a] disabled:opacity-50"
                >
                  +
                </button>
              </div>
              
              {members.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Members ({members.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div
                        key={m}
                        className="px-3 py-1 rounded-full bg-[#1d3557] text-white text-sm flex items-center gap-2"
                      >
                        {m.slice(0, 6)}...{m.slice(-4)}
                        <button 
                          onClick={() => removeMember(m)}
                          className="text-xs hover:text-red-200"
                          disabled={isDeploying}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Amount"
                min="0"
                step="0.0001"
                value={funding.amount}
                onChange={(e) =>
                  setFunding({ ...funding, amount: Number(e.target.value) })
                }
                className="flex-1 rounded-lg text-[#1d3557] border border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                disabled={isDeploying}
              />
              <select
                value={funding.currency}
                onChange={(e) =>
                  setFunding({
                    ...funding,
                    currency: e.target.value as "FIL" | "USDC",
                  })
                }
                className="rounded-lg text-[#1d3557] border border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                disabled={isDeploying}
              >
                <option value="FIL">FIL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-xl bg-gradient-to-br from-white/80 to-white/50 p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Summary</h3>

              <div className="space-y-3 text-sm">
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900">{name || "—"}</span>
                </p>

                <p className="flex items-start">
                  <span className="font-semibold text-gray-700 w-24">Members:</span>
                  <span className="text-gray-900">
                    {members.length > 0 
                      ? members.map(m => `${m.slice(0, 6)}...${m.slice(-4)}`).join(", ") 
                      : "None"
                    } ({members.length} total)
                  </span>
                </p>

                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-24">Funding:</span>
                  <span className="text-gray-900">
                    {funding.amount} {funding.currency}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button 
            onClick={handleClose} 
            className="text-gray-600 hover:text-[#e76f51] disabled:opacity-50"
            disabled={isDeploying}
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={isDeploying}
                className="rounded-lg text-[#1d3557] border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isDeploying || (step === 1 && !name.trim()) || (step === 3 && funding.amount <= 0)}
              className="rounded-lg bg-[#2a9d8f] text-white px-4 py-2 shadow hover:bg-[#21867a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying
                ? "Creating..."
                : step === 4
                  ? "Create Vault"
                  : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}