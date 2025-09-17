"use client";

import { Settings } from "lucide-react";

interface VaultCardProps {
  name: string;
  balance: string;
  members: string[];
}

export default function VaultCard({ name, balance, members }: VaultCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{name}</h4>
        <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <p className="text-sm text-gray-600 mb-3">{balance}</p>
      <div>
        <p className="text-xs text-gray-400 mb-1">Members:</p>
        <div className="flex -space-x-2">
          {members.map((member, idx) => (
            <img
              key={idx}
              src={member}
              alt="member"
              className="w-8 h-8 rounded-full border border-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
