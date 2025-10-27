"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabase";
import { FileCardProps } from "../interfaces/FileCardProps";
import FileCard from "./FileCard";

export default function FileGrid() {
  const { address } = useAccount();
  const [files, setFiles] = useState<FileCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const fetchFiles = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("files").select("*");
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const formatted: FileCardProps[] = [];
      
      for (const f of data) {
        // Check if user owns the file
        if (f.owner_address === address) {
          formatted.push({
            id: f.id,
            name: f.file_name,
            date: new Date(f.created_at).toLocaleDateString(),
            status: "owned",
            previewUrl: f.previewUrl,
          });
          continue;
        }
        
        // Check if user is in the members array for shared files
        if (f.members && Array.isArray(f.members) && f.members.includes(address)) {
          formatted.push({
            id: f.id,
            name: f.file_name,
            date: new Date(f.created_at).toLocaleDateString(),
            status: "shared",
            previewUrl: f.previewUrl,
          });
        }
      }

      setFiles(formatted);
      setLoading(false);
    };

    fetchFiles();
  }, [address]);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-lg font-semibold mb-4">My Files</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 animate-pulse">
              <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold mb-4">My Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, idx) => (
          <FileCard key={idx} {...file} />
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No files yet</h3>
          <p className="text-gray-500 mt-2">Upload your first file to get started.</p>
        </div>
      )}
    </div>
  );
}