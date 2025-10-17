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
 * Get logo URL from domain, with fallback to favicon
 * @param domain - The domain or website URL
 * @param logoUrl - Optional direct logo URL from API
 * @returns The best available logo URL
 */
export const getDomainLogo = (domain: string, logoUrl?: string): string => {
  // If logo URL is provided and starts with http, use it
  if (logoUrl && logoUrl.startsWith('http')) {
    return logoUrl;
  }
  
  // Otherwise, get favicon from domain
  return getFaviconUrl(domain, 64);
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
