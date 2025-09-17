"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface NewVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (vault: {
    name: string;
    members: string[];
    funding: { amount: number; currency: "FIL" | "USDC" };
  }) => void;
}

export default function NewVaultModal({ isOpen, onClose, onDeploy }: NewVaultModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [funding, setFunding] = useState({ amount: 0, currency: "FIL" as "FIL" | "USDC" });

  if (!isOpen) return null;

  const addMember = () => {
    if (newMember && !members.includes(newMember)) {
      setMembers([...members, newMember]);
      setNewMember("");
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onDeploy({ name, members, funding });
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
                className={`px-2 py-1 rounded-full ${
                  step === idx + 1 ? "bg-[#2a9d8f] text-white" : "bg-gray-200 text-gray-600"
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
              className="w-full rounded-lg border border-gray-300 bg-white/50 px-3 py-2"
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
                  className="flex-1 rounded-lg border border-gray-300 bg-white/50 px-3 py-2"
                />
                <button onClick={addMember} className="px-3 py-2 rounded-lg bg-[#2a9d8f] text-white">
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {members.map((m) => (
                  <div key={m} className="px-3 py-1 rounded-full bg-[#1d3557] text-white text-sm">
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
                onChange={(e) => setFunding({ ...funding, amount: Number(e.target.value) })}
                className="flex-1 rounded-lg border border-gray-300 bg-white/50 px-3 py-2"
              />
              <select
                value={funding.currency}
                onChange={(e) => setFunding({ ...funding, currency: e.target.value as "FIL" | "USDC" })}
                className="rounded-lg border border-gray-300 bg-white/50 px-3 py-2"
              >
                <option value="FIL">FIL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-lg bg-white/60 p-4 shadow-inner">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p><b>Name:</b> {name}</p>
              <p><b>Members:</b> {members.join(", ") || "None"}</p>
              <p><b>Funding:</b> {funding.amount} {funding.currency}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="text-gray-600 hover:text-[#e76f51]">Cancel</button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-lg bg-[#2a9d8f] text-white px-4 py-2 shadow hover:bg-[#21867a]"
            >
              {step === 4 ? "Deploy" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
