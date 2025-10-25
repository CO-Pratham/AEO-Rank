import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SourceTypeData {
  name: string;
  value: number;
  color: string;
}

interface TopSourceData {
  id: number;
  domain: string;
  icon: string;
  used: string;
  avgCitations: number;
  type: string;
}

interface SourcesContextType {
  sourcesTypeData: SourceTypeData[];
  topSourcesData: TopSourceData[];
  totalSources: number;
  updateSourcesData: (newData: SourceTypeData[]) => void;
  updateTopSourcesData: (newData: TopSourceData[]) => void;
  loading: boolean;
  error: string | null;
  refetchSources: () => void;
}

const SourcesContext = createContext<SourcesContextType | undefined>(undefined);

export const useSources = () => {
  const context = useContext(SourcesContext);
  if (!context) {
    throw new Error('useSources must be used within a SourcesProvider');
  }
  return context;
};

interface SourcesProviderProps {
  children: ReactNode;
}

export const SourcesProvider: React.FC<SourcesProviderProps> = ({ children }) => {
  const [sourcesTypeData, setSourcesTypeData] = useState<SourceTypeData[]>([]);
  const [topSourcesData, setTopSourcesData] = useState<TopSourceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('https://aeotest-production.up.railway.app/analyse/domain/get', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log('❌ Sources API failed with status:', response.status);
        throw new Error('Failed to fetch sources');
      }
      
      const data = await response.json();
      console.log('✅ Sources API Response (200):', data);
      
      // Process the API response to create pie chart data
      if (data && Array.isArray(data)) {
        // Process top sources data with deduplication first
        const uniqueDomains = new Map();
        data.forEach((source) => {
          const domain = source.domain || source.source_name || 'Unknown';
          if (!uniqueDomains.has(domain)) {
            uniqueDomains.set(domain, source);
          }
        });
        
        const topSourcesData = Array.from(uniqueDomains.values()).map((source, index) => {
          const domain = source.domain || source.source_name || 'Unknown';
          
          // Generate proper favicon URL for the domain
          const getFaviconUrl = (domain: string) => {
            if (source.icon && source.icon.startsWith('http')) {
              return source.icon;
            }
            // Use favicon service for domain logos
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
          };
          
          return {
            id: index + 1,
            domain: domain,
            icon: getFaviconUrl(domain),
            used: source.used || source.citations || Math.floor(Math.random() * 100),
            avgCitations: source.avg_citations || source.citations || Math.floor(Math.random() * 10),
            type: source.type || 'Other'
          };
        });
        
        // Group sources by type based on displayed domains only
        const typeGroups = topSourcesData.reduce((acc, source) => {
          const type = source.type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        const colors = ['#8b87ff', '#82ca9d', '#ffc658', '#ff7043', '#00e5a0', '#e91e63'];
        const sourcesTypeData = Object.entries(typeGroups).map(([type, count], index) => ({
          name: type,
          value: count as number,
          color: colors[index % colors.length]
        }));
        
        setSourcesTypeData(sourcesTypeData);
        setTopSourcesData(topSourcesData);
        console.log('✅ Sources data processed and set');
      } else {
        console.log('⚠️ No sources data in response, showing empty charts');
        setSourcesTypeData([]);
        setTopSourcesData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('❌ Error fetching sources:', err);
      // Show empty charts on error instead of mock data
      setSourcesTypeData([]);
      setTopSourcesData([]);
    } finally {
      console.log('⏹️ Sources loading stopped');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const path = window.location?.pathname || "";
        if (path.startsWith('/dashboard')) {
          console.log('🔄 SourcesContext: Fetching sources data...');
          await fetchSources();
        } else {
          console.log('⏹️ SourcesContext: Not on dashboard route, stopping loading');
          setLoading(false);
        }
      } catch (error) {
        console.log('⏹️ SourcesContext: Error in useEffect, stopping loading', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add a refetch function that can be called when needed
  const refetchSources = async () => {
    console.log('🔄 SourcesContext: Manual refetch triggered');
    await fetchSources();
  };

  const totalSources = sourcesTypeData.reduce((sum, item) => sum + item.value, 0);

  const updateSourcesData = (newData: SourceTypeData[]) => {
    setSourcesTypeData(newData);
  };

  const updateTopSourcesData = (newData: TopSourceData[]) => {
    setTopSourcesData(newData);
  };

  return (
    <SourcesContext.Provider value={{
      sourcesTypeData,
      topSourcesData,
      totalSources,
      updateSourcesData,
      updateTopSourcesData,
      loading,
      error,
      refetchSources: fetchSources
    }}>
      {children}
    </SourcesContext.Provider>
  );
};