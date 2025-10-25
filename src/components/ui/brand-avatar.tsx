import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDomainLogo, generateInitials, getBrandDomainVariations, getBrandDomain, setBrandDomain } from "@/utils/logoUtils";
import { useState, useEffect } from "react";
import defaultLogo from "@/assets/images.png";

interface BrandAvatarProps {
  brandName: string;
  domain?: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  highlighted?: boolean;
  showFallbackBackground?: boolean;
}

export const BrandAvatar = ({
  brandName,
  domain,
  logoUrl,
  size = "md",
  className = "",
  highlighted = false,
  showFallbackBackground = false,
}: BrandAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [domainVariations, setDomainVariations] = useState<string[]>([]);
  
  // Check if we have a cached domain for this brand (ensures consistency across pages)
  const cachedDomain = brandName ? getBrandDomain(brandName) : undefined;
  
  // Normalize domain - prefer cached domain for consistency
  let normalizedDomain = cachedDomain || domain;
  
  // Cache the domain if provided and not already cached
  if (brandName && domain && !cachedDomain) {
    const cleanDomain = domain
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/.*$/, "");
    setBrandDomain(brandName, cleanDomain);
    normalizedDomain = cleanDomain;
  }
  
  if (!normalizedDomain && brandName) {
    normalizedDomain = `${brandName.toLowerCase().replace(/\s+/g, "")}.com`;
  }
  if (normalizedDomain) {
    normalizedDomain = normalizedDomain
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/.*$/, "");
  }

  // Get domain variations for fallback
  useEffect(() => {
    if (brandName) {
      const variations = getBrandDomainVariations(brandName);
      // Add the original domain at the beginning if it exists
      if (normalizedDomain && !variations.includes(normalizedDomain)) {
        variations.unshift(normalizedDomain);
      }
      setDomainVariations(variations);
    }
  }, [brandName, normalizedDomain]);

  // Get current logo URL
  const currentLogo = domainVariations.length > 0 
    ? getDomainLogo(domainVariations[currentLogoIndex], logoUrl, brandName)
    : getDomainLogo(normalizedDomain, logoUrl, brandName);
  
  // Only show domain logo if it exists and hasn't failed
  const showDomainLogo = currentLogo && !imageError;

  // Size mapping
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
    "2xl": "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-lg",
    "2xl": "text-2xl",
  };

  // Handle image error - try next domain variation
  const handleImageError = () => {
    if (currentLogoIndex < domainVariations.length - 1) {
      // Try next domain variation
      setCurrentLogoIndex(currentLogoIndex + 1);
      setImageError(false);
    } else {
      // All variations failed
      setImageError(true);
    }
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className} ${highlighted ? 'ring-2 ring-blue-500' : ''}`}>
      {showDomainLogo ? (
        <AvatarImage
          src={currentLogo}
          alt={brandName}
          onError={handleImageError}
        />
      ) : (
        <AvatarImage
          src={defaultLogo}
          alt={brandName}
          className="p-1 opacity-70"
        />
      )}
      <AvatarFallback 
        className={`${textSizeClasses[size]} font-semibold ${
          showFallbackBackground 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {generateInitials(brandName)}
      </AvatarFallback>
    </Avatar>
  );
};

