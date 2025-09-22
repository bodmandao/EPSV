"use client";

import { ethers } from "ethers";
import { Synapse } from "@filoz/synapse-sdk";
import { supabase } from "@/utils/supabase";
import { importKey } from "@/utils/crypto";
import { decryptFile } from "@/utils/crypto";

export const useFileDownload = () => {
  const downloadFile = async (fileId: string) => {
    try {
      // Fetch file metadata
      const { data: file, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) throw error;

      const { cid, encrypted_key, iv, file_name } = file;

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const synapse = await Synapse.create({ provider });

      const encryptedBytes: Uint8Array = await synapse.storage.download(cid);

      const vaultKey = await importKey(encrypted_key);
      console.log(encryptedBytes, vaultKey, iv)

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
