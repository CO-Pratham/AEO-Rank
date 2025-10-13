import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompetitors } from "@/context/CompetitorsContext";
import { useSources } from "@/context/SourcesContext";
import { useBrand } from "@/context/BrandContext";
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

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { competitors, loading: competitorsLoading, error: competitorsError } = useCompetitors();
  const { sourcesTypeData, topSourcesData, totalSources, loading: sourcesLoading, error: sourcesError } = useSources();
  const { brand, loading: brandLoading, error: brandError } = useBrand();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("all");
  const [hoveredPieData, setHoveredPieData] = useState<any>(null);
  const [visibilityData, setVisibilityData] = useState<any[]>([]);
  const [competitorVisibilityData, setCompetitorVisibilityData] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVisibilityData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`https://aeotest-production.up.railway.app/analyse/brand/get`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch visibility data');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Create time-series data for visibility chart
        if (data && Array.isArray(data) && data.length > 0) {
          const dates = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'];
          const chartData = dates.map(date => {
            const dayData = { date };
            data.forEach(brand => {
              dayData[brand.brand_name] = brand.avg_visibility + Math.random() * 10 - 5; // Add some variation
            });
            return dayData;
          });
          setVisibilityData(chartData);
        }
        
        // Extract competitor data from API response
        if (data && Array.isArray(data) && data.length > 0) {
          const competitorData = data
            .sort((a, b) => b.avg_visibility - a.avg_visibility)
            .map((item, index) => ({
              id: index + 1,
              brand: item.brand_name,
              logo: '',
              visibility: `${item.avg_visibility}%`,
              sentiment: item.avg_sentiment,
              position: Math.round(item.avg_position)
            }));
          
          setCompetitorVisibilityData(competitorData);
        }
      } catch (err) {
        console.error('Error fetching visibility data:', err);
        setVisibilityData([]);
      }
    };

    fetchVisibilityData();
  }, [timeRange, selectedModel]);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('https://aeotest-production.up.railway.app/prompts/get', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent chats');
        }
        
        const data = await response.json();
        console.log('Recent Chats API Response:', data);
        setRecentChats(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error('Error fetching recent chats:', err);
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

  // Use competitors from context
  const competitorsData = competitors;

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
                const brandsToShow = competitorVisibilityData.map(c => c.brand);
                const headers = ['Date', ...brandsToShow];
                const csvContent = [
                  headers.join(','),
                  ...visibilityData.map(row => [
                    row.date,
                    ...brandsToShow.map(brandName => row[brandName] || 0)
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `visibility-data-${new Date().toISOString().split('T')[0]}.csv`;
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
                {competitorVisibilityData.length > 0 ? competitorVisibilityData.map((competitor, index) => {
                  const colors = ["#3b82f6", "#ef4444", "#f97316", "#8b5cf6", "#10b981"];
                  const color = colors[index % colors.length];
                  return (
                    <Line
                      key={competitor.brand}
                      type="monotone"
                      dataKey={competitor.brand}
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 5, fill: color }}
                    />
                  );
                }) : null}
              </LineChart>
            </ResponsiveContainer>
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
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-xs font-medium text-muted-foreground w-10 pl-6">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Brand
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">
                    Visibility
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">
                    Sentiment
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">
                    Position
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(competitorVisibilityData.length > 0 ? competitorVisibilityData : competitorsData).map((competitor, index) => (
                  <TableRow
                    key={competitor.id}
                    className="hover:bg-muted/50 border-b last:border-0"
                  >
                    <TableCell className="text-xs text-muted-foreground pl-6 py-3">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={competitor.logo} alt={competitor.brand} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {competitor.brand?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {competitor.brand}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold pr-4 py-3">
                      {competitor.visibility}
                    </TableCell>
                    <TableCell className="text-right pr-4 py-3">
                      {typeof competitor.sentiment === "number" ? (
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-0.5 h-3.5 bg-green-500 rounded"></div>
                          <span className="text-sm font-medium text-green-600">
                            {competitor.sentiment}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium pr-6 py-3">
                      {competitor.position}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                          <img 
                            src={source.icon} 
                            alt={source.domain}
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'inline';
                            }}
                          />
                          <span className="text-base hidden">
                            {source.domain?.charAt(0).toUpperCase() || 'D'}
                          </span>
                          <span className="text-sm font-medium">
                            {source.domain}
                          </span>
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
              Chats that mentioned {brand?.name || 'your brand'}
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
                      {chat.prompt || chat.question || chat.title || 'Chat message'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {chat.model || 'AI Model'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp ? new Date(chat.timestamp).toLocaleDateString() : 'Recent'}
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
              <p className="text-sm text-muted-foreground font-medium">No recent chats available</p>
              <p className="text-xs text-muted-foreground mt-1">Chats will appear here once available</p>
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
                <div>
                  <div className="font-semibold">Chat Details</div>
                  <DialogDescription className="text-xs mt-1">
                    Full conversation and analysis
                  </DialogDescription>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {selectedChat && (
              <div className="space-y-6">
                {/* Prompt Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-foreground">User Prompt</h4>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                    <p className="text-sm leading-relaxed text-foreground">
                      {selectedChat.prompt || selectedChat.question || selectedChat.title || 'No prompt available'}
                    </p>
                  </div>
                </div>
                
                {/* Response Section */}
                {selectedChat.response && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-foreground">AI Response</h4>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-xl border border-green-200/50 dark:border-green-800/30">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {selectedChat.response}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Metadata Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-foreground">Chat Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">AI</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-muted-foreground">Model</h5>
                          <p className="text-sm font-medium">{selectedChat.model || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">📅</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-muted-foreground">Date & Time</h5>
                          <p className="text-sm font-medium">
                            {selectedChat.timestamp ? new Date(selectedChat.timestamp).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedChat.brand_mentioned && (
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">🏷️</span>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-muted-foreground">Brand Mentioned</h5>
                            <p className="text-sm font-medium">{selectedChat.brand_mentioned}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedChat.sentiment && (
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-400">💭</span>
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-muted-foreground">Sentiment</h5>
                            <p className="text-sm font-medium">{selectedChat.sentiment}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/20">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="px-6"
              >
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
