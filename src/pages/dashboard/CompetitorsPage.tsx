import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Swords,
  Eye,
  Trash2,
  AlertTriangle,
  Building2,
  Globe,
  MapPin,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBrand } from "@/context/BrandContext";
import { RootState, AppDispatch } from "@/store";
import {
  setCompetitors,
  addCompetitor,
  removeCompetitor,
  setSuggestedCompetitors,
  removeSuggestedCompetitor,
  addCompetitorFromSuggested,
  setLoading,
} from "@/store/slices/competitorsSlice";
import { getDomainLogo, generateInitials } from "@/utils/logoUtils";
import { useToast } from "@/hooks/use-toast";

interface SuggestedCompetitor {
  id: number;
  name: string;
  logo: string;
  domain?: string;
  mentions: number;
}

interface YourCompetitor {
  id: number;
  name: string;
  logo: string;
  website: string;
  isYourBrand?: boolean;
}

const CompetitorsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { competitors, suggestedCompetitors, loading } = useSelector(
    (state: RootState) => state.competitors
  );
  const { brand } = useBrand();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [newCompetitorCountry, setNewCompetitorCountry] = useState("");
  const [existingCompetitors, setExistingCompetitors] = useState<
    YourCompetitor[]
  >([]);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [competitorToRemove, setCompetitorToRemove] =
    useState<YourCompetitor | null>(null);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<YourCompetitor | null>(null);

  // Handle view details
  const handleViewDetails = (competitor: YourCompetitor) => {
    setSelectedCompetitor(competitor);
    setViewDetailsDialogOpen(true);
  };

  // Handle remove competitor
  const handleRemoveCompetitor = (competitor: YourCompetitor) => {
    setCompetitorToRemove(competitor);
    setRemoveDialogOpen(true);
  };

  // Confirm remove competitor
  const confirmRemoveCompetitor = async () => {
    if (!competitorToRemove) return;

    const competitorName = competitorToRemove.name;
    const competitorId = competitorToRemove.id;

    try {
      const token = localStorage.getItem("accessToken");

      // Optimistically remove from UI first for instant feedback
      setExistingCompetitors((prev) => 
        prev.filter((comp) => comp.id !== competitorId)
      );
      dispatch(
        setCompetitors(
          competitors.filter((comp) => comp.id !== competitorId)
        )
      );

      // Close dialog immediately
      setRemoveDialogOpen(false);
      setCompetitorToRemove(null);

      // Get domain from website - clean it to just domain without protocol
      let domain = competitorToRemove.website;
      
      // Remove protocol (http:// or https://) and www.
      if (domain) {
        domain = domain
          .replace(/^https?:\/\//i, "")  // Remove http:// or https://
          .replace(/^www\./i, "")         // Remove www.
          .replace(/\/.*$/, "");          // Remove any path after domain
      }

      // Call API to remove competitor using clean domain (e.g., bmw.com)
      const requestBody = {
        domain: domain,
      };
      
      console.log("🗑️ Delete request URL:", `https://aeotest-production.up.railway.app/user/competitor/delete`);
      console.log("🗑️ Delete request method:", "DELETE");
      console.log("🗑️ Delete request body:", JSON.stringify(requestBody, null, 2));

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

      console.log("✅ Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Delete error response:", errorText);
        throw new Error("Failed to remove competitor from server");
      }

      const responseData = await response.json();
      console.log("✅ Delete success response:", responseData);
      console.log("✅ Competitor removed successfully from backend:", competitorName);

      // Force a page reload event to update dashboard and other pages
      console.log("Dispatching competitor-updated event...");
      window.dispatchEvent(new Event("competitor-updated"));

      // Show success toast
      toast({
        title: "Competitor removed",
        description: `${competitorName} has been removed successfully.`,
      });

    } catch (error) {
      console.error("Error removing competitor:", error);
      
      // Show error toast
      toast({
        title: "Failed to remove competitor",
        description: "Please try again.",
        variant: "destructive",
      });
      
      // Re-fetch to restore the data if delete failed
      await fetchExistingCompetitorsData();
    }
  };

  // Extract fetchExistingCompetitors as a callable function
  const fetchExistingCompetitorsData = async () => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.log("No access token found for existing competitors");
        setExistingCompetitors([]);
        return;
      }

      // Fetch from /user/getcompetitor to get all existing competitors
      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/getcompetitor",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User Competitors Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch competitors: ${response.status}`);
      }

      const data = await response.json();
      console.log("User Competitors API Response:", data);

      // Handle different response formats
      let competitorsArray: any[] = [];
      if (Array.isArray(data)) {
        competitorsArray = data;
      } else if (data && data.competitors && Array.isArray(data.competitors)) {
        competitorsArray = data.competitors;
      } else if (data && data.data && Array.isArray(data.data)) {
        competitorsArray = data.data;
      }

      console.log("Competitors Array:", competitorsArray);
      console.log("Total competitors fetched:", competitorsArray.length);
      if (competitorsArray.length > 0) {
        console.log("First competitor item:", competitorsArray[0]);
        console.log("All fields:", Object.keys(competitorsArray[0]));
        console.log("Stringified first item:", JSON.stringify(competitorsArray[0], null, 2));
      }

      // Transform the API response to match our interface
      if (competitorsArray.length > 0) {
        const transformedData = competitorsArray.map((item: any, index: number) => {
          // Extract brand name from ALL possible fields in the object
          let brandName = '';
          
          // Try all common field name variations
          const possibleNameFields = [
            'brand_name', 'brandName', 'brand', 'name', 
            'competitor_name', 'competitorName', 'competitor',
            'Brand_Name', 'BrandName', 'Brand', 'Name',
            'Competitor_Name', 'CompetitorName', 'Competitor'
          ];
          
          for (const field of possibleNameFields) {
            if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
              brandName = item[field].trim();
              break;
            }
          }
          
          // If still no brand name, use the first string value in the object
          if (!brandName) {
            for (const [key, value] of Object.entries(item)) {
              if (typeof value === 'string' && value.trim() && !key.toLowerCase().includes('id')) {
                brandName = value.trim();
                console.log(`Using field '${key}' as brand name:`, value);
                break;
              }
            }
          }
          
          // Last resort: use fallback
          if (!brandName) {
            brandName = `Competitor ${index + 1}`;
          }

          console.log(`Item ${index}:`, {
            allFields: item,
            extractedName: brandName
          });

          // Extract clean domain from provided data
          let domain = item.domain || item.website || "";

          // Clean domain: remove protocol, www, and trailing slashes
          if (domain) {
            domain = domain
              .replace(/^https?:\/\//i, "")
              .replace(/^www\./i, "")
              .replace(/\/.*$/, "");
          }

          // If no domain provided, construct from brand name
          if (!domain) {
            domain = brandName.toLowerCase().replace(/\s+/g, "") + ".com";
          }

          return {
            id: index + 1,
            name: brandName,
            logo: getDomainLogo(domain, item.logo),
            website: domain.startsWith("http") ? domain : `https://${domain}`,
            isYourBrand: false,
          };
        });
        setExistingCompetitors(transformedData);

        // Store in Redux as well with actual visibility/sentiment/position from API
        const reduxCompetitors = competitorsArray.map((item: any, index: number) => {
          // Use the same name extraction as transformedData
          const correspondingItem = transformedData[index];
          const brandName = correspondingItem ? correspondingItem.name : `Competitor ${index + 1}`;
          
          return {
          id: index + 1,
          name: brandName,
          domain: item.domain || item.website || "",
          logo: transformedData[index]?.logo || "",
          visibility: `${Math.round(Number(item.avg_visibility) || 0)}%`,
          sentiment: Number.isFinite(Number(item.avg_sentiment))
            ? Math.round(Number(item.avg_sentiment))
            : undefined,
          position: `#${index + 1}`,
          addedAt: new Date().toISOString(),
        };
        });
        dispatch(setCompetitors(reduxCompetitors));
      } else {
        setExistingCompetitors([]);
        dispatch(setCompetitors([]));
      }
    } catch (err) {
      console.error("Error fetching existing competitors:", err);
      setExistingCompetitors([]);
      dispatch(setCompetitors([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch existing competitors from /user/competitor API on mount only
  useEffect(() => {
    fetchExistingCompetitorsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch suggested competitors from /competitor/generate API
  useEffect(() => {
    const fetchSuggestedCompetitors = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token || !brand) {
          console.log(
            "No access token or brand data found for suggested competitors"
          );
          setSuggestedCompetitors([]);
          return;
        }

        // Use real brand data from context
        const response = await fetch(
          "https://aeotest-production.up.railway.app/competitor/generate",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              brand_name: brand.name || brand.brand_name || "Sample Brand",
              domain: brand.website || brand.domain || "example.com",
              country: brand.location || brand.country || "US",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch suggested competitors: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Suggested Competitors API Response:", data);

        // Transform the API response to match our interface
        const transformedData = Array.isArray(data)
          ? data.map((item: any, index: number) => {
              // Extract clean domain from provided data
              let domain = item.domain || item.website || "";

              // Clean domain: remove protocol, www, and trailing slashes
              if (domain) {
                domain = domain
                  .replace(/^https?:\/\//i, "")
                  .replace(/^www\./i, "")
                  .replace(/\/.*$/, "");
              }

              // If no domain provided, construct from brand name
              if (!domain) {
                domain =
                  (item.brand_name || item.name || `competitor${index + 1}`)
                    .toLowerCase()
                    .replace(/\s+/g, "") + ".com";
              }

              return {
                id: Date.now() + index,
                name:
                  item.brand_name ||
                  item.name ||
                  item.competitor ||
                  `Competitor ${index + 1}`,
                logo: getDomainLogo(domain, item.logo),
                mentions:
                  item.mentions || Math.floor(Math.random() * 1000) + 100,
                domain: domain,
                visibility: "0%",
                sentiment: "—",
                position: "—",
              };
            })
          : [];

        dispatch(setSuggestedCompetitors(transformedData));
      } catch (err) {
        console.error("Error fetching suggested competitors:", err);
        dispatch(setSuggestedCompetitors([]));
      }
    };

    // Only fetch suggested competitors if we have brand data
    if (brand) {
      fetchSuggestedCompetitors();
    }
  }, [brand, dispatch]);

  // Use existing competitors from API instead of context
  const yourCompetitors: YourCompetitor[] =
    existingCompetitors.length > 0
      ? existingCompetitors
      : competitors.map((comp) => {
          const domain =
            (comp.domain || comp.name.toLowerCase().replace(/\s+/g, "")) +
            ".com";

          return {
            id: comp.id,
            name: comp.name,
            logo: getDomainLogo(domain, comp.logo),
            website: domain,
            isYourBrand: false,
          };
        });

  // Debug: Log competitors data
  console.log("Your Competitors to display:", yourCompetitors);
  console.log("Existing Competitors:", existingCompetitors);
  console.log("Redux Competitors:", competitors);

  const handleTrack = async (competitor: SuggestedCompetitor) => {
    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("accessToken");

      console.log("Tracking competitor:", competitor);

      // Clean domain for API request
      let cleanDomain = competitor.domain || "";
      if (cleanDomain) {
        cleanDomain = cleanDomain
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .replace(/\/.*$/, "");
      } else {
        cleanDomain =
          competitor.name.toLowerCase().replace(/\s+/g, "") + ".com";
      }

      // Call API to add competitor
      const requestBody = [
        {
          brand_name: competitor.name,
          domain: cleanDomain,
          country: brand?.location || brand?.country || "US",
        },
      ];

      console.log("➕ Add competitor (suggested) request URL:", "https://aeotest-production.up.railway.app/user/competitor");
      console.log("➕ Add competitor (suggested) request method:", "POST");
      console.log("➕ Add competitor (suggested) request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/competitor",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("✅ Add competitor (suggested) response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Failed to add competitor:", errorData);
        throw new Error(
          errorData.message || "Failed to add competitor to server"
        );
      }

      const data = await response.json();
      console.log("✅ Add competitor (suggested) success response:", data);
      console.log("✅ Competitor added successfully:", competitor.name);

      // Remove from suggested list
      dispatch(removeSuggestedCompetitor(competitor.id));

      // Add to existing competitors optimistically
      const newCompetitor: YourCompetitor = {
        id: Date.now(),
        name: competitor.name,
        logo: competitor.logo,
        website: cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`,
        isYourBrand: false,
      };
      setExistingCompetitors((prev) => {
        const updated = [...prev, newCompetitor];
        console.log("Updated competitors after add:", updated);
        return updated;
      });

      // Dispatch a custom event to notify other components
      console.log("Dispatching competitor-updated event...");
      window.dispatchEvent(new Event("competitor-updated"));

      // Show success toast
      toast({
        title: "Competitor added",
        description: `${competitor.name} is now being tracked.`,
      });
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast({
        title: "Failed to add competitor",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleReject = (competitorId: number) => {
    dispatch(removeSuggestedCompetitor(competitorId));
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitorName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a competitor name.",
        variant: "destructive",
      });
      return;
    }

    if (!newCompetitorDomain.trim()) {
      toast({
        title: "Domain required",
        description: "Please enter a competitor domain.",
        variant: "destructive",
      });
      return;
    }

    try {
      dispatch(setLoading(true));
      const token = localStorage.getItem("accessToken");

      // Clean domain for API request and logo fetching
      let cleanDomain = newCompetitorDomain.trim();
      cleanDomain = cleanDomain
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/\/.*$/, "");

      // Call API to add competitor
      const requestBody = [
        {
          brand_name: newCompetitorName.trim(),
          domain: cleanDomain,
          country:
            newCompetitorCountry.trim() ||
            brand?.location ||
            brand?.country ||
            "US",
        },
      ];

      console.log("➕ Add competitor (manual) request URL:", "https://aeotest-production.up.railway.app/user/competitor");
      console.log("➕ Add competitor (manual) request method:", "POST");
      console.log("➕ Add competitor (manual) request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/competitor",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("✅ Add competitor (manual) response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Failed to add competitor:", errorData);
        throw new Error(
          errorData.message || "Failed to add competitor to server"
        );
      }

      const data = await response.json();
      console.log("✅ Add competitor (manual) success response:", data);
      
      // Store the name for success message
      const addedName = newCompetitorName.trim();
      console.log("✅ Competitor added successfully:", addedName);

      // Add to existing competitors optimistically
      const newCompetitor: YourCompetitor = {
        id: Date.now(),
        name: addedName,
        logo: getDomainLogo(cleanDomain, ""),
        website: cleanDomain.startsWith("http") ? cleanDomain : `https://${cleanDomain}`,
        isYourBrand: false,
      };
      setExistingCompetitors((prev) => {
        const updated = [...prev, newCompetitor];
        console.log("Updated competitors after add:", updated);
        return updated;
      });

      // Clear form fields and close dialog
      setNewCompetitorName("");
      setNewCompetitorDomain("");
      setNewCompetitorCountry("");
      setAddDialogOpen(false);

      // Dispatch a custom event to notify other components
      console.log("Dispatching competitor-updated event...");
      window.dispatchEvent(new Event("competitor-updated"));

      // Show success toast
      toast({
        title: "Competitor added",
        description: `${addedName} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast({
        title: "Failed to add competitor",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (loading && competitors.length === 0) {
    return <LoadingScreen text="Loading competitors data..." />;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Swords className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">
            Competitors
          </h1>
        </div>
        <Button
          className="bg-black hover:bg-black/90 text-white h-9 px-4 rounded-md"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {/* Suggested Competitors */}
      <div className="space-y-4">
        <h2 className="text-base font-medium text-foreground">
          Suggested Competitors
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                    </div>
                    <div className="flex gap-2 w-full pt-2">
                      <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1 h-9 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suggestedCompetitors.length === 0 ? (
          <Card className="border border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No suggested competitors available. Try refreshing or check your
                brand settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedCompetitors.map((competitor) => (
              <Card
                key={competitor.id}
                className="border border-border/50 bg-gradient-to-br from-rose-50/40 to-pink-50/30 hover:from-rose-50/60 hover:to-pink-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-border/20 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow overflow-hidden">
                      {competitor.logo ? (
                        <img
                          src={competitor.logo}
                          alt={competitor.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget
                              .nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="text-2xl font-bold text-gray-600"
                        style={{ display: competitor.logo ? "none" : "flex" }}
                      >
                        {generateInitials(competitor.name)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-base text-foreground leading-tight">
                        {competitor.name}
                      </h3>
                      {competitor.domain && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate max-w-full px-2">
                          www.{competitor.domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground font-medium">
                        {(competitor as any).mentions || 0} Mentions
                      </p>
                    </div>
                    <div className="flex gap-2 w-full pt-2">
                      <Button
                        className="flex-1 bg-black hover:bg-black/90 text-white h-9 text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
                        onClick={() => handleTrack(competitor as any)}
                      >
                        Track
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 h-9 text-sm font-medium hover:bg-white/90 rounded-lg border border-border/30 hover:border-border/50 transition-all"
                        onClick={() => handleReject(competitor.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Your Competitors */}
      <div className="space-y-4">
        <h2 className="text-base font-medium text-foreground">
          Your Competitors
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : yourCompetitors.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No competitors found. Add competitors to start tracking them.
              </p>
              <Button
                className="mt-4 bg-black hover:bg-black/90 text-white"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Competitor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {yourCompetitors.map((competitor) => {
              console.log("Rendering competitor card:", competitor);
              return (
              <Card
                key={competitor.id}
                className="border border-border bg-card hover:bg-accent/5 transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden"
              >
                {competitor.isYourBrand && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl border border-border/20 bg-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {competitor.logo ? (
                          <img
                            src={competitor.logo}
                            alt={competitor.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              console.log("Logo failed to load for:", competitor.name);
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget
                                .nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <span
                          className="text-lg font-bold text-gray-600"
                          style={{ display: competitor.logo ? "none" : "flex" }}
                        >
                          {generateInitials(competitor.name || "C")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base text-foreground">
                            {competitor.name || "Unknown Competitor"}
                          </h3>
                          {competitor.isYourBrand && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px] px-1.5 py-0 font-semibold flex-shrink-0"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {competitor.website 
                            ? `www.${competitor.website.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}`
                            : "No website"
                          }
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent rounded-lg flex-shrink-0"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {!competitor.isYourBrand && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(competitor)}
                              className="text-sm cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 text-sm cursor-pointer"
                              onClick={() => handleRemoveCompetitor(competitor)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </>
                        )}
                        {competitor.isYourBrand && (
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(competitor)}
                            className="text-sm cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>

      {/* Add Competitor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
    <DialogContent className="max-w-lg p-0 gap-0 bg-white">
      {/* Header */}
      <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
        <DialogTitle className="text-xl font-semibold text-black">
          Add New Competitor
        </DialogTitle>
        <p className="text-sm text-gray-600 mt-1">
          Track and analyze your competitor's performance
        </p>
      </DialogHeader>

      {/* Form Content */}
      <div className="px-6 py-6 bg-white">
        <div className="space-y-6">
          {/* Competitor Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-black">
              Competitor Name
              <span className="text-red-600 ml-1">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Acme Corporation"
              value={newCompetitorName}
              onChange={(e) => setNewCompetitorName(e.target.value)}
              className="h-9 border-gray-300 focus:border-black focus:ring-black"
            />
            <p className="text-xs text-gray-600">
              Enter the official name of the competitor brand
            </p>
          </div>

          {/* Website Domain Field */}
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-semibold text-black">
              Website Domain
              <span className="text-red-600 ml-1">*</span>
            </Label>
            <Input
              id="domain"
              placeholder="e.g., example.com"
              value={newCompetitorDomain}
              onChange={(e) => {
                // Auto-clean the domain - remove http://, https://, and www.
                let cleanValue = e.target.value.trim();
                cleanValue = cleanValue.replace(/^https?:\/\//i, '');
                cleanValue = cleanValue.replace(/^www\./i, '');
                cleanValue = cleanValue.split('/')[0]; // Remove any path after domain
                setNewCompetitorDomain(cleanValue);
              }}
              className="h-9 border-gray-300 focus:border-black focus:ring-black"
            />
            <p className="text-xs text-gray-600">
              Enter the domain without http:// or www. prefix
            </p>
          </div>

          {/* Country Field */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-semibold text-black">
              Country
              <span className="text-xs font-normal text-gray-600 ml-1">
                (Optional)
              </span>
            </Label>
                <Select
                  value={newCompetitorCountry}
                  onValueChange={setNewCompetitorCountry}
                >
                  <SelectTrigger id="country" className="h-9">
                    <SelectValue placeholder="Select country">
                      {newCompetitorCountry && (
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">
                            {newCompetitorCountry === "US" && "🇺🇸"}
                            {newCompetitorCountry === "IN" && "🇮🇳"}
                            {newCompetitorCountry === "GB" && "🇬🇧"}
                            {newCompetitorCountry === "CA" && "🇨🇦"}
                            {newCompetitorCountry === "AU" && "🇦🇺"}
                            {newCompetitorCountry === "DE" && "🇩🇪"}
                          </span>
                          <span>
                            {newCompetitorCountry === "US" && "United States"}
                            {newCompetitorCountry === "IN" && "India"}
                            {newCompetitorCountry === "GB" && "United Kingdom"}
                            {newCompetitorCountry === "CA" && "Canada"}
                            {newCompetitorCountry === "AU" && "Australia"}
                            {newCompetitorCountry === "DE" && "Germany"}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🇺🇸</span>
                        <span>United States</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IN">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🇮🇳</span>
                        <span>India</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="GB">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🇬🇧</span>
                        <span>United Kingdom</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CA">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🇨🇦</span>
                        <span>Canada</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="AU">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🇦🇺</span>
                        <span>Australia</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DE">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🇩🇪</span>
                        <span>Germany</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600">
                  Select the country where the competitor is based
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false);
                  setNewCompetitorName("");
                  setNewCompetitorDomain("");
                  setNewCompetitorCountry("");
                }}
                className="h-9 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompetitor}
                className="h-9 bg-black hover:bg-black/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Competitor
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Competitor Alert Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Remove Competitor
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{competitorToRemove?.name}</strong> from your competitors
              list? This action cannot be undone and will also remove them from
              your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveCompetitor}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDetailsDialogOpen}
        onOpenChange={setViewDetailsDialogOpen}
      >
        <DialogContent className="max-w-3xl p-0 gap-0 bg-white">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-5 border-b bg-white">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-gray-200">
                {selectedCompetitor?.logo ? (
                  <img
                    src={selectedCompetitor.logo}
                    alt={selectedCompetitor.name}
                    className="w-14 h-14 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget
                        .nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className="text-2xl font-bold"
                  style={{
                    display: selectedCompetitor?.logo ? "none" : "flex",
                  }}
                >
                  {selectedCompetitor &&
                    generateInitials(selectedCompetitor.name)}
                </span>
              </div>
              
              {/* Title & Badge */}
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-black mb-2">
                  {selectedCompetitor?.name}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {selectedCompetitor?.isYourBrand ? (
                    <Badge
                      variant="secondary"
                      className="bg-black text-white border-0 font-semibold px-3 py-1"
                    >
                      Your Brand
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-gray-300 font-semibold bg-gray-50 text-gray-700 px-3 py-1"
                    >
                      Competitor
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-6 bg-white">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Website */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-gray-700" />
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Website
                  </label>
                </div>
                <a
                  href={(() => {
                    const website = selectedCompetitor?.website || '';
                    const cleanDomain = website
                      .replace(/^https?:\/\//i, '')
                      .replace(/^www\./i, '');
                    return `https://www.${cleanDomain}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-black hover:underline flex items-center gap-2 break-all group"
                >
                  <span>
                    {(() => {
                      const website = selectedCompetitor?.website || '';
                      const cleanDomain = website
                        .replace(/^https?:\/\//i, '')
                        .replace(/^www\./i, '');
                      return `www.${cleanDomain}`;
                    })()}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-gray-500 group-hover:text-black" />
                </a>
              </div>

              {/* Tracking Status */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-gray-700" />
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-sm text-black font-medium">
                    Active Monitoring
                  </p>
                </div>
              </div>

              {/* Visibility */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-gray-700" />
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Visibility
                  </label>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">
                    {selectedCompetitor?.isYourBrand ? "N/A" : "0%"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Across all AI models
                  </p>
                </div>
              </div>

              {/* Date Added */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-gray-700" />
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Added On
                  </label>
                </div>
                <div>
                  <p className="text-sm text-black font-medium">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Recently added
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 block">
                About
              </label>
              <p className="text-sm text-gray-700 leading-relaxed">
                This competitor is being tracked across all AI models and platforms. 
                Monitor their visibility and performance in real-time to stay ahead of the competition.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setViewDetailsDialogOpen(false)}
              className="h-10 px-6 border-gray-300 hover:bg-gray-100"
            >
              Close
            </Button>
            <Button
              className="h-10 px-6 bg-black hover:bg-gray-800 text-white"
              onClick={() => {
                setViewDetailsDialogOpen(false);
                navigate("/dashboard/ranking");
              }}
            >
              View Rankings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetitorsPage;
