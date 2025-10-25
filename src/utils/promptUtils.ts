// Prompt utility functions

// Comprehensive Country to flag emoji mapping
// Supports full names, common abbreviations, and variations
export const COUNTRY_FLAGS: Record<string, string> = {
  // Popular countries with variations
  "united states": "🇺🇸", "usa": "🇺🇸", "us": "🇺🇸", "america": "🇺🇸",
  "united kingdom": "🇬🇧", "uk": "🇬🇧", "britain": "🇬🇧", "england": "🇬🇧", "great britain": "🇬🇧", "gb": "🇬🇧",
  "canada": "🇨🇦", "ca": "🇨🇦",
  "australia": "🇦🇺", "au": "🇦🇺",
  "germany": "🇩🇪", "de": "🇩🇪", "deutschland": "🇩🇪",
  "india": "🇮🇳", "in": "🇮🇳", "bharat": "🇮🇳",
  "france": "🇫🇷", "fr": "🇫🇷",
  "japan": "🇯🇵", "jp": "🇯🇵",
  "china": "🇨🇳", "cn": "🇨🇳", "prc": "🇨🇳",
  "brazil": "🇧🇷", "br": "🇧🇷", "brasil": "🇧🇷",
  "mexico": "🇲🇽", "mx": "🇲🇽",
  "spain": "🇪🇸", "es": "🇪🇸", "españa": "🇪🇸",
  "italy": "🇮🇹", "it": "🇮🇹", "italia": "🇮🇹",
  "russia": "🇷🇺", "ru": "🇷🇺",
  "south korea": "🇰🇷", "korea": "🇰🇷", "kr": "🇰🇷",
  "netherlands": "🇳🇱", "nl": "🇳🇱", "holland": "🇳🇱",
  "switzerland": "🇨🇭", "ch": "🇨🇭",
  "sweden": "🇸🇪", "se": "🇸🇪",
  "singapore": "🇸🇬", "sg": "🇸🇬",
  "saudi arabia": "🇸🇦", "sa": "🇸🇦", "saudi": "🇸🇦",
  "united arab emirates": "🇦🇪", "uae": "🇦🇪", "dubai": "🇦🇪", "ae": "🇦🇪",
  "new zealand": "🇳🇿", "nz": "🇳🇿",
  "ireland": "🇮🇪", "ie": "🇮🇪",
  "belgium": "🇧🇪", "be": "🇧🇪",
  "austria": "🇦🇹", "at": "🇦🇹",
  "poland": "🇵🇱", "pl": "🇵🇱", "polska": "🇵🇱",
  "norway": "🇳🇴", "no": "🇳🇴", "norge": "🇳🇴",
  "denmark": "🇩🇰", "dk": "🇩🇰", "danmark": "🇩🇰",
  "finland": "🇫🇮", "fi": "🇫🇮", "suomi": "🇫🇮",
  "portugal": "🇵🇹", "pt": "🇵🇹",
  "greece": "🇬🇷", "gr": "🇬🇷",
  // African countries
  "nigeria": "🇳🇬", "ng": "🇳🇬",
  "south africa": "🇿🇦", "za": "🇿🇦",
  "egypt": "🇪🇬", "eg": "🇪🇬",
  "kenya": "🇰🇪", "ke": "🇰🇪",
  "ghana": "🇬🇭", "gh": "🇬🇭",
  "morocco": "🇲🇦", "ma": "🇲🇦",
  "ethiopia": "🇪🇹", "et": "🇪🇹",
  "tanzania": "🇹🇿", "tz": "🇹🇿",
  "uganda": "🇺🇬", "ug": "🇺🇬",
  "algeria": "🇩🇿", "dz": "🇩🇿",
  // South American countries
  "argentina": "🇦🇷", "ar": "🇦🇷",
  "chile": "🇨🇱", "cl": "🇨🇱",
  "colombia": "🇨🇴", "co": "🇨🇴",
  "peru": "🇵🇪", "pe": "🇵🇪",
  "venezuela": "🇻🇪", "ve": "🇻🇪",
  "ecuador": "🇪🇨", "ec": "🇪🇨",
  "bolivia": "🇧🇴", "bo": "🇧🇴",
  "paraguay": "🇵🇾", "py": "🇵🇾",
  "uruguay": "🇺🇾", "uy": "🇺🇾",
  // Middle Eastern countries
  "turkey": "🇹🇷", "tr": "🇹🇷", "türkiye": "🇹🇷",
  "israel": "🇮🇱", "il": "🇮🇱",
  "iran": "🇮🇷", "ir": "🇮🇷",
  "iraq": "🇮🇶", "iq": "🇮🇶",
  "qatar": "🇶🇦", "qa": "🇶🇦",
  "kuwait": "🇰🇼", "kw": "🇰🇼",
  "bahrain": "🇧🇭", "bh": "🇧🇭",
  "oman": "🇴🇲", "om": "🇴🇲",
  "jordan": "🇯🇴", "jo": "🇯🇴",
  "lebanon": "🇱🇧", "lb": "🇱🇧",
  "syria": "🇸🇾", "sy": "🇸🇾",
  "yemen": "🇾🇪", "ye": "🇾🇪",
  // Asian countries
  "pakistan": "🇵🇰", "pk": "🇵🇰",
  "bangladesh": "🇧🇩", "bd": "🇧🇩",
  "indonesia": "🇮🇩", "id": "🇮🇩",
  "thailand": "🇹🇭", "th": "🇹🇭",
  "vietnam": "🇻🇳", "vn": "🇻🇳", "việt nam": "🇻🇳",
  "philippines": "🇵🇭", "ph": "🇵🇭",
  "malaysia": "🇲🇾", "my": "🇲🇾",
  "taiwan": "🇹🇼", "tw": "🇹🇼",
  "hong kong": "🇭🇰", "hk": "🇭🇰",
  "sri lanka": "🇱🇰", "lk": "🇱🇰",
  "nepal": "🇳🇵", "np": "🇳🇵",
  "myanmar": "🇲🇲", "mm": "🇲🇲", "burma": "🇲🇲",
  "cambodia": "🇰🇭", "kh": "🇰🇭",
  "laos": "🇱🇦", "la": "🇱🇦",
  "mongolia": "🇲🇳", "mn": "🇲🇳",
  "afghanistan": "🇦🇫", "af": "🇦🇫",
  // European countries
  "czech republic": "🇨🇿", "cz": "🇨🇿", "czechia": "🇨🇿",
  "romania": "🇷🇴", "ro": "🇷🇴",
  "hungary": "🇭🇺", "hu": "🇭🇺",
  "ukraine": "🇺🇦", "ua": "🇺🇦",
  "croatia": "🇭🇷", "hr": "🇭🇷",
  "bulgaria": "🇧🇬", "bg": "🇧🇬",
  "slovakia": "🇸🇰", "sk": "🇸🇰",
  "lithuania": "🇱🇹", "lt": "🇱🇹",
  "latvia": "🇱🇻", "lv": "🇱🇻",
  "estonia": "🇪🇪", "ee": "🇪🇪",
  "slovenia": "🇸🇮", "si": "🇸🇮",
  "luxembourg": "🇱🇺", "lu": "🇱🇺",
  "iceland": "🇮🇸", "is": "🇮🇸",
  "serbia": "🇷🇸", "rs": "🇷🇸",
  "belarus": "🇧🇾", "by": "🇧🇾",
  "bosnia": "🇧🇦", "ba": "🇧🇦", "bosnia and herzegovina": "🇧🇦",
  "albania": "🇦🇱", "al": "🇦🇱",
  "macedonia": "🇲🇰", "mk": "🇲🇰", "north macedonia": "🇲🇰",
  "malta": "🇲🇹", "mt": "🇲🇹",
  "cyprus": "🇨🇾", "cy": "🇨🇾",
  // Caribbean & Central America
  "costa rica": "🇨🇷", "cr": "🇨🇷",
  "panama": "🇵🇦", "pa": "🇵🇦",
  "cuba": "🇨🇺", "cu": "🇨🇺",
  "dominican republic": "🇩🇴", "do": "🇩🇴",
  "jamaica": "🇯🇲", "jm": "🇯🇲",
  "puerto rico": "🇵🇷", "pr": "🇵🇷",
  "guatemala": "🇬🇹", "gt": "🇬🇹",
  "honduras": "🇭🇳", "hn": "🇭🇳",
  "el salvador": "🇸🇻", "sv": "🇸🇻",
  "nicaragua": "🇳🇮", "ni": "🇳🇮",
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
// Handles full names, abbreviations, and variations (case-insensitive)
export const getCountryFlag = (location: string): string => {
  if (!location || location === "—") return "";
  
  // Normalize the location: lowercase and trim
  const normalized = location.toLowerCase().trim();
  
  // Look up the flag using the normalized location
  return COUNTRY_FLAGS[normalized] || "🌐";
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

