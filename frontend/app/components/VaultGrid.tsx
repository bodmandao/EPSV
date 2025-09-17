"use client";

import VaultCard from "./VaultCard";

export default function VaultGrid() {
  const vaults = [
    {
      name: "Team Alpha Archive",
      balance: "150.7 FIL",
      members: ["/avatars/a1.png", "/avatars/a2.png", "/avatars/a3.png"],
    },
    {
      name: "Project X Fund",
      balance: "2000 USDC",
      members: ["/avatars/b1.png"],
    },
    {
      name: "Family Memories Vault",
      balance: "50.0 FIL",
      members: ["/avatars/c1.png", "/avatars/c2.png"],
    },
    {
      name: "Startup Seed Fund",
      balance: "3000 USDC",
      members: ["/avatars/d1.png", "/avatars/d2.png", "/avatars/d3.png", "/avatars/d4.png"],
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My Vaults</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {vaults.map((vault, idx) => (
          <VaultCard key={idx} {...vault} />
        ))}
      </div>
    </div>
  );
}
