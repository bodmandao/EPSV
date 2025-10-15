"use client";
import { useState, useEffect } from "react";
import { X, UploadCloud, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";
import { encryptFile, importKey } from "@/utils/crypto";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadFileModal({ isOpen, onClose }: UploadFileModalProps) {
  const { address } = useAccount();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [permission, setPermission] = useState("free");
  const [price, setPrice] = useState<number | undefined>();
  const [currency, setCurrency] = useState<"FIL" | "USDC">("FIL");
  const [vaults, setVaults] = useState<any[]>([]);
  const [selectedVault, setSelectedVault] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false)
   const [isGenerating, setIsGenerating] = useState(false);


  useEffect(() => {
    if (!address) return;

    const fetchVaults = async () => {
      try {
        const { data, error } = await supabase
          .from("vaults")
          .select("*")
          .or(`owner_address.eq.${address},members.cs.{${address}}`);

        if (error) throw error;

        if (data) {
          setVaults(data);
          if (data.length > 0 && !selectedVault) {
            setSelectedVault(data[0].id); // Auto-select first vault
          }
        }
      } catch (error) {
        console.error("Error fetching vaults:", error);
        toast.error("Failed to load vaults");
      }
    };

    fetchVaults();
  }, [address, selectedVault]);

  if (!isOpen) return null;

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) {
      toast.error("Please enter a tag");
      return;
    }

    if (tags.includes(trimmedTag)) {
      toast.error("Tag already exists");
      return;
    }

    if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput("");
    toast.success("Tag added");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    toast.info("Tag removed");
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validate file size (e.g., 100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 100MB");
      return;
    }

    setFile(selectedFile);

    // Auto-fill name if empty
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }

    toast.success(`"${selectedFile.name}" selected`);
  };

   const generateMetadata = async () => {
    if (!file || !selectedVault) return toast.error("Select file and vault first");
    setIsGenerating(true);

    const vault = vaults.find((v) => v.id === selectedVault);
    try {
      toast.loading("Generating metadata with OG Inference...");

      const res:any = await fetch("/api/generate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultName: vault.name,
          fileName: file.name,
          context: `This is a file in the ${vault.name} vault, possibly related to ${tags.join(", ") || "general content"}.`,
        }),
      });

      const data = await res.json();
      console.log(data)
      if (!data.success) throw new Error(data.error);

      const { name, description, tagss } = data.metadata;

      setName(name || file.name.replace(/\.[^/.]+$/, ""));
      setDescription(description || "");
      setTags(tagss || []);

      toast.success("✨ Metadata generated!");
      setIsGenerating(false);
      
    } catch (e: any) {
      console.error("AI metadata error:", e);
      toast.error("AI generation failed. Please fill manually.");
    } finally {
      setIsGenerating(false);
    }
  };


  const validateForm = (): boolean => {
    if (!file) {
      toast.error("Please select a file to upload");
      return false;
    }

    if (!selectedVault) {
      toast.error("Please select a vault");
      return false;
    }

    if (permission !== "free" && (!price || price <= 0)) {
      toast.error("Please enter a valid price for paid content");
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    try {
      setIsUploading(true)
      const loadingToast = toast.loading("Preparing file for upload...");

      // Get vault info 
      const vault = vaults.find((v) => v.id === selectedVault);
      if (!vault) {
        toast.error("Selected vault not found", { id: loadingToast });
        return;
      }

      toast.success("Vault found. Encrypting file...", { id: loadingToast });

      // Import vault key
      const vaultKey = await importKey(vault.encrypted_key);

      // Encrypt file
      const { encryptedFile, iv } = await encryptFile(file!, vaultKey);
      toast.success("File encrypted. Uploading to OG storage...", { id: loadingToast });

      // Upload encrypted OG
      const formData = new FormData();
      formData.append("file", new File([encryptedFile], file!.name));

      const res = await fetch("/api/upload-to-og", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result?.rootHash) {
        console.error("Upload error:", result);
        throw new Error(result?.error || "Failed to upload file to OG");
      }

      const fileCid = result.rootHash;

      toast.success("File uploaded. Saving metadata...", { id: loadingToast });

      // Save metadata to supabase
      const { error } = await supabase.from("files").insert([
        {
          vault_id: vault.id,
          owner_address: address,
          file_name: name || file?.name,
          description: description.trim(),
          tags,
          permission,
          price: permission !== "free" ? price : null,
          currency: permission !== "free" ? currency : null,
          cid: fileCid,
          encrypted_key: vault.encrypted_key,
          iv,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      toast.success("✅ File uploaded successfully! 🎉", { id: loadingToast });
      setIsUploading(false)

      // Reset form and close modal after success
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);

    } catch (err) {
      setIsUploading(false)

      console.error("Upload error:", err);

      if (err instanceof Error) {
        if (err.message.includes("Database error")) {
          toast.error("Failed to save file metadata");
        } else if (err.message.includes("encrypt")) {
          toast.error("File encryption failed");
        } else if (err.message.includes("upload")) {
          toast.error("File upload failed. Please check your connection.");
        } else {
          toast.error("Upload failed. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setName("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setPermission("free");
    setPrice(undefined);
    setCurrency("FIL");
    setSelectedVault("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white/80 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Title bar */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-bold text-[#1d3557]">Upload File</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-[#e76f51]"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* File info display */}
        {file && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">Selected file:</p>
            <p className="text-green-700 truncate">📄 {file.name}</p>
            <p className="text-xs text-green-600">
              Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Upload zone */}
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file
            ? "border-green-300 bg-green-50/50"
            : "border-[#a8dadc] bg-white/50 hover:bg-white/70"
          }`}>
          <UploadCloud size={32} className={file ? "text-green-500" : "text-[#1d3557]"} />
          <p className="mt-2 text-gray-600 text-center">
            {file ? "File selected" : "Drop file or"}
            <span className="text-[#2a9d8f] font-semibold"> Browse</span>
          </p>
          <input
            type="file"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            disabled={isUploading}
          />
        </label>

        {/* Vault selection */}
        <div className="mt-4">
          <label className="block mb-1 text-sm font-semibold text-[#1d3557]">Select Vault</label>
          <select
            value={selectedVault}
            onChange={(e) => setSelectedVault(e.target.value)}
            className="w-full rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
            disabled={isUploading || vaults.length === 0}
          >
            <option value="">-- Choose a vault --</option>
            {vaults.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.members?.length || 0} members)
              </option>
            ))}
          </select>
          {vaults.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No vaults available. Create a vault first.</p>
          )}
        </div>

         {/* AI Metadata Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={generateMetadata}
            disabled={!file || !selectedVault || isGenerating}
            className="flex items-center gap-2 bg-[#2a9d8f] text-white px-3 py-2 rounded-lg hover:bg-[#21867a] disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isGenerating ? "Generating..." : "Auto-generate Metadata"}
          </button>
        </div>

        {/* Metadata */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="block mb-1 text-sm font-semibold text-[#1d3557]">File Name</label>
            <input
              type="text"
              placeholder="File name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
              disabled={isUploading}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-[#1d3557]">Description</label>
            <textarea
              placeholder="File description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
              disabled={isUploading}
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-[#1d3557]">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                disabled={isUploading || tags.length >= 5}
              />
              <button
                onClick={addTag}
                className="px-3 py-2 rounded-lg bg-[#2a9d8f] text-white hover:bg-[#21867a] disabled:opacity-50"
                disabled={isUploading || tags.length >= 5}
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span key={t} className="px-3 py-1 bg-[#1d3557] text-white text-sm rounded-full flex items-center gap-1">
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    className="text-xs hover:text-gray-300"
                    disabled={isUploading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{tags.length}/5 tags</p>
          </div>
        </div>

        {/* Permissions */}
        <div className="mt-4">
          <label className="block mb-2 text-sm font-semibold text-[#1d3557]">Access Permission</label>
          <div className="space-y-2">
            {[
              { value: "free", label: "Free access" },
              { value: "one-time", label: "One-time payment" },
              { value: "streaming", label: "Streaming payment" }
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-[#1d3557]">
                <input
                  type="radio"
                  checked={permission === opt.value}
                  onChange={() => setPermission(opt.value)}
                  disabled={isUploading}
                  className="text-[#2a9d8f] focus:ring-[#2a9d8f]"
                />
                <span className="capitalize">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Paid options */}
        {permission !== "free" && (
          <div className="mt-4">
            <label className="block mb-1 text-sm font-semibold text-[#1d3557]">Pricing</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Price"
                min="0"
                step="0.01"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1 rounded-lg text-[#1d3557] border border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                disabled={isUploading}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "FIL" | "USDC")}
                className="rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2 focus:ring-2 focus:ring-[#2a9d8f]"
                disabled={isUploading}
              >
                <option value="FIL">FIL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-[#e76f51] disabled:opacity-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            disabled={isUploading || !file || !selectedVault || (permission !== "free" && (!price || price <= 0))}
            onClick={handleUpload}
            className="rounded-lg bg-[#2a9d8f] text-white px-4 py-2 shadow hover:bg-[#21867a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Encrypt & Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}