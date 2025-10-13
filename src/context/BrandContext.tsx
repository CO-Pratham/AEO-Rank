import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCall } from "@/utils/api";

interface Brand {
  id: string;
  name: string;
  description: string;
  website: string;
  industry: string;
}

interface BrandContextType {
  brand: Brand | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall("/analyse/brand/get");
      
      if (!response.ok) {
        throw new Error("Failed to fetch brand data");
      }
      
      const data = await response.json();
      setBrand(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setBrand(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  const refetch = () => {
    fetchBrand();
  };

  return (
    <BrandContext.Provider value={{ brand, loading, error, refetch }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
};