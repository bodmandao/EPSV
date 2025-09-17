"use client";

export default function StorageUsage() {
  return (
    <div className="bg-blue-50 border rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700">Storage Usage</h3>
      <p className="text-xs text-gray-500 mb-2">75 GB of 100 GB used (75.0%)</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: "75%" }}
        ></div>
      </div>
    </div>
  );
}
