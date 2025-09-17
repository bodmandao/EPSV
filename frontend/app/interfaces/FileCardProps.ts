export interface FileCardProps {
  name: string;
  date: string;
  status?: "encrypted" | "shared" | "pending";
  previewUrl?: string;
}