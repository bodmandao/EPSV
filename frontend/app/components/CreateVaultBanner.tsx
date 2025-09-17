"use client";

import { PlusCircle } from "lucide-react";

export default function CreateVaultBanner() {
  return (
    <div className="bg-blue-50 border rounded-lg p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-800">Create a New Vault</h3>
        <p className="text-sm text-gray-600">
          Start a new smart contract vault to securely store and share files with your team.
        </p>
      </div>
      <button className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
        <PlusCircle size={18} /> Start New Vault
      </button>
    </div>
  );
}
