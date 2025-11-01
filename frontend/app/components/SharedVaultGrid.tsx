"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabase";
import VaultCard from "./VaultCard";
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
const getFallbackImage = (keyword: string, size: string = "80x80"): string => {
  const [width, height] = size.split('x');
  const fallbackImages: Record<string, string> = {
    image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EImage%3C/text%3E%3C/svg%3E`,
    video: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23DC2626'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EVideo%3C/text%3E%3C/svg%3E`,
    pdf: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23EF4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EPDF%3C/text%3E%3C/svg%3E`,
    archive: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23F59E0B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EArchive%3C/text%3E%3C/svg%3E`,
    spreadsheet: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3ESpreadsheet%3C/text%3E%3C/svg%3E`,
    document: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%233B82F6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EDocument%3C/text%3E%3C/svg%3E`,
    text: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%236B7280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EText%3C/text%3E%3C/svg%3E`,
    default: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%239CA3AF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='white'%3EFile%3C/text%3E%3C/svg%3E`
  };
  
  return fallbackImages[keyword] || fallbackImages.default;
};

// Get file type keyword based on extension
const getFileKeyword = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (["pdf"].includes(ext)) return "pdf";
  if (["zip", "rar", "7z", "tar"].includes(ext)) return "archive";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet";
  if (["doc", "docx", "odt"].includes(ext)) return "document";
  if (["txt", "md", "rtf"].includes(ext)) return "text";
  if (["mp3", "wav", "flac", "ogg"].includes(ext)) return "music";
  
  return "document";
};

// Get Unsplash image for a file
const getFilePreviewUrl = async (fileName: string): Promise<string> => {
  const keyword = getFileKeyword(fileName);
  
  try {
    const result = await unsplash.photos.getRandom({
      query: keyword,
      count: 1,
    });
    
    if (result.type === 'success') {
      const photo = result.response as unknown as Array<{ urls: { small: string } }>;
      if (photo && photo[0]?.urls?.small) {
        return photo[0].urls.small;
      }
    }
  } catch (error) {
    console.error('Failed to fetch Unsplash image:', error);
  }
  
  return getFallbackImage(keyword, "80x80");
};

interface Vault {
  id: string;
  name: string;
  balance: string;
  members: string[];
  files: { id: string; name: string; previewUrl: string }[];
  owner : string
}

export default function SharedVaultGrid() {
  const { address } = useAccount();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleVaults, setVisibleVaults] = useState<Vault[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Fetch vaults and files
  useEffect(() => {
    if (!address) return;

    const fetchVaults = async () => {
      setLoading(true);
      // Get vaults owned or joined by user
      const { data: vaultData, error: vaultErr } = await supabase
        .from("vaults")
        .select("*")
        .filter("members", "cs", `{${address}}`);

      if (vaultErr) { 
        console.error(vaultErr);
        setLoading(false);
        return;
      }

      //  For each vault, fetch its files with proper preview images
      const vaultsWithFiles = await Promise.all(
        (vaultData || []).map(async (vault) => {
          const { data: fileData } = await supabase
            .from("files")
            .select("id, file_name")
            .eq("vault_id", vault.id.toString());

          // Get preview URLs for files
          const filesWithPreviews = await Promise.all(
            (fileData || []).slice(0, 4).map(async (f) => {
              let previewUrl = null
              
              // Use Unsplash if no valid preview URL
              if (!previewUrl || !isValidUrl(previewUrl)) {
                previewUrl = await getFilePreviewUrl(f.file_name);
                console.log('previewUrl',previewUrl)
              }
              
              return {
                id: f.id,
                name: f.file_name,
                previewUrl,
              };
            })
          );

          return {
            id: vault.id,
            name: vault.name,
            balance: `${vault.funding.amount} ${vault.funding.currency}` || "0 OG",
            members: vault.members || [],
            files: filesWithPreviews,
            owner : vault.owner_address
          };
        })
      );

      setVaults(vaultsWithFiles);
      setVisibleVaults(vaultsWithFiles.slice(0, 8)); 
      setLoading(false);
    };

    fetchVaults();
  }, [address]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (loading || !hasMore) return;

    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && vaults.length > visibleVaults.length) {
        // Load more vaults
        const nextPage = page + 1;
        const nextVaults = vaults.slice(0, nextPage * 8);
        setVisibleVaults(nextVaults);
        setPage(nextPage);
        
        if (nextVaults.length >= vaults.length) {
          setHasMore(false);
        }
      }
    }, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, page, vaults, visibleVaults]);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-lg text-gray-700 font-semibold mb-4">My Vaults</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 animate-pulse">
              <div className="bg-gray-300 h-40 rounded-md mb-4"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-300 w-12 h-12 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-lg text-gray-700 font-semibold mb-4">Shared Vaults</h2>
      
      {vaults.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m4 0H3m6 0h4m4 0h2m-6 0v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4m6 0h-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No shared vaults yet</h3>
          {/* <p className="text-gray-500 mt-2">Create your first vault to get started.</p> */}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleVaults.map((vault) => (
              <VaultCard key={vault.id} {...vault} />
            ))}
          </div>
          
          {/* Loading indicator for lazy loading */}
          {hasMore && (
            <div ref={loadingRef} className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}