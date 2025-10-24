/**
 * Utility functions for fetching and handling domain logos
 */

/**
 * Get favicon URL for a domain using Google's favicon service
 * @param domain - The domain to get the favicon for (e.g., "example.com" or "https://example.com")
 * @param size - The size of the favicon (default: 32)
 * @returns The URL to the favicon
 */
export const getFaviconUrl = (domain: string, size: number = 32): string => {
  if (!domain) return '';
  
  // Remove protocol and www prefix
  const cleanDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0];
  
  return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`;
};

/**
 * Get multiple domain variations for a brand name
 * @param brandName - The brand name
 * @returns Array of domain variations to try
 */
export const getBrandDomainVariations = (brandName: string): string[] => {
  if (!brandName) return [];
  
  const cleanBrandName = brandName.toLowerCase().replace(/\s+/g, '');
  
  return [
    `${cleanBrandName}.com`,
    `${cleanBrandName}.art`,
    `${cleanBrandName}.co`,
    `${cleanBrandName}.io`,
    `${cleanBrandName}.net`,
    `${cleanBrandName}.org`,
    `${cleanBrandName}.in`,
    `${cleanBrandName}.uk`
  ];
};

/**
 * Get logo URL from domain, with fallback to favicon
 * @param domain - The domain or website URL
 * @param logoUrl - Optional direct logo URL from API
 * @param brandName - Optional brand name to use for logo lookup
 * @returns The best available logo URL
 */
export const getDomainLogo = (domain: string, logoUrl?: string, brandName?: string): string => {
  // If logo URL is provided and starts with http, use it
  if (logoUrl && logoUrl.startsWith('http')) {
    return logoUrl;
  }
  
  // If domain is provided, get favicon from domain
  if (domain) {
    return getFaviconUrl(domain, 64);
  }
  
  // If no domain but brand name is provided, try the first domain variation
  if (brandName) {
    const variations = getBrandDomainVariations(brandName);
    if (variations.length > 0) {
      return getFaviconUrl(variations[0], 64);
    }
  }
  
  return '';
};

/**
 * Check if a domain is likely to have a valid favicon
 * @param domain - The domain to check
 * @returns boolean indicating if domain likely has favicon
 */
export const isDomainLikelyToHaveFavicon = (domain: string): boolean => {
  if (!domain) return false;
  
  // Common domains that typically have favicons
  const commonDomains = [
    'google.com', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
    'youtube.com', 'github.com', 'stackoverflow.com', 'reddit.com', 'amazon.com',
    'apple.com', 'microsoft.com', 'netflix.com', 'spotify.com', 'dropbox.com'
  ];
  
  const cleanDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
  
  return commonDomains.some(common => cleanDomain.includes(common));
};

/**
 * Check if a logo URL is valid and accessible
 * @param url - The logo URL to check
 * @returns Promise that resolves to true if the logo is accessible
 */
export const isLogoAccessible = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // This allows checking without CORS issues
    });
    return true; // If no error, assume it's accessible
  } catch (error) {
    return false;
  }
};

/**
 * Generate initials from a name for fallback logo
 * @param name - The name to generate initials from
 * @returns The initials (max 2 characters)
 */
export const generateInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};
