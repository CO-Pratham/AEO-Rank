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

    try {
      const token = localStorage.getItem("accessToken");

      // Call API to remove competitor
      const response = await fetch(
        `https://aeotest-production.up.railway.app/user/competitor/${competitorToRemove.name}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove competitor from server");
      }

      console.log("Competitor removed successfully, re-fetching data...");

      // Re-fetch all competitors from server to get fresh data
      await fetchExistingCompetitorsData();

      // Force a page reload event to update dashboard and other pages
      window.dispatchEvent(new Event('competitor-updated'));

      // Close dialog
      setRemoveDialogOpen(false);
      setCompetitorToRemove(null);

      console.log("Competitor removed:", competitorToRemove.name);
    } catch (error) {
      console.error("Error removing competitor:", error);
      alert("Failed to remove competitor. Please try again.");
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

      // Only fetch from /analyse/brand/get
      const response = await fetch(
        "https://aeotest-production.up.railway.app/analyse/brand/get",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Analysis Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch competitors: ${response.status}`);
      }

      const data = await response.json();
      console.log("Competitors API Response:", data);

      // Transform the API response to match our interface
      if (Array.isArray(data) && data.length > 0) {
        const transformedData = data.map((item: any, index: number) => {
          // Extract clean domain from provided data
          let domain = item.domain || item.website || "";
          
          // Clean domain: remove protocol, www, and trailing slashes
          if (domain) {
            domain = domain
              .replace(/^https?:\/\//i, '')
              .replace(/^www\./i, '')
              .replace(/\/.*$/, '');
          }
          
          // If no domain provided, construct from brand name
          if (!domain) {
            domain = (item.brand_name || item.brand || item.name || `competitor${index + 1}`)
              .toLowerCase()
              .replace(/\s+/g, "") + ".com";
          }
          
          return {
            id: index + 1,
            name:
              item.brand_name ||
              item.brand ||
              item.name ||
              `Competitor ${index + 1}`,
            logo: getDomainLogo(domain, item.logo),
            website: domain.startsWith('http') ? domain : `https://${domain}`,
            isYourBrand: false,
          };
        });
        setExistingCompetitors(transformedData);

        // Store in Redux as well with actual visibility/sentiment/position from API
        const reduxCompetitors = data.map((item: any, index: number) => ({
          id: index + 1,
          name: item.brand_name || item.brand || item.name || `Competitor ${index + 1}`,
          domain: item.domain || item.website || "",
          logo: transformedData[index]?.logo || "",
          visibility: `${Math.round(Number(item.avg_visibility) || 0)}%`,
          sentiment: Number.isFinite(Number(item.avg_sentiment))
            ? Math.round(Number(item.avg_sentiment))
            : undefined,
          position: `#${index + 1}`,
          addedAt: new Date().toISOString(),
        }));
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

  // Fetch existing competitors from /analyse/brand/get API on mount
  useEffect(() => {
    fetchExistingCompetitorsData();
  }, [dispatch]);

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
                  .replace(/^https?:\/\//i, '')
                  .replace(/^www\./i, '')
                  .replace(/\/.*$/, '');
              }
              
              // If no domain provided, construct from brand name
              if (!domain) {
                domain = (item.brand_name || item.name || `competitor${index + 1}`)
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
                mentions: item.mentions || Math.floor(Math.random() * 1000) + 100,
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
          const domain = (comp.domain || comp.name.toLowerCase().replace(/\s+/g, "")) + ".com";
          
          return {
            id: comp.id,
            name: comp.name,
            logo: getDomainLogo(domain, comp.logo),
            website: domain,
            isYourBrand: false,
          };
        });

  const handleTrack = async (competitor: SuggestedCompetitor) => {
    try {
      const token = localStorage.getItem("accessToken");

      console.log("Tracking competitor:", competitor);

      // Clean domain for API request
      let cleanDomain = competitor.domain || "";
      if (cleanDomain) {
        cleanDomain = cleanDomain
          .replace(/^https?:\/\//i, '')
          .replace(/^www\./i, '')
          .replace(/\/.*$/, '');
      } else {
        cleanDomain = competitor.name.toLowerCase().replace(/\s+/g, "") + ".com";
      }

      // Call API to add competitor
      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/competitor",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              brand_name: competitor.name,
              domain: cleanDomain,
              country: brand?.location || brand?.country || "US",
            },
          ]),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to add competitor:", errorData);
        throw new Error(
          errorData.message || "Failed to add competitor to server"
        );
      }

      console.log("Competitor added successfully, re-fetching data...");

      // Re-fetch all competitors from server to get fresh data with visibility/sentiment/position
      await fetchExistingCompetitorsData();

      // Remove from suggested list
      dispatch(removeSuggestedCompetitor(competitor.id));
    } catch (error) {
      console.error("Error adding competitor:", error);
      alert("Failed to add competitor. Please try again.");
    }
  };

  const handleReject = (competitorId: number) => {
    dispatch(removeSuggestedCompetitor(competitorId));
  };

  const handleAddCompetitor = async () => {
    if (!newCompetitorName.trim()) {
      alert("Please enter a competitor name");
      return;
    }

    if (!newCompetitorDomain.trim()) {
      alert("Please enter a competitor domain");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      // Clean domain for API request and logo fetching
      let cleanDomain = newCompetitorDomain.trim();
      cleanDomain = cleanDomain
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/.*$/, '');

      // Call API to add competitor
      const response = await fetch(
        "https://aeotest-production.up.railway.app/user/competitor",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              brand_name: newCompetitorName.trim(),
              domain: cleanDomain,
              country:
                newCompetitorCountry.trim() ||
                brand?.location ||
                brand?.country ||
                "US",
            },
          ]),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add competitor to server");
      }

      console.log("Competitor added successfully, re-fetching data...");

      // Re-fetch all competitors from server to get fresh data with visibility/sentiment/position
      await fetchExistingCompetitorsData();

      setNewCompetitorName("");
      setNewCompetitorDomain("");
      setNewCompetitorCountry("");
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding competitor:", error);
      alert("Failed to add competitor. Please try again.");
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
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-border/30 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                      {competitor.logo ? (
                        <img
                          src={competitor.logo}
                          alt={competitor.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-2xl font-bold text-gray-800"
                        style={{ display: competitor.logo ? 'none' : 'flex' }}
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
                          {competitor.domain}
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
            {yourCompetitors.map((competitor) => (
              <Card
                key={competitor.id}
                className="border border-border bg-card hover:bg-accent/5 transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden"
              >
                {competitor.isYourBrand && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center text-white font-bold text-lg">
                        {competitor.logo ? (
                          <img
                            src={competitor.logo}
                            alt={competitor.name}
                            className="w-8 h-8 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-lg font-bold"
                          style={{ display: competitor.logo ? 'none' : 'flex' }}
                        >
                          {generateInitials(competitor.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base text-foreground">
                            {competitor.name}
                          </h3>
                          {competitor.isYourBrand && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-[10px] px-1.5 py-0 font-semibold"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {competitor.website}
                        </p>
                      </div>
                    </div>
                    {!competitor.isYourBrand && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-accent rounded-lg"
                          >
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Competitor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl p-0 gap-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            <DialogHeader className="relative space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Add New Competitor
                  </DialogTitle>
                  <p className="text-sm text-blue-100 mt-1">
                    Track and analyze your competitor's performance
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
            <div className="space-y-6">
              {/* Competitor Name Field */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Competitor Name
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g., Acme Corporation"
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    className="h-12 pl-11 pr-4 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                  />
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pl-1">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Enter the official name of the competitor brand
                </p>
              </div>

              {/* Website Domain Field */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="domain"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-green-600" />
                  Website Domain
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="domain"
                    placeholder="e.g., example.com"
                    value={newCompetitorDomain}
                    onChange={(e) => setNewCompetitorDomain(e.target.value)}
                    className="h-12 pl-11 pr-4 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 rounded-xl"
                  />
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pl-1">
                  <span className="w-1 h-1 rounded-full bg-green-500"></span>
                  Enter the domain without http:// or www. prefix
                </p>
              </div>

              {/* Country Field */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="country"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Country
                  <span className="text-xs font-normal text-gray-500">
                    (Optional)
                  </span>
                </Label>
                <Select value={newCompetitorCountry} onValueChange={setNewCompetitorCountry}>
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 rounded-xl">
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
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pl-1">
                  <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                  Select the country where the competitor is based
                </p>
              </div>
            </div>
          </div>

          {/* Footer with gradient border */}
          <div className="px-8 py-6 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false);
                  setNewCompetitorName("");
                  setNewCompetitorDomain("");
                  setNewCompetitorCountry("");
                }}
                className="h-11 px-6 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompetitor}
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 font-semibold"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                {selectedCompetitor?.logo ? (
                  <img
                    src={selectedCompetitor.logo}
                    alt={selectedCompetitor.name}
                    className="w-12 h-12 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <span 
                  className="text-2xl font-bold"
                  style={{ display: selectedCompetitor?.logo ? 'none' : 'flex' }}
                >
                  {selectedCompetitor && generateInitials(selectedCompetitor.name)}
                </span>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {selectedCompetitor?.name}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {selectedCompetitor?.isYourBrand ? (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 border-0 font-semibold"
                    >
                      Your Brand
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-border/50 font-semibold bg-blue-50 text-blue-700 border-blue-200">
                      Competitor
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Website */}
            <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-xl p-4 border border-blue-100">
              <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <a 
                href={`https://${selectedCompetitor?.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 break-all"
              >
                {selectedCompetitor?.website}
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
            
            {/* Tracking Status */}
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-xl p-4 border border-green-100">
              <label className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" />
                Tracking Status
              </label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm text-foreground font-semibold">
                  Active Monitoring
                </p>
              </div>
            </div>
            
            {/* Visibility */}
            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-xl p-4 border border-purple-100">
              <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" />
                Visibility
              </label>
              <p className="text-2xl font-bold text-purple-600">
                {selectedCompetitor?.isYourBrand ? "N/A" : "0%"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Across all models
              </p>
            </div>
            
            {/* Date Added */}
            <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 rounded-xl p-4 border border-orange-100">
              <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" />
                Date Added
              </label>
              <p className="text-sm text-foreground font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recently added
              </p>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border/50 mt-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              About
            </label>
            <p className="text-sm text-foreground">
              This competitor is being tracked across all AI models and platforms. 
              Monitor their visibility and performance in real-time.
            </p>
          </div>
          
          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setViewDetailsDialogOpen(false)}
              className="h-10 px-6 rounded-lg"
            >
              Close
            </Button>
            <Button
              className="h-10 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => {
                setViewDetailsDialogOpen(false);
                navigate('/dashboard/ranking');
              }}
            >
              View Rankings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetitorsPage;
