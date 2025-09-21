"use client";

import { ReactNode } from "react";
import { useModal } from "../context/ModalContext";
import { Search, Upload, PlusCircle, Home, Folder, Share2, Clock, Trash2, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";


export default function DashboardLayout({ children }: { children: ReactNode }) {
   const { openModal } = useModal();
     const { address } = useAccount();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between">
        <div>
          <div className="p-6 text-blue-600 font-bold text-xl">Logo</div>

          <nav className="px-4 space-y-1">
            <Link href={'/dashboard'} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Home size={18} /> All Files
            </Link>
            <Link href={'/vaults'} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Folder size={18} /> My Vaults
            </Link>
            <Link href={'#'} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Share2 size={18} /> Shared with Me
            </Link>
            <Link href={'#'} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Clock size={18} /> Recent
            </Link>
            <Link href={'#'} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Trash2 size={18} /> Trash
            </Link>

            <div className="mt-4 text-xs text-gray-400 px-2">SYSTEM</div>
            <Link href={'#'} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Storage Health
            </Link>
          </nav>
        </div>

        {/* Bottom buttons */}
        <div className="space-y-2 p-4">
          <button className="w-full bg-blue-600 text-white p-2 rounded-lg">Account Balance</button>
          <button className="w-full bg-blue-600 text-white p-2 rounded-lg">Settings</button>
          <button className="w-full bg-red-500 text-white p-2 rounded-lg flex items-center justify-center gap-2">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center border rounded-lg px-3 py-2 w-1/3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search files or vaults..."
              className="ml-2 w-full focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
             <ConnectButton  accountStatus="address" />
            
            <button 
             onClick={() => openModal("newVault")}
             className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
              <PlusCircle size={16} /> New Vault
            </button>

            <button  onClick={() => openModal("uploadFile")}
             className="flex items-center gap-1 bg-gray-600 px-3 py-2 rounded-lg text-sm">
              <Upload size={16} /> Upload
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
