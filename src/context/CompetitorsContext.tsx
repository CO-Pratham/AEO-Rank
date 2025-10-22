import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Competitor {
  id: number;
  brand: string;
  logo: string;
  visibility: string;
  sentiment: number | string;
  position: string;
  domain?: string;
}

interface CompetitorsContextType {
  competitors: Competitor[];
  addCompetitor: (competitor: Omit<Competitor, "id">) => void;
  removeCompetitor: (id: number) => void;
  updateCompetitor: (id: number, updates: Partial<Competitor>) => void;
  loading: boolean;
  error: string | null;
  refetchCompetitors: () => void;
}

const CompetitorsContext = createContext<CompetitorsContextType | undefined>(
  undefined
);

export const useCompetitors = () => {
  const context = useContext(CompetitorsContext);
  if (!context) {
    throw new Error("useCompetitors must be used within a CompetitorsProvider");
  }
  return context;
};

interface CompetitorsProviderProps {
  children: ReactNode;
}

export const CompetitorsProvider: React.FC<CompetitorsProviderProps> = ({
  children,
}) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/getcompetitor",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch competitors");
      }

      const data = await response.json();

      // Handle different response formats
      let competitorsArray = [];
      if (Array.isArray(data)) {
        competitorsArray = data;
      } else if (data && data.competitors && Array.isArray(data.competitors)) {
        competitorsArray = data.competitors;
      } else if (data && data.data && Array.isArray(data.data)) {
        competitorsArray = data.data;
      }

      // Transform backend data to match frontend format
      const transformedData = competitorsArray.map((item: any, index: number) => {
        // Extract brand name from ALL possible fields
        let brandName = '';
        
        const possibleNameFields = [
          'brand_name', 'brandName', 'brand', 'name', 
          'competitor_name', 'competitorName', 'competitor',
          'Brand_Name', 'BrandName', 'Brand', 'Name'
        ];
        
        for (const field of possibleNameFields) {
          if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
            brandName = item[field].trim();
            break;
          }
        }
        
        // If still no brand name, use the first string value
        if (!brandName) {
          for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'string' && value.trim() && !key.toLowerCase().includes('id')) {
              brandName = value.trim();
              break;
            }
          }
        }
        
        if (!brandName) {
          brandName = `Competitor ${index + 1}`;
        }
        
        return {
          id: index + 1,
          brand: brandName,
          logo: item.logo || "",
          visibility: item.visibility || "0%",
          sentiment: item.sentiment || 0,
          position: item.position || `#${index + 1}`,
          domain: item.domain || item.website || "",
        };
      });

      setCompetitors(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching competitors:", err);
      // Set empty array on error
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated AND on a dashboard route
    const token = localStorage.getItem("accessToken");
    const isDashboardRoute = window.location.pathname.startsWith("/dashboard");

    if (token && isDashboardRoute) {
      fetchCompetitors();
    } else {
      setLoading(false);
    }
  }, []);

  const addCompetitor = async (newCompetitor: Omit<Competitor, "id">) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      // Use the correct backend endpoint
      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/competitor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify([
            {
              brand_name: newCompetitor.brand,
              // Add other required fields as needed
            },
          ]),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add competitor");
      }

      const addedCompetitor = await response.json();
      // Transform the response to match our format
      const transformedCompetitor = {
        id: Date.now(), // Generate a temporary ID
        brand: addedCompetitor.brand_name || newCompetitor.brand,
        logo: addedCompetitor.logo || newCompetitor.logo || "",
        visibility: addedCompetitor.visibility || "0%",
        sentiment: addedCompetitor.sentiment || 0,
        position: addedCompetitor.position || "#1",
      };

      setCompetitors((prev) => [...prev, transformedCompetitor]);
    } catch (err) {
      console.error("Error adding competitor:", err);
      throw err;
    }
  };

  const removeCompetitor = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      // Find the competitor to get its domain
      const competitorToRemove = competitors.find((c) => c.id === id);

      if (!competitorToRemove) {
        throw new Error("Competitor not found");
      }

      // Get domain - keep it in full URL format with https://
      let domain = competitorToRemove.domain || competitorToRemove.brand.toLowerCase().replace(/\s+/g, "") + ".com";
      
      // Ensure domain has https:// protocol
      if (domain && !domain.startsWith("http://") && !domain.startsWith("https://")) {
        domain = `https://${domain}`;
      }
      
      // Remove only the path part (everything after the domain)
      // Match: https://example.com/path -> https://example.com
      if (domain) {
        const urlMatch = domain.match(/^(https?:\/\/[^\/]+)/);
        if (urlMatch) {
          domain = urlMatch[1];
        }
      }

      // Use the correct backend endpoint for deletion
      const requestBody = {
        domain: domain,
      };
      
      console.log("Delete competitor request body:", requestBody);
      
      const response = await fetch(
        `https://aeotest-production.up.railway.app/user/competitor/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove competitor");
      }

      setCompetitors((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error removing competitor:", err);
      throw err;
    }
  };

  const updateCompetitor = async (id: number, updates: Partial<Competitor>) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      // Find the competitor to get its name
      const competitorToUpdate = competitors.find((c) => c.id === id);

      if (!competitorToUpdate) {
        throw new Error("Competitor not found");
      }

      // Use the correct backend endpoint for updating
      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/competitor",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            brand_name: competitorToUpdate.brand,
            ...updates,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update competitor");
      }

      const updatedCompetitor = await response.json();
      // Transform the response to match our format
      const transformedCompetitor = {
        id: id,
        brand:
          updatedCompetitor.brand_name ||
          updates.brand ||
          competitorToUpdate.brand,
        logo: updatedCompetitor.logo || updates.logo || competitorToUpdate.logo,
        visibility:
          updatedCompetitor.visibility ||
          updates.visibility ||
          competitorToUpdate.visibility,
        sentiment:
          updatedCompetitor.sentiment ||
          updates.sentiment ||
          competitorToUpdate.sentiment,
        position:
          updatedCompetitor.position ||
          updates.position ||
          competitorToUpdate.position,
      };

      setCompetitors((prev) =>
        prev.map((c) => (c.id === id ? transformedCompetitor : c))
      );
    } catch (err) {
      console.error("Error updating competitor:", err);
      throw err;
    }
  };

  return (
    <CompetitorsContext.Provider
      value={{
        competitors,
        addCompetitor,
        removeCompetitor,
        updateCompetitor,
        loading,
        error,
        refetchCompetitors: fetchCompetitors,
      }}
    >
      {children}
    </CompetitorsContext.Provider>
  );
};
