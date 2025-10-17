interface RankingData {
  brand: string;
  visibility: number;
  sentiment?: number;
  position?: number;
  logo?: string;
}

interface ProcessedRankingItem {
  id: string | number;
  brand: string;
  logo?: string;
  visibility: string;
  visibilityValue: number;
  sentiment: number;
  position: string;
  positionValue: number;
  originalPosition?: number;
}

/**
 * Process ranking data with proper decimal position handling
 * @param data Raw ranking data from API
 * @param isPromptSpecific Whether this is prompt-specific data
 * @returns Processed ranking data with proper positions
 */
export const processRankingData = (
  data: any[],
  isPromptSpecific: boolean = false
): ProcessedRankingItem[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  let processedData: RankingData[] = [];

  if (isPromptSpecific) {
    // Process prompt-specific data
    const brandMap = new Map<string, RankingData>();
    
    data.forEach((row: any) => {
      const brandKey = row.brand || row.brand_name || row.name;
      const visibility = Number(row.visibility ?? row.avg_visibility ?? 0);
      
      if (brandKey) {
        const current = brandMap.get(brandKey) || {
          brand: brandKey,
          visibility: 0,
          sentiment: 0,
          position: 0,
          logo: row.logo || ""
        };
        
        // Average visibility
        current.visibility = (current.visibility + visibility) / 2;
        
        // Use the most recent sentiment and position
        if (row.sentiment !== undefined || row.avg_sentiment !== undefined) {
          current.sentiment = Number(row.sentiment ?? row.avg_sentiment);
        }
        if (row.position !== undefined || row.avg_position !== undefined) {
          current.position = Number(row.position ?? row.avg_position);
        }
        
        brandMap.set(brandKey, current);
      }
    });
    
    processedData = Array.from(brandMap.values());
  } else {
    // Process general brand data
    processedData = data.map((item: any) => ({
      brand: item.brand_name,
      visibility: Number(item.avg_visibility) || 0,
      sentiment: Number(item.avg_sentiment) || 0,
      position: Number(item.avg_position) || 0,
      logo: item.logo || ""
    }));
  }

  // Sort by visibility first, then by position (if available)
  const sortedData = processedData.sort((a, b) => {
    // Primary sort: visibility (descending)
    if (b.visibility !== a.visibility) {
      return b.visibility - a.visibility;
    }
    
    // Secondary sort: position (ascending) - lower position number = better rank
    if (a.position && b.position && a.position !== b.position) {
      return a.position - b.position;
    }
    
    // Tertiary sort: sentiment (descending) - higher sentiment = better rank
    if (a.sentiment && b.sentiment && a.sentiment !== b.sentiment) {
      return b.sentiment - a.sentiment;
    }
    
    return 0;
  });

  // Assign final positions based on sorted order
  return sortedData.map((item, index) => {
    const finalPosition = index + 1;
    
    // Brand name mapping for common variations
    const brandNameMapping: Record<string, string> = {
      'bajaj': 'Bajaj Finserv',
      'Bajaj': 'Bajaj Finserv',
      'BAJAJ': 'Bajaj Finserv',
    };
    
    // Domain mapping for specific brands to get correct logos
    const brandDomainMapping: Record<string, string> = {
      'bajaj': 'bajajfinserv.in',
      'Bajaj': 'bajajfinserv.in',
      'BAJAJ': 'bajajfinserv.in',
      'bajaj finserv': 'bajajfinserv.in',
      'Bajaj Finserv': 'bajajfinserv.in',
    };
    
    const displayName = brandNameMapping[item.brand] || item.brand;
    
    // Generate proper logo URL
    const getLogoUrl = (brandName: string, existingLogo?: string) => {
      if (existingLogo && existingLogo.startsWith('http')) {
        return existingLogo;
      }
      
      // Check if we have a specific domain mapping for this brand
      const mappedDomain = brandDomainMapping[brandName.toLowerCase()] || brandDomainMapping[brandName];
      if (mappedDomain) {
        return `https://www.google.com/s2/favicons?domain=${mappedDomain}&sz=64`;
      }
      
      return `https://www.google.com/s2/favicons?domain=${brandName.toLowerCase().replace(/\s+/g, '')}.com&sz=64`;
    };
    
    return {
      id: item.brand,
      brand: displayName,
      logo: getLogoUrl(item.brand, item.logo),
      visibility: `${Math.round(item.visibility)}%`,
      visibilityValue: item.visibility,
      sentiment: item.sentiment || Math.round(50 + Math.random() * 30),
      position: `#${finalPosition}`,
      positionValue: finalPosition,
      originalPosition: item.position
    };
  });
};

/**
 * Get ranking data from Redux store
 * @param state Redux state
 * @param promptId Optional prompt ID for prompt-specific data
 * @returns Ranking data
 */
export const getRankingData = (state: any, promptId?: string) => {
  if (promptId && state.ranking.promptId === promptId) {
    return state.ranking.promptRankingData;
  }
  return state.ranking.rankingData;
};

/**
 * Check if ranking data is fresh (less than 5 minutes old)
 * @param lastUpdated Timestamp of last update
 * @returns Whether data is fresh
 */
export const isRankingDataFresh = (lastUpdated: number | null): boolean => {
  if (!lastUpdated) return false;
  return Date.now() - lastUpdated < 5 * 60 * 1000; // 5 minutes
};
