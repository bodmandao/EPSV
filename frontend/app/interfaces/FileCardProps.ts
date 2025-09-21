export interface FileCardProps {
  name: string;
  date: string;
  status?: "owned" | "shared"; 
  previewUrl?: string;
}