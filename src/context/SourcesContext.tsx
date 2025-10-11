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
      // ====== BACKEND ENDPOINT ======
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/sources');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      
      const data = await response.json();
      
      setSourcesTypeData(data.sourcesTypeData || []);
      setTopSourcesData(data.topSourcesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching sources:', err);
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