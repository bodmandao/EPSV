"use client";
import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { useAccount } from "wagmi";
import { useFileUpload } from "@/hooks/useFileUpload";
import { encryptFile, importKey } from "@/utils/crypto"; 
import { supabase } from "@/utils/supabase"; 

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

  const { uploadFileMutation } = useFileUpload();
  const { mutateAsync: uploadFile, isPending: isUploading } = uploadFileMutation;

  useEffect(() => {
    if (!address) return;
    // Fetch vaults owned or joined by wallet
    const fetchVaults = async () => {
      const { data, error } = await supabase
        .from("vaults")
        .select("*")
        .or(`owner_address.eq.${address},members.cs.{${address}}`);
      if (!error && data) setVaults(data);
    };
    fetchVaults();
  }, [address]);

  if (!isOpen) return null;

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedVault) return alert("Pick a file and vault");

    console.log(file,'file')
    // Get vault info 
    const vault = vaults.find((v) => v.id === selectedVault);
    console.log(vault)
    if (!vault) return alert("Vault not found");

    // Import vault key
    const vaultKey = await importKey(vault.encrypted_key);

    // Encrypt file
    const { encryptedFile, iv } = await encryptFile(file, vaultKey);

    // Upload encrypted blob to Filecoin
    const result = await uploadFile(encryptedFile);
    const fileCid = result?.pieceCid;

    // Save metadata to supabase
    const { error } = await supabase.from("files").insert([
      {
        vault_id: vault.id,
        owner_address: address,
        file_name: name || file.name,
        description,
        tags,
        permission,
        price,
        currency,
        cid: fileCid,
        encrypted_key: vault.encrypted_key, 
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      return alert("Error saving metadata");
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white/80 shadow-xl p-6">
        {/* Title bar */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-bold text-[#1d3557]">Upload File</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#e76f51]">
            <X size={20} />
          </button>
        </div>

        {/* Upload zone */}
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#a8dadc] rounded-lg cursor-pointer bg-white/50 hover:bg-white/70">
          <UploadCloud size={32} className="text-[#1d3557]" />
          <p className="mt-2 text-gray-600">
            Drop file or <span className="text-[#2a9d8f] font-semibold">Browse</span>
          </p>
          <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        {/* Vault selection */}
        <div className="mt-3">
          <label className="block mb-1 text-sm font-semibold text-[#1d3557]">Select Vault</label>
          <select
            value={selectedVault}
            onChange={(e) => setSelectedVault(e.target.value)}
            className="w-full rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2"
          >
            <option value="">-- Choose a vault --</option>
            {vaults.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.owner_address.slice(0, 6)}…{v.owner_address.slice(-4)})
              </option>
            ))}
          </select>
        </div>

        {/* Metadata */}
        <div className="mt-4 space-y-3">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2"
            />
            <button onClick={addTag} className="px-3 py-2 rounded-lg bg-[#2a9d8f] text-white">
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="px-3 py-1 bg-[#1d3557] text-white text-sm rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="mt-4 space-y-2">
          {["free", "one-time", "streaming"].map((opt) => (
            <label key={opt} className="flex text-[#1d3557] items-center gap-2">
              <input
                type="radio"
                checked={permission === opt}
                onChange={() => setPermission(opt)}
              />
              <span className="capitalize">{opt.replace("-", " ")}</span>
            </label>
          ))}
        </div>

        {/* Paid options */}
        {permission !== "free" && (
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              placeholder="Price"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="flex-1 rounded-lg text-[#1d3557] border border-gray-300 bg-white/50 px-3 py-2"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "FIL" | "USDC")}
              className="rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2"
            >
              <option value="FIL">FIL</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="text-gray-600 hover:text-[#e76f51]">Cancel</button>
          <button
            disabled={isUploading}
            onClick={handleUpload}
            className="rounded-lg bg-[#2a9d8f] text-white px-4 py-2 shadow hover:bg-[#21867a]"
          >
            {isUploading ? "Uploading..." : "Encrypt & Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
