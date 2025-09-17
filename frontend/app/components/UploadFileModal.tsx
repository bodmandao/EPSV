"use client";
import { useState } from "react";
import { X, UploadCloud } from "lucide-react";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: {
    name: string;
    description: string;
    tags: string[];
    permission: string;
    price?: number;
    currency?: "FIL" | "USDC";
  }) => void;
}

export default function UploadFileModal({ isOpen, onClose, onUpload }: UploadFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [permission, setPermission] = useState("free");
  const [price, setPrice] = useState<number | undefined>();
  const [currency, setCurrency] = useState<"FIL" | "USDC">("FIL");

  if (!isOpen) return null;

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleUpload = () => {
    onUpload({ name, description, tags, permission, price, currency });
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

        {/* Progress (mock encryption status) */}
        {file && (
          <div className="mt-3">
            <p className="text-sm text-gray-700">Encrypting {file.name}...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#2a9d8f] w-1/2 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="File Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border text-[#1d3557] border-gray-300 bg-white/50 px-3 py-2"
          />
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
            onClick={handleUpload}
            className="rounded-lg bg-[#2a9d8f] text-white px-4 py-2 shadow hover:bg-[#21867a]"
          >
            Encrypt & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
