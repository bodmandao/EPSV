"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabase";
import { FileCardProps } from "../interfaces/FileCardProps";
import FileCard from "./FileCard";
import { createApi } from 'unsplash-js';

// Initialize Unsplash
const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
});

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Get fallback image based on file type
const getFallbackImage = (keyword: string): string => {
  const fallbackImages: Record<string, string> = {
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EImage%3C/text%3E%3C/svg%3E",
    video: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23DC2626'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EVideo%3C/text%3E%3C/svg%3E",
    pdf: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23EF4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EPDF%3C/text%3E%3C/svg%3E",
    archive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F59E0B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EArchive%3C/text%3E%3C/svg%3E",
    spreadsheet: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3ESpreadsheet%3C/text%3E%3C/svg%3E",
    document: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%233B82F6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EDocument%3C/text%3E%3C/svg%3E",
    text: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%236B7280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EText%3C/text%3E%3C/svg%3E",
    default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%239CA3AF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EFile%3C/text%3E%3C/svg%3E"
  };
  
  return fallbackImages[keyword] || fallbackImages.default;
};

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

      // Process files and get Unsplash images
      const formatted = await Promise.all(
        data.map(async (f: any) => {
          const ext = f.file_name.split(".").pop()?.toLowerCase();
          let keyword = "document";
          
          // Map file extensions to keywords
          if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext!)) keyword = "image";
          if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext!)) keyword = "video";
          if (["pdf"].includes(ext!)) keyword = "pdf";
          if (["zip", "rar", "7z", "tar"].includes(ext!)) keyword = "archive";
          if (["xlsx", "xls", "csv"].includes(ext!)) keyword = "spreadsheet";
          if (["doc", "docx", "odt"].includes(ext!)) keyword = "document";
          if (["txt", "md", "rtf"].includes(ext!)) keyword = "text";
          if (["mp3", "wav", "flac", "ogg"].includes(ext!)) keyword = "music";

          let previewUrl = f.preview_url;
          
         
          if (!previewUrl || !isValidUrl(previewUrl)) {
            try {
              const result = await unsplash.photos.getRandom({
                query: keyword,
                count: 1,
              });
              
              if (result.type === 'success') {
                const photo = result.response as unknown as Array<{ urls: { regular: string } }>;
                if (photo && photo[0]?.urls?.regular) {
                  previewUrl = photo[0].urls.regular;
                } else {
                  previewUrl = getFallbackImage(keyword);
                }
              } else {
                previewUrl = getFallbackImage(keyword);
              }
            } catch (error) {
              console.error('Failed to fetch Unsplash image:', error);
              previewUrl = getFallbackImage(keyword);
            }
          }

          const status: "owned" | "shared" | undefined = 
            f.owner_address === address ? "owned" : "shared";
          console.log(previewUrl)
          return {
            id :f.id,
            name: f.file_name,
            date: new Date(f.created_at).toLocaleDateString(),
            status, 
            previewUrl,
          };
        })
      );

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