"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/utils/supabase";
import VaultCard from "./VaultCard";

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}


interface Vault {
  id: string;
  name: string;
  balance: string;
  members: string[];
  files: { id: string; name: string; previewUrl: string }[];
}

export default function VaultGrid() {
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
        .or(`owner_address.eq.${address},members.cs.{${address}}`);

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
            .select("id, file_name,previewUrl")
            .eq("vault_id", vault.id.toString());

          // Get preview URLs for files
          const filesWithPreviews = await Promise.all(
            (fileData || []).slice(0, 4).map(async (f) => {
              return {
                id: f.id,
                name: f.file_name,
                previewUrl:f.previewUrl,
              };
            })
          );

          return {
            id: vault.id,
            name: vault.name,
            balance: `${vault.funding.amount} ${vault.funding.currency}` || "0 FIL",
            members: vault.members || [],
            files: filesWithPreviews,
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
      <h2 className="text-lg text-gray-700 font-semibold mb-4">My Vaults</h2>
      
      {vaults.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m4 0H3m6 0h4m4 0h2m-6 0v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4m6 0h-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No vaults yet</h3>
          <p className="text-gray-500 mt-2">Create your first vault to get started.</p>
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