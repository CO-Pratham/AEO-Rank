import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSources } from "@/context/SourcesContext";
import { useBrand } from "@/context/BrandContext";
import { RootState } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  ArrowRight,
  Home,
  Eye,
  Users,
  Globe,
  MessageSquare,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { getDomainLogo, generateInitials } from "@/utils/logoUtils";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { competitors, loading: competitorsLoading } = useSelector(
    (state: RootState) => state.competitors
  );
  const {
    sourcesTypeData,
    topSourcesData,
    totalSources,
    loading: sourcesLoading,
    error: sourcesError,
  } = useSources();
  const { brand, loading: brandLoading, error: brandError } = useBrand();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("all");
  const [hoveredPieData, setHoveredPieData] = useState<any>(null);
  const [visibilityData, setVisibilityData] = useState<any[]>([]);
  const [competitorVisibilityData, setCompetitorVisibilityData] = useState<
    any[]
  >([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchVisibilityData = async () => {
    try {
      console.log("🔄 Dashboard: Fetching visibility data...");
      const token = localStorage.getItem("accessToken");

      // Fetch from both endpoints to ensure we get all competitors
      const [analysisResponse, userCompetitorsResponse] = await Promise.all([
        fetch("https://aeotest-production.up.railway.app/analyse/brand/get", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("https://aeotest-production.up.railway.app/user/getcompetitor", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      console.log("✅ API calls completed");
      console.log("Analysis Response Status:", analysisResponse.status);
      console.log("User Competitors Response Status:", userCompetitorsResponse.status);

      const data = analysisResponse.ok ? await analysisResponse.json() : [];
      const userCompetitorsRaw = userCompetitorsResponse.ok
        ? await userCompetitorsResponse.json()
        : [];

      console.log("📊 Analysis API Response:", data);
      console.log("👥 User Competitors Raw Response:", userCompetitorsRaw);
      console.log("👥 Number of competitors from API:", Array.isArray(userCompetitorsRaw) ? userCompetitorsRaw.length : 'not an array');

      // Handle different response formats for user competitors
      let userCompetitors = [];
      if (Array.isArray(userCompetitorsRaw)) {
        userCompetitors = userCompetitorsRaw;
      } else if (userCompetitorsRaw && userCompetitorsRaw.competitors && Array.isArray(userCompetitorsRaw.competitors)) {
        userCompetitors = userCompetitorsRaw.competitors;
      } else if (userCompetitorsRaw && userCompetitorsRaw.data && Array.isArray(userCompetitorsRaw.data)) {
        userCompetitors = userCompetitorsRaw.data;
      }

      console.log("👥 Processed User Competitors Array:", userCompetitors);
      console.log("👥 Number of processed competitors:", userCompetitors.length);

      // Always process if we have either analysis data OR user competitors
      if (
        (Array.isArray(data) && data.length > 0) ||
        (Array.isArray(userCompetitors) && userCompetitors.length > 0)
      ) {
        console.log("✅ Processing competitor data...");
        console.log("Analysis data count:", data.length);
        console.log("User competitors count:", userCompetitors.length);
        // Create a set of unique dates from API, or use today if no data
        const uniqueDates =
          Array.isArray(data) && data.length > 0
            ? Array.from(
                new Set(
                  data.map(
                    (item: any) =>
                      item.date ||
                      item.timestamp ||
                      new Date().toISOString().split("T")[0]
                  )
                )
              ).sort()
            : [new Date().toISOString().split("T")[0]];

        // Get all unique brands from both analysis data AND user competitors
        const brandsFromAnalysis =
          Array.isArray(data) && data.length > 0
            ? data.map((item: any) => item.brand_name).filter(Boolean)
            : [];
        const brandsFromUserCompetitors =
          Array.isArray(userCompetitors) && userCompetitors.length > 0
            ? userCompetitors
                .map((comp: any) => comp.brand_name || comp.name || comp.brand)
                .filter(Boolean)
            : [];
        const allBrands = Array.from(
          new Set([...brandsFromAnalysis, ...brandsFromUserCompetitors])
        );

        console.log("Unique dates:", uniqueDates);
        console.log("All brands:", allBrands);

        // Build chart data: one object per date
        const chartData = uniqueDates.map((date) => {
          const dayData: Record<string, string | number> = { date };

          // Initialize all brands with 0 for this date
          allBrands.forEach((brand) => {
            dayData[brand] = 0;
          });

          // Then populate with actual data (if any)
          if (Array.isArray(data) && data.length > 0) {
            data.forEach((brand) => {
              const brandDate =
                brand.date ||
                brand.timestamp ||
                new Date().toISOString().split("T")[0];
              if (brandDate === date && brand.brand_name) {
                const value =
                  Number(brand.avg_visibility) || Number(brand.visibility) || 0;
                dayData[brand.brand_name] = Math.round(
                  Math.min(100, Math.max(0, value))
                );
              }
            });
          }
          return dayData;
        });

        setVisibilityData(chartData);

        // Build competitor data with proper ranking
        // First, create a map of analysis data by brand name
        const analysisMap = new Map();
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            const brandName = item.brand_name || item.brand || item.name;
            if (brandName) {
              analysisMap.set(brandName.toLowerCase(), item);
            }
          });
        }

        // Merge user competitors with analysis data
        const allCompetitorsForDisplay = new Map();

        // Add user competitors first (these are guaranteed to be tracked)
        if (Array.isArray(userCompetitors) && userCompetitors.length > 0) {
          userCompetitors.forEach((userComp: any) => {
            const brandName =
              userComp.brand_name || userComp.name || userComp.brand;
            if (brandName) {
              const analysisItem = analysisMap.get(brandName.toLowerCase());
              const domain =
                userComp.domain ||
                userComp.website ||
                `${brandName.toLowerCase().replace(/\s+/g, "")}.com`;

              allCompetitorsForDisplay.set(brandName.toLowerCase(), {
                brand_name: brandName,
                domain: domain,
                logo: userComp.logo || analysisItem?.logo,
                avg_visibility: analysisItem?.avg_visibility || 0,
                avg_sentiment: analysisItem?.avg_sentiment,
                avg_position: analysisItem?.avg_position,
                isUserCompetitor: true,
              });
            }
          });
        }

        // Add analysis data for competitors not in user list (if any)
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            const brandName = item.brand_name || item.brand || item.name;
            if (
              brandName &&
              !allCompetitorsForDisplay.has(brandName.toLowerCase())
            ) {
              allCompetitorsForDisplay.set(brandName.toLowerCase(), {
                ...item,
                isUserCompetitor: false,
              });
            }
          });
        }

        // Convert to array and sort
        const competitorData = Array.from(allCompetitorsForDisplay.values())
          .sort((a, b) => {
            // Primary sort: visibility (descending)
            const visibilityA = Number(a.avg_visibility) || 0;
            const visibilityB = Number(b.avg_visibility) || 0;
            if (visibilityB !== visibilityA) {
              return visibilityB - visibilityA;
            }

            // Secondary sort: position (ascending) - lower decimal position = better rank
            const positionA = Number(a.avg_position) || 999;
            const positionB = Number(b.avg_position) || 999;
            if (positionA !== positionB) {
              return positionA - positionB;
            }

            // Tertiary sort: sentiment (descending)
            const sentimentA = Number(a.avg_sentiment) || 0;
            const sentimentB = Number(b.avg_sentiment) || 0;
            return sentimentB - sentimentA;
          })
          .map((item, index) => {
            // Get the domain for logo fetching
            let domain =
              item.domain ||
              `${item.brand_name.toLowerCase().replace(/\s+/g, "")}.com`;
            if (domain) {
              domain = domain
                .replace(/^https?:\/\//i, "")
                .replace(/^www\./i, "")
                .replace(/\/.*$/, "");
            }

            return {
              id: index + 1,
              brand: item.brand_name,
              logo: getDomainLogo(domain, item.logo),
              visibility: `${Math.round(Number(item.avg_visibility) || 0)}%`,
              sentiment: Number.isFinite(Number(item.avg_sentiment))
                ? Math.round(Number(item.avg_sentiment))
                : undefined,
              position: `#${index + 1}`,
              color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
              isUserCompetitor: item.isUserCompetitor,
            };
          });

        console.log("📈 Final competitor data for dashboard:", competitorData);
        console.log("📈 Total competitors to display:", competitorData.length);
        setCompetitorVisibilityData(competitorData);
      } else {
        console.log("⚠️ No data to display - clearing competitors");
        setVisibilityData([]);
        setCompetitorVisibilityData([]);
      }
    } catch (err) {
      console.error("❌ Error fetching visibility data:", err);
      setVisibilityData([]);
      setCompetitorVisibilityData([]);
    }
  };

  useEffect(() => {
    fetchVisibilityData();
  }, [timeRange, selectedModel]);

  // Listen for competitor updates and refresh data
  useEffect(() => {
    const handleCompetitorUpdate = () => {
      console.log("🔔 Competitor update event received!");
      console.log("⏰ Waiting 1 second for backend to process...");
      // Delay to ensure backend has processed the change
      setTimeout(() => {
        console.log("⏰ Delay complete, fetching fresh data from backend...");
        fetchVisibilityData();
      }, 1000);
    };

    window.addEventListener("competitor-updated", handleCompetitorUpdate);

    return () => {
      window.removeEventListener("competitor-updated", handleCompetitorUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          "https://aeotest-production.up.railway.app/prompts/get",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recent chats");
        }

        const data = await response.json();
        setRecentChats(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error("Error fetching recent chats:", err);
        setRecentChats([]);
      }
    };

    fetchRecentChats();
  }, []);

  const competitorColors = {
    InAppStory: "#3b82f6",
    CleverTap: "#ef4444",
    APPSTORYS: "#f97316",
    Mixpanel: "#8b5cf6",
    Storyly: "#10b981",
    Plotline: "#f59e0b",
    MoEngage: "#ec4899",
  };

  // Use competitors from Redux store
  const competitorsData = competitors.map((comp: any) => {
    const domain =
      comp.domain || `${comp.name.toLowerCase().replace(/\s+/g, "")}.com`;
    return {
      id: comp.id,
      brand: comp.name,
      logo: getDomainLogo(domain, comp.logo),
      visibility: comp.visibility || "0%",
      sentiment: comp.sentiment,
      position: comp.position || "#1",
    };
  });

  // Sources data now comes from context

  const getTypeColor = (type: string) => {
    switch (type) {
      case "UGC":
        return "bg-cyan-100 text-cyan-700";
      case "Corporate":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (sourcesLoading || brandLoading) {
    return <LoadingScreen text="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Home className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="chatgpt">ChatGPT</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-4">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">
                  Visibility
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Percentage of chats mentioning each brand
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                const brandsToShow = competitorVisibilityData.map(
                  (c) => c.brand
                );
                const headers = ["Date", ...brandsToShow];
                const csvContent = [
                  headers.join(","),
                  ...visibilityData.map((row) =>
                    [
                      row.date,
                      ...brandsToShow.map((brandName) => row[brandName] || 0),
                    ].join(",")
                  ),
                ].join("\n");

                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `visibility-data-${
                  new Date().toISOString().split("T")[0]
                }.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={visibilityData}
                margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => `${value}%`}
                />
                {competitorVisibilityData.length > 0
                  ? competitorVisibilityData.map((competitor, index) => {
                      const colors = [
                        "#3b82f6",
                        "#ef4444",
                        "#f97316",
                        "#8b5cf6",
                        "#10b981",
                      ];
                      const color = colors[index % colors.length];
                      return (
                        <Line
                          key={competitor.brand}
                          type="monotone"
                          dataKey={competitor.brand}
                          stroke={color}
                          strokeWidth={2}
                          dot={{
                            r: 4,
                            fill: color,
                            strokeWidth: 2,
                            stroke: color,
                          }}
                          activeDot={{
                            r: 6,
                            fill: color,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          connectNulls={false}
                        />
                      );
                    })
                  : null}
              </LineChart>
            </ResponsiveContainer>

            {/* Legend with colored dots */}
            {competitorVisibilityData.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {competitorVisibilityData.map((competitor, index) => {
                  const colors = [
                    "#3b82f6",
                    "#ef4444",
                    "#f97316",
                    "#8b5cf6",
                    "#10b981",
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <div
                      key={competitor.brand}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {competitor.brand}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">
                    Competitors
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Brands with highest visibility
                </CardDescription>
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => navigate("/dashboard/ranking")}
              >
                Show All
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {competitorVisibilityData.length > 0 ? (
              <div className="border rounded-lg overflow-hidden h-auto max-h-96">
                {/* Show scrollbar when content overflows */}
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b bg-muted/30">
                        <TableHead className="text-xs font-medium text-muted-foreground w-10 pl-6 border-r">
                          #
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground border-r">
                          Brand
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4 border-r">
                          Visibility
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4 border-r">
                          Sentiment
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">
                          Position
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitorVisibilityData.map((competitor, index) => {
                        const isOurBrand = competitor.brand === brand?.name;
                        return (
                          <TableRow
                            key={competitor.id || index}
                            className={`hover:bg-muted/50 border-b last:border-0 ${
                              isOurBrand
                                ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30"
                                : ""
                            }`}
                          >
                            <TableCell className="text-xs text-muted-foreground pl-6 py-3 border-r">
                              {index + 1}
                            </TableCell>
                            <TableCell className="py-3 border-r">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage
                                    src={competitor.logo}
                                    alt={competitor.brand}
                                  />
                                  <AvatarFallback
                                    className={`text-xs font-semibold ${
                                      isOurBrand
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {competitor.brand?.charAt(0) || "C"}
                                  </AvatarFallback>
                                </Avatar>
                                <span
                                  className={`text-sm font-medium ${
                                    isOurBrand
                                      ? "text-blue-700 dark:text-blue-300"
                                      : ""
                                  }`}
                                >
                                  {competitor.brand}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold pr-4 py-3 border-r">
                              {competitor.visibility}
                            </TableCell>
                            <TableCell className="text-right pr-4 py-3 border-r">
                              {typeof competitor.sentiment === "number" ? (
                                <div className="flex items-center justify-end gap-1">
                                  <div className="w-0.5 h-3.5 bg-green-500 rounded"></div>
                                  <span className="text-sm font-medium text-green-600">
                                    {competitor.sentiment}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium pr-6 py-3">
                              {competitor.position}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center border rounded-lg bg-muted/20">
                <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  No competitors data available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add competitors to track their visibility
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/dashboard/competitors")}
                >
                  Add Competitors
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Sources Section with Two Containers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Top Sources</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Sources across active models
            </p>
          </div>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
            onClick={() => navigate("/dashboard/sources")}
          >
            Show All
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
          {/* Sources Type Container */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Sources Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="relative mb-5 flex justify-center">
                <div className="relative w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourcesTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={(data) => setHoveredPieData(data)}
                        onMouseLeave={() => setHoveredPieData(null)}
                      >
                        {sourcesTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const percentage = (
                              (Number(data.value) / totalSources) *
                              100
                            ).toFixed(1);
                            return (
                              <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{
                                      backgroundColor: data.payload.color,
                                    }}
                                  />
                                  <p className="font-semibold text-sm text-foreground">
                                    {data.name}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground mb-0.5">
                                  Value:{" "}
                                  <span className="font-semibold text-foreground">
                                    {data.value}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Percentage:{" "}
                                  <span className="font-semibold text-foreground">
                                    {percentage}%
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
                        cursor={false}
                        offset={40}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {hoveredPieData ? (
                      <>
                        <div className="text-4xl font-bold text-foreground">
                          {(
                            (hoveredPieData.value / totalSources) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {hoveredPieData.name}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-foreground">
                          {totalSources}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Sources
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {sourcesTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Domain Container */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Domain</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="text-xs font-medium text-muted-foreground pl-6">
                      Domain
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">
                      Used
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">
                      Citations
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSourcesData.map((source) => (
                    <TableRow
                      key={source.id}
                      className="hover:bg-muted/50 border-b last:border-0"
                    >
                      <TableCell className="py-3 pl-6">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm bg-muted/30 flex items-center justify-center">
                            <img
                              src={source.icon}
                              alt={source.domain}
                              className="w-4 h-4 rounded-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget
                                  .nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <span
                              className="text-xs font-semibold text-muted-foreground hidden"
                              style={{ display: "none" }}
                            >
                              {source.domain?.charAt(0).toUpperCase() || "D"}
                            </span>
                          </div>
                          <a
                            href={`https://${source.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {source.domain}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold py-3">
                        {source.used}
                      </TableCell>
                      <TableCell className="text-right text-sm py-3">
                        {source.avgCitations}
                      </TableCell>
                      <TableCell className="text-right py-3 pr-6">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-1 font-medium rounded ${getTypeColor(
                            source.type
                          )}`}
                        >
                          {source.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">
                Recent Chats
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Chats that mentioned {brand?.name || "your brand"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {recentChats.length > 0 ? (
            <div className="space-y-3">
              {recentChats.map((chat, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-3 p-4 bg-gradient-to-r from-muted/20 to-muted/30 rounded-xl cursor-pointer hover:from-muted/40 hover:to-muted/50 transition-all duration-200 border border-border/20 hover:border-border/40 hover:shadow-sm"
                  onClick={() => {
                    setSelectedChat(chat);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground group-hover:text-foreground/90">
                      {chat.prompt ||
                        chat.question ||
                        chat.title ||
                        "Chat message"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {chat.model || "AI Model"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp
                          ? new Date(chat.timestamp).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                No recent chats available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Chats will appear here once available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                Chat Details
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedChat ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Prompt</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm">
                      {selectedChat.prompt ||
                        selectedChat.question ||
                        "No prompt available"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Response</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedChat.response ||
                        selectedChat.answer ||
                        "No response available"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">
                      {selectedChat.model || "Unknown"}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                    <p className="font-medium">
                      {selectedChat.timestamp
                        ? new Date(selectedChat.timestamp).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No chat selected</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/30">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOverview;
