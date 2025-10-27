"use client";

import { useState } from "react";
import { Settings, Plus, Wallet, Eye } from "lucide-react";
import AddMemberModal from "./AddMemberModal";
import AddFundsModal from "./AddFundsModal";
import VaultInsightsModal from "./VaultInsightsModal";

interface VaultCardProps {
  id: string;
  name: string;
  balance: string;
  members: string[];
  files: { id: string; name: string; previewUrl: string }[];
}

export default function VaultCard({ id, name, balance, members, files }: VaultCardProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const shorten = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleInsightsClick = (fileName: string) => {
    setSelectedFile(fileName);
    setShowInsights(true);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      {/* Vault Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{name}</h4>
        <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">{balance}</p>
        <button
          onClick={() => setShowAddFunds(true)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <Wallet size={14} />
          Add Funds
        </button>
      </div>

      {/* Members */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-400">Members:</p>
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.length > 0 ? (
            members.map((member, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md font-mono"
              >
                {shorten(member)}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No members</p>
          )}
        </div>
      </div>

      {/* Files in Vault */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Files:</p>
        <div className="flex flex-wrap gap-3">
          {files.length > 0 ? (
            files.slice(0, 3).map((file) => (
              <div
                key={file.id}
                className="flex flex-col items-center w-16 group relative"
              >
                {/* File Preview */}
                <div className="relative">
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="w-12 h-12 rounded-md border object-cover mb-1"
                  />
                  {/* AI Insights Button - Appears on hover */}
                  <button
                    onClick={() => handleInsightsClick(file.name)}
                    className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                    title="AI Insights"
                  >
                    <Eye size={10} />
                  </button>
                </div>
                
                {/* File Name */}
                <span className="text-[10px] text-gray-600 truncate w-full text-center mb-1">
                  {file.name}
                </span>

                {/* Fallback Button for mobile/touch devices */}
                <button
                  onClick={() => handleInsightsClick(file.name)}
                  className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md transition-colors group-hover:hidden"
                >
                  Insights
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No files yet</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          vaultId={id}
        />
      )}

      {showAddFunds && (
        <AddFundsModal
          isOpen={showAddFunds}
          onClose={() => setShowAddFunds(false)}
          vaultId={id}
        />
      )}

      {showInsights && (
        <VaultInsightsModal
          vaultName={name}
          fileName={selectedFile || ""}
          onClose={() => {
            setShowInsights(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}