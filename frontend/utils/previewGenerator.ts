import { createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
});

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Get fallback image based on file type
const getFallbackImage = (keyword: string): string => {
  const fallbackImages: Record<string, string> = {
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EImage%3C/text%3E%3C/svg%3E",
    video: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23DC2626'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EVideo%3C/text%3E%3C/svg%3E",
    pdf: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23EF4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EPDF%3C/text%3E%3C/svg%3E",
    archive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F59E0B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EArchive%3C/text%3E%3C/svg%3E",
    spreadsheet: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2310B981'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3ESpreadsheet%3C/text%3E%3C/svg%3E",
    document: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%233B82F6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EDocument%3C/text%3E%3C/svg%3E",
    text: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%236B7280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EText%3C/text%3E%3C/svg%3E",
    default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%239CA3AF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='white'%3EFile%3C/text%3E%3C/svg%3E"
  };
  
  return fallbackImages[keyword] || fallbackImages.default;
};

// Get keyword based on file extension
const getKeywordFromFile = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext!)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext!)) return "video";
  if (["pdf"].includes(ext!)) return "pdf";
  if (["zip", "rar", "7z", "tar"].includes(ext!)) return "archive";
  if (["xlsx", "xls", "csv"].includes(ext!)) return "spreadsheet";
  if (["doc", "docx", "odt"].includes(ext!)) return "document";
  if (["txt", "md", "rtf"].includes(ext!)) return "text";
  if (["mp3", "wav", "flac", "ogg"].includes(ext!)) return "music";
  
  return "document";
};

// generate preview URL
export const generatePreviewUrl = async (fileName: string): Promise<string> => {
  const keyword = getKeywordFromFile(fileName);
  
  try {
    const result = await unsplash.photos.getRandom({
      query: keyword,
      count: 1,
    });
    
    if (result.type === 'success') {
      const photo = result.response as unknown as Array<{ urls: { regular: string } }>;
      if (photo && photo[0]?.urls?.regular) {
        return photo[0].urls.regular;
      }
    }
    
    // Fallback to SVG if Unsplash fails
    return getFallbackImage(keyword);
  } catch (error) {
    console.error('Failed to fetch Unsplash image:', error);
    return getFallbackImage(keyword);
  }
};