import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Competitor {
  id: number;
  brand: string;
  logo: string;
  visibility: string;
  sentiment: number | string;
  position: string;
}

interface CompetitorsContextType {
  competitors: Competitor[];
  addCompetitor: (competitor: Omit<Competitor, 'id'>) => void;
  removeCompetitor: (id: number) => void;
  updateCompetitor: (id: number, updates: Partial<Competitor>) => void;
  loading: boolean;
  error: string | null;
  refetchCompetitors: () => void;
}

const CompetitorsContext = createContext<CompetitorsContextType | undefined>(undefined);

export const useCompetitors = () => {
  const context = useContext(CompetitorsContext);
  if (!context) {
    throw new Error('useCompetitors must be used within a CompetitorsProvider');
  }
  return context;
};

interface CompetitorsProviderProps {
  children: ReactNode;
}

export const CompetitorsProvider: React.FC<CompetitorsProviderProps> = ({ children }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('https://aeotest-production.up.railway.app/user/competitors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch competitors');
      }
      
      const data = await response.json();
      
      // Transform backend data to match frontend format
      const transformedData = data.map((item: any, index: number) => ({
        id: index + 1,
        brand: item.brand || item.name || item.competitor,
        logo: item.logo || '',
        visibility: item.visibility || '0%',
        sentiment: item.sentiment || 0,
        position: item.position || `#${index + 1}`
      }));
      
      setCompetitors(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching competitors:', err);
      // Set empty array on error
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const addCompetitor = async (newCompetitor: Omit<Competitor, 'id'>) => {
    try {
      // ====== BACKEND ENDPOINT ======
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompetitor),
      });

      if (!response.ok) {
        throw new Error('Failed to add competitor');
      }

      const addedCompetitor = await response.json();
      setCompetitors(prev => [...prev, addedCompetitor]);
    } catch (err) {
      console.error('Error adding competitor:', err);
      throw err;
    }
  };

  const removeCompetitor = async (id: number) => {
    try {
      // ====== BACKEND ENDPOINT ======
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove competitor');
      }

      setCompetitors(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error removing competitor:', err);
      throw err;
    }
  };

  const updateCompetitor = async (id: number, updates: Partial<Competitor>) => {
    try {
      // ====== BACKEND ENDPOINT ======
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update competitor');
      }

      const updatedCompetitor = await response.json();
      setCompetitors(prev => 
        prev.map(c => c.id === id ? updatedCompetitor : c)
      );
    } catch (err) {
      console.error('Error updating competitor:', err);
      throw err;
    }
  };

  return (
    <CompetitorsContext.Provider value={{
      competitors,
      addCompetitor,
      removeCompetitor,
      updateCompetitor,
      loading,
      error,
      refetchCompetitors: fetchCompetitors
    }}>
      {children}
    </CompetitorsContext.Provider>
  );
};