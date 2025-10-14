import React, { createContext, useContext, useState, useEffect } from "react";
import { apiCall } from "@/utils/api";

interface Brand {
  id?: string;
  name: string;
  website: string;
  location: string;
  brand_name?: string; // API response field
  domain?: string; // API response field
  country?: string; // API response field
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
      
      const response = await apiCall("/user/brand", {
        method: "POST"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch brand data");
      }
      
      const data = await response.json();
      console.log('Brand data from API:', data);
      
      // Transform API response to match our Brand interface
      if (data && (data.brand_name || data.name)) {
        const brandData: Brand = {
          id: data.id,
          name: data.brand_name || data.name,
          website: data.domain || data.website || '',
          location: data.country || data.location || '',
          brand_name: data.brand_name,
          domain: data.domain,
          country: data.country
        };
        setBrand(brandData);
      } else {
        setBrand(null);
      }
    } catch (err) {
      console.error('Error fetching brand data:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setBrand(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated AND on a dashboard route
    const token = localStorage.getItem('accessToken');
    const isDashboardRoute = window.location.pathname.startsWith('/dashboard');
    
    if (token && isDashboardRoute) {
      fetchBrand();
    } else {
      setLoading(false);
    }
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
