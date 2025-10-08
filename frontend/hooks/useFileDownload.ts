"use client";

import { supabase } from "@/utils/supabase";
import { importKey, decryptFile } from "@/utils/crypto";

export const useFileDownload = () => {
  const downloadFile = async (fileId: string) => {
    try {
      //  Fetch metadata from Supabase
      const { data: file, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) throw error;
      const { cid, encrypted_key, iv, file_name } = file;

      //  Fetch encrypted file bytes from OG route
      const response = await fetch(`/api/get-from-og/${cid}`);
      if (!response.ok) throw new Error("Failed to fetch file from OG");

      const encryptedBytes = new Uint8Array(await response.arrayBuffer());

      //  Decrypt locally
      const vaultKey = await importKey(encrypted_key);

      function base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }

      const decryptedBlob = await decryptFile(
        encryptedBytes,
        vaultKey,
        base64ToUint8Array(iv)
      );

      // Trigger browser download
      const url = URL.createObjectURL(decryptedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Error downloading file");
    }
  };

  return { downloadFile };
};
