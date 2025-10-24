import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDomainLogo, generateInitials, getBrandDomainVariations } from "@/utils/logoUtils";
import { useState, useEffect } from "react";

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
  
  // Normalize domain
  let normalizedDomain = domain;
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
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {showDomainLogo ? (
        <AvatarImage
          src={currentLogo}
          alt={brandName}
          onError={handleImageError}
        />
      ) : null}
    </Avatar>
  );
};

