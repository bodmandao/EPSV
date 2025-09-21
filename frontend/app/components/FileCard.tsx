"use client";

import { FileCardProps } from "../interfaces/FileCardProps";

export default function FileCard({ name, date, status, previewUrl }: FileCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "owned":
        return "bg-blue-600 text-white";
      case "shared":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-400 text-white";
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
            className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor()}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      {/* File info */}
      <div className="p-2">
        <p className="text-sm font-medium truncate text-gray-800">{name}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
}
