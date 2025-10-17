import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSources } from "@/context/SourcesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Globe,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { sourcesData } from "@/utils/mockData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const SourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<any>(null);
  const [sourcePerformanceData, setSourcePerformanceData] = useState<any[]>([]);
  const [urlPerformanceData, setUrlPerformanceData] = useState<any[]>([]);
  const [urlSourcesData, setUrlSourcesData] = useState<any[]>([]);

  const { sourcesTypeData, topSourcesData, totalSources, loading } = useSources();

  useEffect(() => {
    if (topSourcesData && topSourcesData.length > 0) {
      try {
        const dates = ['Oct 1', 'Oct 2', 'Oct 3', 'Oct 4', 'Oct 5', 'Oct 6', 'Oct 7','Oct 8','Oct 9','Oct 10'];
        const chartData = dates.map((date, index) => {
          const dayData = { date };
          topSourcesData.slice(0, 3).forEach((source, sourceIndex) => {
            if (source && source.domain && source.used !== undefined) {
              const baseUsage = parseInt(source.used.toString()) || 1;
              const variation = Math.sin(index * 0.1 + sourceIndex) * 0.2;
              dayData[source.domain] = Math.max(0, baseUsage + variation);
            }
          });
          return dayData;
        });
        setSourcePerformanceData(chartData);
      } catch (error) {
        console.error('Error generating chart data:', error);
        setSourcePerformanceData([]);
      }
    } else {
      setSourcePerformanceData([]);
    }
  }, [topSourcesData, timeRange, selectedModel]);

  useEffect(() => {
    const fetchUrlPerformanceData = async () => {
      try {
        // ====== BACKEND ENDPOINT ======
        // TODO: Replace with your actual API endpoint
        // Expected response format: Array of {date: string, url1: number, url2: number, ...}
        const response = await fetch(`/api/sources/url-performance?timeRange=${timeRange}&model=${selectedModel}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch URL performance data');
        }
        
        const data = await response.json();
        setUrlPerformanceData(data);
      } catch (err) {
        console.error('Error fetching URL performance data:', err);
        setUrlPerformanceData([]);
      }
    };

    fetchUrlPerformanceData();
  }, [timeRange, selectedModel]);

  useEffect(() => {
    const fetchUrlSourcesData = async () => {
      try {
        // ====== BACKEND ENDPOINT ======
        // TODO: Replace with your actual API endpoint
        const response = await fetch(`/api/sources/urls?timeRange=${timeRange}&model=${selectedModel}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch URL sources data');
        }
        
        const data = await response.json();
        setUrlSourcesData(data);
      } catch (err) {
        console.error('Error fetching URL sources data:', err);
        setUrlSourcesData([]);
      }
    };

    fetchUrlSourcesData();
  }, [timeRange, selectedModel]);

  // Map context data to chart format
  const sourceTypeData = sourcesTypeData.map((item) => ({
    name: item.name,
    value: item.value,
    fill: item.color,
  }));

  // Dynamic chart config based on actual sources
  const chartConfig = (topSourcesData && topSourcesData.length > 0) ? topSourcesData.slice(0, 3).reduce((config, source, index) => {
    if (source && source.domain) {
      const colors = ['#8884d8', '#82ca9d', '#ffc658'];
      config[source.domain] = {
        label: source.domain,
        color: colors[index]
      };
    }
    return config;
  }, {} as any) : {};

  const urlChartConfig = {
    url1: {
      label: "plotline.so/blog/tools-to-gamify...",
      color: "#ffc658",
    },
    url2: {
      label: "hackerearth.com/blog/how-to-cr...",
      color: "#8884d8",
    },
    url3: {
      label: "aihr.com/blog/onboarding-activiti...",
      color: "#00d4ff",
    },
    url4: {
      label: "plotline.so/blog/in-app-stories-fo...",
      color: "#82ca9d",
    },
    url5: {
      label: "uxcam.com/blog/top-10-analytics-tool...",
      color: "#ff7300",
    },
  };

  const pieChartConfig = {
    Corporate: { label: "Corporate", color: "#8b87ff" },
    Editorial: { label: "Editorial", color: "#82ca9d" },
    Institutional: { label: "Institutional", color: "#ffc658" },
    UGC: { label: "UGC", color: "#ff7043" },
    Reference: { label: "Reference", color: "#00e5a0" },
    Other: { label: "Other", color: "#e91e63" },
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "bg-green-500";
    if (sentiment >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPlatformIcons = (platforms: string[]) => {
    return platforms.map((platform, index) => (
      <Avatar key={index} className="w-6 h-6">
        <AvatarImage
          src={`${platform}`}
        />
        <AvatarFallback className="text-xs">{platform[0]}</AvatarFallback>
      </Avatar>
    ));
  };

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

  if (loading) {
    return <LoadingScreen text="Loading sources data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Domains/URLs Toggle Section */}
      <Tabs defaultValue="domains" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold text-foreground">
                Sources
              </h1>
            </div>
            <TabsList>
              <TabsTrigger value="domains">Domains</TabsTrigger>
              <TabsTrigger value="urls">URLs</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32">
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

        <TabsContent value="domains" className="space-y-6">
          {/* Charts Section for Domains */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Source Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Source Usage by Domain
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {topSourcesData.length > 0 ? topSourcesData.slice(0, 3).map((source, index) => {
                    const colors = ['#8884d8', '#82ca9d', '#ffc658'];
                    return (
                      <div key={source.domain} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[index] }} />
                        <a
                          href={`https://${source.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {source.domain}
                        </a>
                      </div>
                    );
                  }) : (
                    <span className="text-xs text-muted-foreground">Loading domains...</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[280px] w-full"
                >
                  <LineChart
                    data={sourcePerformanceData}
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {topSourcesData.length > 0 ? topSourcesData.slice(0, 3).map((source, index) => {
                      const colors = ['#8884d8', '#82ca9d', '#ffc658'];
                      const color = colors[index];
                      return (
                        <Line
                          key={source.domain}
                          type="monotone"
                          dataKey={source.domain}
                          stroke={color}
                          strokeWidth={1.5}
                          dot={{ fill: color, r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      );
                    }) : null}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Source Type Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Sources Type
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-2 pb-4">
                <div className="h-[180px] relative w-full flex justify-center">
                  <ChartContainer config={pieChartConfig} className="w-full">
                    <PieChart>
                      <Pie
                        data={sourceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={75}
                        innerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={1.5}
                        onMouseEnter={(data) => setHoveredData(data)}
                        onMouseLeave={() => setHoveredData(null)}
                      >
                        {sourceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const percentage = ((Number(data.value) / totalSources) * 100).toFixed(1);
                            return (
                              <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: data.payload.fill }}
                                  />
                                  <p className="font-semibold text-sm text-foreground">{data.name}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mb-0.5">
                                  Value: <span className="font-semibold text-foreground">{data.value}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Percentage: <span className="font-semibold text-foreground">{percentage}%</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                        cursor={false}
                        offset={15}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      {hoveredData ? (
                        <>
                          <div className="text-3xl font-bold">
                            {((hoveredData.value / totalSources) * 100).toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {hoveredData.name}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl font-bold">{totalSources}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Sources
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Legend */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 w-full">
                  {sourceTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-[10px] font-medium">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sources Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold">Domain</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const headers = ["Domain", "Used", "Citations", "Type"];
                    const csvContent = [
                      headers.join(","),
                      ...topSourcesData.map((source) =>
                        [
                          source.domain,
                          source.used,
                          source.avgCitations,
                          source.type,
                        ].join(",")
                      ),
                    ].join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "sources-domains.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
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
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <span 
                              className="text-xs font-semibold text-muted-foreground hidden"
                              style={{ display: 'none' }}
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
                          className={`text-xs px-2 py-1 font-medium rounded ${
                            source.type === "UGC"
                              ? "bg-cyan-100 text-cyan-700"
                              : source.type === "Corporate"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
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
        </TabsContent>

        <TabsContent value="urls" className="space-y-6">
          {/* URL Performance Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Source Usage by URLs
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffc658]" />
                  <span className="text-xs">{urlChartConfig.url1.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8884d8]" />
                  <span className="text-xs">{urlChartConfig.url2.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00d4ff]" />
                  <span className="text-xs">{urlChartConfig.url3.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#82ca9d]" />
                  <span className="text-xs">{urlChartConfig.url4.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff7300]" />
                  <span className="text-xs">{urlChartConfig.url5.label}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer
                config={urlChartConfig}
                className="h-[280px] w-full"
              >
                <LineChart
                  data={urlPerformanceData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="url1"
                    stroke="#ffc658"
                    strokeWidth={1.5}
                    dot={{ fill: "#ffc658", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="url2"
                    stroke="#8884d8"
                    strokeWidth={1.5}
                    dot={{ fill: "#8884d8", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="url3"
                    stroke="#00d4ff"
                    strokeWidth={1.5}
                    dot={{ fill: "#00d4ff", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="url4"
                    stroke="#82ca9d"
                    strokeWidth={1.5}
                    dot={{ fill: "#82ca9d", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="url5"
                    stroke="#ff7300"
                    strokeWidth={1.5}
                    dot={{ fill: "#ff7300", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* URL Sources Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-semibold">
                URL Sources
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const headers = [
                    "Title",
                    "URL",
                    "Type",
                    "Mentions",
                    "Used Total",
                    "Avg Citations",
                    "Updated",
                  ];
                  const csvContent = [
                    headers.join(","),
                    ...urlSourcesData.map((item) =>
                      [
                        `"${item.title}"`,
                        item.url,
                        item.type,
                        item.mentions,
                        item.usedTotal,
                        item.avgCitations,
                        `"${item.updated}"`,
                      ].join(",")
                    ),
                  ].join("\n");

                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "sources-urls.csv";
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-medium text-xs">URL</TableHead>
                    <TableHead className="font-medium text-xs w-[100px]">
                      Type
                    </TableHead>
                    <TableHead className="font-medium text-xs text-center w-[110px]">
                      Mentioned
                    </TableHead>
                    <TableHead className="font-medium text-xs text-center w-[100px]">
                      Mentions
                    </TableHead>
                    <TableHead className="font-medium text-xs text-center w-[110px]">
                      Used total
                    </TableHead>
                    <TableHead className="font-medium text-xs text-center w-[120px]">
                      Avg. Citations
                    </TableHead>
                    <TableHead className="font-medium text-xs text-center w-[110px]">
                      Updated
                    </TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urlSourcesData.map((urlSource) => (
                    <TableRow key={urlSource.id} className="hover:bg-muted/50">
                      <TableCell className="py-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8 rounded-md">
                            <AvatarImage
                              src={`https://www.google.com/s2/favicons?domain=${urlSource.url}&sz=64`}
                              alt={urlSource.title}
                            />
                            <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">
                              {urlSource.title[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="max-w-md">
                            <p className="font-medium text-sm leading-tight mb-0.5">
                              {urlSource.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {urlSource.url}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            urlSource.type === "Listicle"
                              ? "bg-cyan-50 text-cyan-700 hover:bg-cyan-50 border-0"
                              : "bg-green-50 text-green-700 hover:bg-green-50 border-0"
                          }
                        >
                          {urlSource.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-red-700 hover:bg-red-50 border-0"
                        >
                          No
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="font-medium text-sm">
                          {urlSource.mentions}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="font-medium text-sm">
                          {urlSource.usedTotal}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="font-medium text-sm">
                          {urlSource.avgCitations}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="text-sm text-muted-foreground">
                          {urlSource.updated}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 hover:bg-muted"
                          onClick={() => {
                            setSelectedUrl(urlSource);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <button
            onClick={() => setDetailsDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {selectedUrl && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  {selectedUrl.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Gamification has become a powerful strategy for enhancing user
                  engagement and retention in mobile apps. By integrating
                  game-like elements into non-gaming contexts, brands can create
                  more interactive and rewarding experiences for their users.
                </p>
                <p className="text-muted-foreground text-sm">
                  In this blog, we'll explore what gamification in mobile apps
                  entails, why it's beneficial, the tools available for app
                  gamification, and the top five tools for 2025.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  What is Gamification in Mobile Apps?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Gamification refers to the application of game-design elements
                  and principles in non-game contexts. In mobile apps, this
                  means incorporating features such as points, badges,
                  leaderboards, challenges, and rewards to motivate users and
                  enhance their overall experience. By making the app more
                  engaging and fun, gamification helps in retaining users and
                  encouraging them to interact with the app more frequently.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Why Should You Gamify Mobile App User Experiences?
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Gamifying mobile app user experiences offers numerous
                  benefits:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-foreground">•</span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Increased Engagement:
                      </span>{" "}
                      Gamification elements make the app more interesting and
                      interactive, keeping users engaged for longer periods.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground">•</span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Enhanced Retention:
                      </span>{" "}
                      By rewarding users for their interactions, gamification
                      encourages repeat usage and reduces churn.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground">•</span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Improved User Satisfaction:
                      </span>{" "}
                      Fun and rewarding experiences lead to higher user
                      satisfaction and positive reviews.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground">•</span>
                    <div>
                      <span className="font-semibold text-foreground">
                        Behavioral Influence:
                      </span>{" "}
                      Gamification can guide user behavior towards desired
                      actions, such as completing profiles or making purchases.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SourcesPage;
