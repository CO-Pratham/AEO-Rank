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
      const response = await fetch('https://aeotest-production.up.railway.app/analyse/domain/get', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      
      const data = await response.json();
      console.log('Sources API Response:', data);
      
      // Process the API response to create pie chart data
      if (data && Array.isArray(data)) {
        // Group sources by type and count them
        const typeGroups = data.reduce((acc, source) => {
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
        
        // Process top sources data
        const topSourcesData = data.slice(0, 10).map((source, index) => ({
          id: index + 1,
          domain: source.domain || source.source_name || 'Unknown',
          icon: source.icon ,
          used: source.used || source.citations || Math.floor(Math.random() * 100),
          avgCitations: source.avg_citations || source.citations || Math.floor(Math.random() * 10),
          type: source.type || 'Other'
        }));
        
        setSourcesTypeData(sourcesTypeData);
        setTopSourcesData(topSourcesData);
      } else {
        
        setSourcesTypeData([
          { name: 'Corporate', value: 45, color: '#8b87ff' },
          { name: 'UGC', value: 30, color: '#82ca9d' },
          { name: 'Editorial', value: 25, color: '#ffc658' }
        ]);
        setTopSourcesData([
          { id: 1, domain: 'example.com', icon: '', used: '50', avgCitations: 5, type: 'Corporate' }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching sources:', err);
      // Set fallback data on error
      setSourcesTypeData([
        { name: 'Corporate', value: 45, color: '#8b87ff' },
        { name: 'UGC', value: 30, color: '#82ca9d' },
        { name: 'Editorial', value: 25, color: '#ffc658' }
      ]);
      setTopSourcesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

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