"use client";

import { FileCardProps } from "../interfaces/FileCardProps";

export default function FileCard({ name, date, status, previewUrl }: FileCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "encrypted":
        return "bg-blue-600";
      case "shared":
        return "bg-green-600";
      case "pending":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition cursor-pointer">
      {/* File preview */}
      <div className="h-28 w-full bg-gray-100 flex items-center justify-center relative">
        {previewUrl ? (
          <img src={previewUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-gray-400 text-sm">No Preview</div>
        )}
        {status && (
          <span
            className={`absolute top-2 right-2 text-xs text-gray-900 px-2 py-0.5 rounded-full ${getStatusColor()}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      {/* File info */}
      <div className="p-2">
        <p className="text-sm font-medium truncate text-gray-400">{name}</p>
        <p className="text-xs text-gray-400 text-bold">{date}</p>
      </div>
    </div>
  );
}
