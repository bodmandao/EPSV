"use client";

import { FileCardProps } from "../interfaces/FileCardProps";
import FileCard from "./FileCard";

export default function FileGrid() {
  const files: FileCardProps[] = [
    { name: "Web3_Whitepaper_v2.pdf", date: "2024-03-15", status: "encrypted", previewUrl: "/images/file1.jpg" },
    { name: "Project_Overview.docx", date: "2024-03-14", status: "shared", previewUrl: "/images/file2.jpg" },
    { name: "Vault_Backup_Q1.zip", date: "2024-03-12", status: "encrypted", previewUrl: "/images/file3.jpg" },
    { name: "Annual_Report_2023.xlsx", date: "2024-03-10", status: "pending", previewUrl: "/images/file4.jpg" },
    { name: "Family_Photos.jpg", date: "2024-03-08", status: "encrypted", previewUrl: "/images/file5.jpg" },
    { name: "Meeting_Notes.txt", date: "2024-03-07", status: "encrypted", previewUrl: "/images/file6.jpg" },
    { name: "Marketing_Assets.zip", date: "2024-03-05", status: "shared", previewUrl: "/images/file7.jpg" },
    { name: "Smart_Contract_Audit.pdf", date: "2024-03-01", status: "encrypted", previewUrl: "/images/file8.jpg" },
    { name: "Holiday_Video.mp4", date: "2024-02-28", status: "pending", previewUrl: "/images/file9.jpg" },
    { name: "Development_Roadmap.md", date: "2024-02-25", status: "encrypted", previewUrl: "/images/file10.jpg" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, idx) => (
          <FileCard key={idx} {...file} />
        ))}
      </div>
    </div>
  );
}
