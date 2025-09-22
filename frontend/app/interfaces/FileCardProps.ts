export interface FileCardProps {
  id : string
  name: string;
  date: string;
  status?: "owned" | "shared"; 
  previewUrl?: string;
}