// Prompt utility functions

// Country to flag emoji mapping
export const COUNTRY_FLAGS: Record<string, string> = {
  // Country names
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Japan: "🇯🇵",
  China: "🇨🇳",
  Brazil: "🇧🇷",
  Mexico: "🇲🇽",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Singapore: "🇸🇬",
  // Country codes
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  CN: "🇨🇳",
  BR: "🇧🇷",
  MX: "🇲🇽",
  ES: "🇪🇸",
  IT: "🇮🇹",
  NL: "🇳🇱",
  SG: "🇸🇬",
};

// Platform to domain mapping for favicon fetching
export const PLATFORM_DOMAINS: Record<string, string> = {
  // AI Platforms
 
  // Business Software
  
  
  
  
 
  
  // Generic fallback - will try to construct domain
};

// Helper function to get domain for a brand/platform
export const getDomainForBrand = (brandName: string): string => {
  if (!brandName) return "";
  
  // First check if we have a mapping
  const mappedDomain = PLATFORM_DOMAINS[brandName] || PLATFORM_DOMAINS[brandName.toLowerCase()];
  if (mappedDomain) return mappedDomain;
  
  // Construct domain from brand name (e.g., "BMW" -> "bmw.com")
  const domain = `${brandName.toLowerCase().replace(/\s+/g, '')}.com`;
  return domain;
};

// Helper function to get country flag
export const getCountryFlag = (location: string): string => {
  if (!location || location === "—") return "";
  return COUNTRY_FLAGS[location] || COUNTRY_FLAGS[location.toUpperCase()] || "";
};

// Helper function to calculate time ago
export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Helper function to get volume bar count (UI component should render this)
export const getVolumeBars = (volumeValue: number): number => {
  const maxBars = 5;
  return Math.min(Math.max(Math.ceil(volumeValue / 100), 0), maxBars);
};

// Sort prompts by date
export const sortPromptsByDate = <T extends { addedAt?: string | Date }>(
  prompts: T[],
  sortOrder: "asc" | "desc" | null
): T[] => {
  if (!sortOrder) return prompts;

  return [...prompts].sort((a, b) => {
    const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
    const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;

    if (sortOrder === "asc") {
      return dateA - dateB; // Oldest first
    } else {
      return dateB - dateA; // Newest first
    }
  });
};

// Parse CSV with proper handling of quoted fields
export const parseCSVLine = (line: string): string[] => {
  const regex = /("([^"]*)"|([^,]*))(,|$)/g;
  const parts: string[] = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    const value = match[2] !== undefined ? match[2] : match[3];
    parts.push(value ? value.trim() : "");
  }

  return parts;
};

