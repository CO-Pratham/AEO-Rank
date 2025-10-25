import React, { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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
  
  // Listen to Redux brand state changes
  const reduxBrand = useSelector((state: RootState) => state.user.brand);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try /me endpoint first (which has the brand data)
      const response = await apiCall("/me", {
        method: "GET"
      });

      if (!response.ok) {
        // If it's a 404 or other error, stop loading immediately
        console.log('❌ /me endpoint failed with status:', response.status);
        setLoading(false);
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      console.log('✅ User data from /me API (200):', data);

      // Transform API response to match our Brand interface
      if (data && data.brand_name) {
        const brandData: Brand = {
          id: data.id,
          name: data.brand_name,
          website: data.domain || '',
          location: data.country || '',
          brand_name: data.brand_name,
          domain: data.domain,
          country: data.country
        };
        setBrand(brandData);
        console.log('✅ Brand data set:', brandData);
      } else {
        console.log('⚠️ No brand_name found in /me response, setting null');
        setBrand(null);
      }
      // Explicitly stop loading after successful response
      setLoading(false);
    } catch (err) {
      console.error('Error fetching brand data from /me:', err);

      // Fallback to /user/brand endpoint
      try {
        console.log('🔄 Trying fallback /user/brand endpoint');
        const fallbackResponse = await apiCall("/user/brand", {
          method: "POST"
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('✅ Fallback brand data from /user/brand (200):', fallbackData);

          if (fallbackData && (fallbackData.brand_name || fallbackData.name)) {
            const brandData: Brand = {
              id: fallbackData.id,
              name: fallbackData.brand_name || fallbackData.name,
              website: fallbackData.domain || fallbackData.website || '',
              location: fallbackData.country || fallbackData.location || '',
              brand_name: fallbackData.brand_name,
              domain: fallbackData.domain,
              country: fallbackData.country
            };
            setBrand(brandData);
            console.log('✅ Fallback brand data set:', brandData);
          } else {
            console.log('⚠️ No brand data in fallback response');
            setBrand(null);
          }
        } else {
          console.log('❌ Fallback endpoint also failed');
          setError("Unable to load brand data");
          setBrand(null);
        }
      } catch (fallbackErr) {
        console.error('❌ Both endpoints failed:', fallbackErr);
        setError(err instanceof Error ? err.message : "An error occurred");
        setBrand(null);
      } finally {
        // Always stop loading, even on error
        setLoading(false);
      }
    }
  };

  // Sync Redux brand data with context state
  useEffect(() => {
    if (reduxBrand) {
      console.log('🔄 BrandContext: Syncing Redux brand data:', reduxBrand);
      const brandData: Brand = {
        id: reduxBrand.name, // Use name as ID if no ID available
        name: reduxBrand.name,
        website: reduxBrand.website,
        location: reduxBrand.location,
        brand_name: reduxBrand.name,
        domain: reduxBrand.website,
        country: reduxBrand.location
      };
      setBrand(brandData);
      setLoading(false);
      setError(null);
    }
  }, [reduxBrand]);

  useEffect(() => {
    // Only fetch if user is authenticated AND on a dashboard route AND no Redux brand data
    const token = localStorage.getItem('accessToken');
    const isDashboardRoute = window.location.pathname.startsWith('/dashboard');
    
    if (token && isDashboardRoute && !reduxBrand) {
      console.log('🔄 BrandContext: Fetching brand data from API...');
      fetchBrand();
    } else if (!token || !isDashboardRoute) {
      console.log('⏹️ BrandContext: Not on dashboard route or no token, stopping loading');
      setLoading(false);
    } else if (reduxBrand) {
      console.log('✅ BrandContext: Using Redux brand data, stopping loading');
      setLoading(false);
    }
  }, [reduxBrand]);

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
