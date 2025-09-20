"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabase";
import { generateVaultKey } from "@/utils/crypto";
import { isAddress } from "viem";

interface NewVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewVaultModal({ isOpen, onClose }: NewVaultModalProps) {
  const { address } = useAccount();

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
    if (!newMember) return;

    if (!isAddress(newMember)) {
      alert("Please enter a valid wallet address");
      return;
    }

    if (members.includes(newMember)) {
      alert("This member is already added");
      return;
    }

    setMembers([...members, newMember]);
    setNewMember("");
  };
  const handleNext = async () => {
    if (step < 4) return setStep(step + 1);

    if (!address) return alert("Connect your wallet");

    setIsDeploying(true);

    try {
      // 1. Generate AES key
      const aesKey = await generateVaultKey();

      // 2. Save to Supabase
      const { error } = await supabase.from("vaults").insert([
        {
          name,
          owner_address: address,
          members,
          funding,
          encrypted_key: aesKey, // base64 AES key
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert('vault created')

      setTimeout(() => {
        onClose();
      }, 3000)
    } catch (err) {
      console.error(err);
      alert("Error creating vault");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white/80 shadow-xl p-6">
        {/* Title bar */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-bold text-[#1d3557]">New Vault</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#e76f51]">
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6 text-sm">
          {["Name Vault", "Add Members", "Fund Vault", "Review"].map((label, idx) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`px-2 py-1 rounded-full ${step === idx + 1
                  ? "bg-[#2a9d8f] text-white"
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
            <input
              type="text"
              placeholder="Vault Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 text-[#1d3557] bg-white/50 px-3 py-2"
            />
          )}

          {step === 2 && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Wallet Address"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  className="flex-1 rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2"
                />
                <button
                  onClick={addMember}
                  className="px-3 py-2 rounded-lg bg-[#2a9d8f] text-white"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {members.map((m) => (
                  <div
                    key={m}
                    className="px-3 py-1 rounded-full bg-[#1d3557] text-white text-sm"
                  >
                    {m.slice(0, 6)}...{m.slice(-4)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Amount"
                value={funding.amount}
                onChange={(e) =>
                  setFunding({ ...funding, amount: Number(e.target.value) })
                }
                className="flex-1 rounded-lg text-[#1d3557] border border-gray-300 bg-white/50 px-3 py-2"
              />
              <select
                value={funding.currency}
                onChange={(e) =>
                  setFunding({
                    ...funding,
                    currency: e.target.value as "FIL" | "USDC",
                  })
                }
                className="rounded-lg text-[#1d3557] border border-gray-300 bg-white/50 px-3 py-2"
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
                  <span className="text-gray-900">{name}</span>
                </p>

                <p className="flex items-start">
                  <span className="font-semibold text-gray-700 w-24">Members:</span>
                  <span className="text-gray-900">
                    {members.length > 0 ? members.join(", ") : "— None —"}
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
          <button onClick={onClose} className="text-gray-600 hover:text-[#e76f51]">
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg text-[#1d3557] border border-gray-300 px-4 py-2"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isDeploying}
              className="rounded-lg bg-[#2a9d8f] text-white px-4 py-2 shadow hover:bg-[#21867a]"
            >
              {isDeploying
                ? "Deploying..."
                : step === 4
                  ? "Deploy"
                  : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
