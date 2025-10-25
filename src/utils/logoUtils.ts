/**
 * Utility functions for fetching and handling domain logos
 */

// LocalStorage key for brand domain cache
const BRAND_DOMAIN_CACHE_KEY = 'aeorank_brand_domain_cache';

/**
 * Load brand domain cache from localStorage
 */
const loadBrandDomainCache = (): Map<string, string> => {
  try {
    const cached = localStorage.getItem(BRAND_DOMAIN_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error('Error loading brand domain cache:', error);
  }
  return new Map();
};

/**
 * Save brand domain cache to localStorage
 */
const saveBrandDomainCache = (cache: Map<string, string>): void => {
  try {
    const obj = Object.fromEntries(cache);
    localStorage.setItem(BRAND_DOMAIN_CACHE_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error('Error saving brand domain cache:', error);
  }
};

// Domain cache to ensure consistent domain usage across the app (now persisted to localStorage)
const brandDomainCache: Map<string, string> = loadBrandDomainCache();

/**
 * Normalize a brand name for consistent cache key
 */
const normalizeBrandName = (brandName: string): string => {
  return brandName.toLowerCase().trim().replace(/\s+/g, '');
};

/**
 * Set the preferred domain for a brand (to ensure consistency)
 */
export const setBrandDomain = (brandName: string, domain: string): void => {
  if (!brandName || !domain) return;
  const normalizedName = normalizeBrandName(brandName);
  const cleanDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0];
  
  // Only set if not already cached (first domain wins)
  if (!brandDomainCache.has(normalizedName)) {
    brandDomainCache.set(normalizedName, cleanDomain);
    saveBrandDomainCache(brandDomainCache);
  }
};

/**
 * Get the cached domain for a brand
 */
export const getBrandDomain = (brandName: string): string | undefined => {
  if (!brandName) return undefined;
  const normalizedName = normalizeBrandName(brandName);
  return brandDomainCache.get(normalizedName);
};

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
export const getDomainLogo = (domain: string | undefined, logoUrl?: string, brandName?: string): string => {
  // If logo URL is provided and starts with http, use it
  if (logoUrl && logoUrl.startsWith('http')) {
    return logoUrl;
  }
  
  // Check if we have a cached domain for this brand (ensures consistency)
  let effectiveDomain = domain;
  if (brandName) {
    const cachedDomain = getBrandDomain(brandName);
    if (cachedDomain) {
      effectiveDomain = cachedDomain;
    } else if (domain) {
      // Cache this domain for future use
      setBrandDomain(brandName, domain);
      effectiveDomain = domain;
    }
  }
  
  // If domain is provided, get favicon from domain
  if (effectiveDomain) {
    return getFaviconUrl(effectiveDomain, 64);
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
