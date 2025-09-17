// app/components/BreadcrumbBar.tsx
"use client";

import { ChevronRight, SortAsc } from "lucide-react";

export default function BreadcrumbBar() {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <span className="cursor-pointer hover:text-gray-700">Home</span>
        <ChevronRight size={16} className="mx-1 text-gray-400" />
        <span className="cursor-pointer hover:text-gray-700 font-medium text-gray-700">
          All Files
        </span>
      </div>

      {/* Sort control */}
      <div>
        <button className="flex items-center gap-1 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
          <SortAsc size={16} />
          Sort by: Name
        </button>
      </div>
    </div>
  );
}
