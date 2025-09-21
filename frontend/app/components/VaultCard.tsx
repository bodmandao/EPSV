"use client";

import { useState } from "react";
import { Settings, Plus, Wallet } from "lucide-react";
import AddMemberModal from "./AddMemberModal";

interface VaultCardProps {
  id: string;
  name: string;
  balance: string;
  members: string[];
  files: { id: string; name: string; previewUrl: string }[];
}

export default function VaultCard({ id, name, balance, members, files }: VaultCardProps) {
  const [showAddMember, setShowAddMember] = useState(false);

  const shorten = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
        <p className="text-xs text-gray-400 mb-1">Files:</p>
        <div className="flex flex-wrap gap-2">
          {files.length > 0 ? (
            files.slice(0, 3).map((file) => (
              <img
                key={file.id}
                src={file.previewUrl}
                alt={file.name}
                className="w-10 h-10 rounded-md border object-cover"
                title={file.name}
              />
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No files yet</p>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          vaultId={id}
        />
      )}
    </div>
  );
}
