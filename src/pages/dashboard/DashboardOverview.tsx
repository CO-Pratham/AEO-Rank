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
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { UpgradeDialog } from "@/components/ui/upgrade-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Globe2,
  MessageSquare,
  User,
  Bot,
  Info,
  Lock,
  Check,
  ChevronDown,
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { getDomainLogo, generateInitials } from "@/utils/logoUtils";
import { getTimeAgo } from "@/utils/promptUtils";

// AI Model Logos
import ChatGPTIcon from "@/assets/logos/chatgpt-icon.svg";
import ClaudeIcon from "@/assets/logos/claude-ai-icon.svg";
import GeminiIcon from "@/assets/logos/google-gemini-icon.svg";
import PerplexityIcon from "@/assets/logos/perplexity-ai-icon.svg";
import GrokIcon from "@/assets/logos/grok-icon.svg";
import CopilotIcon from "@/assets/logos/copilot-icon.svg";
import MetaIcon from "@/assets/logos/meta-icon.svg";
import GoogleAIStudioIcon from "@/assets/logos/google-ai-studio-icon.svg";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipProvider as UITooltipProvider,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";
import { getCountryFlag } from "@/utils/promptUtils";

// Helper function to get AI model logo
const getModelLogo = (chat: any): string => {
  // Backend sends model_name field
  const modelName = chat?.model_name || chat?.model || chat?.ai_model || chat?.platform || chat?.engine || chat?.provider;

  if (modelName && typeof modelName === 'string' && modelName.trim() !== '' && modelName.toLowerCase() !== 'unknown') {
    const lowerModel = modelName.toLowerCase();
    
    // Return specific model logos
    if (lowerModel.includes('gpt') || lowerModel.includes('openai') || lowerModel.includes('chatgpt')) {
      return 'https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.59f2e898.png';
    }
    if (lowerModel.includes('claude') || lowerModel.includes('anthropic')) {
      return 'https://claude.ai/images/claude_app_icon.png';
    }
    if (lowerModel.includes('gemini') || lowerModel.includes('bard') || lowerModel.includes('google')) {
      return 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png';
    }
    if (lowerModel.includes('perplexity')) {
      return 'https://www.perplexity.ai/favicon.svg';
    }
    if (lowerModel.includes('copilot')) {
      return 'https://www.bing.com/favicon.ico';
    }
  }
  
  // Default AI icon
  return '';
};

// Helper function to format model names
const formatModelName = (chat: any): string => {
  // Backend sends model_name field directly
  const modelName = chat?.model_name || chat?.model || chat?.ai_model || chat?.platform;
  
  if (modelName && typeof modelName === 'string' && modelName.trim() !== '' && modelName.toLowerCase() !== 'unknown') {
    // Return the actual value from API
    return modelName;
  }
  
  return 'AI Model';
};

// Helper function to parse markdown to HTML
const parseMarkdownToHTML = (text: string): string => {
  if (!text) return '';
  
  let html = text;
  
  // Escape HTML entities
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Parse code blocks (with language support)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto my-3"><code class="text-xs">${code.trim()}</code></pre>`;
  });
  
  // Parse inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">$1</code>');
  
  // Parse bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');
  
  // Parse italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');
  
  // Parse headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');
  
  // Parse tables
  const tableRegex = /(\|.+\|\n)+/g;
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n');
    if (rows.length < 2) return match;
    
    let tableHTML = '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">';
    
    const isSeparator = /^\|[\s:-]+\|/.test(rows[1]);
    const startDataRow = isSeparator ? 2 : 1;
    
    // Header row
    if (isSeparator && rows[0]) {
      const headerCells = rows[0].split('|').filter(cell => cell.trim());
      tableHTML += '<thead class="bg-gray-100 dark:bg-gray-800"><tr>';
      headerCells.forEach(cell => {
        tableHTML += `<th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-sm font-semibold">${cell.trim()}</th>`;
      });
      tableHTML += '</tr></thead>';
    }
    
    // Data rows
    tableHTML += '<tbody>';
    for (let i = startDataRow; i < rows.length; i++) {
      const cells = rows[i].split('|').filter(cell => cell.trim());
      if (cells.length > 0) {
        tableHTML += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">';
        cells.forEach(cell => {
          tableHTML += `<td class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm">${cell.trim()}</td>`;
        });
        tableHTML += '</tr>';
      }
    }
    tableHTML += '</tbody></table></div>';
    
    return tableHTML;
  });
  
  // Parse unordered lists
  html = html.replace(/^[\*\-\+] (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li class="ml-4">.*?<\/li>\n?)+/gs, '<ul class="list-disc list-outside ml-4 my-2 space-y-1">$&</ul>');
  
  // Parse ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li class="ml-4">.*?<\/li>\n?)(?!<\/ul>)+/gs, (match) => {
    if (match.includes('<ul')) return match;
    return '<ol class="list-decimal list-outside ml-4 my-2 space-y-1">' + match + '</ol>';
  });
  
  // Parse blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-2">$1</blockquote>');
  
  // Parse line breaks and paragraphs
  html = html.replace(/\n\n+/g, '</p><p class="my-2">');
  html = html.replace(/\n/g, '<br/>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.match(/^<(h[1-6]|ul|ol|table|pre|blockquote)/)) {
    html = '<p class="my-2">' + html + '</p>';
  }
  
  // Clean up
  html = html.replace(/<p class="my-2"><\/p>/g, '');
  html = html.replace(/<p class="my-2">\s*<\/p>/g, '');
  
  return html;
};

// Extended color palette for unique brand colors
const BRAND_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#f97316", // orange
  "#8b5cf6", // purple
  "#10b981", // green
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#6366f1", // indigo
  "#84cc16", // lime
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#a855f7", // violet
  "#eab308", // yellow
  "#22c55e", // emerald
  "#0ea5e9", // sky
  "#d946ef", // fuchsia
  "#fb923c", // orange-400
  "#4ade80", // green-400
  "#60a5fa", // blue-400
  "#c084fc", // purple-400
  "#fb7185", // rose-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#38bdf8", // sky-400
];

// AI Models Configuration
const AI_MODELS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: ChatGPTIcon,
    locked: false,
  },
  {
    id: "claude",
    name: "Claude",
    icon: ClaudeIcon,
    locked: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: GeminiIcon,
    locked: true,
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    icon: PerplexityIcon,
    locked: true,
  },
  {
    id: "grok",
    name: "Grok",
    icon: GrokIcon,
    locked: true,
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    icon: CopilotIcon,
    locked: true,
  },
  {
    id: "meta",
    name: "Meta AI",
    icon: MetaIcon,
    locked: true,
  },
  {
    id: "google-ai",
    name: "Google AI Studio",
    icon: GoogleAIStudioIcon,
    locked: true,
  },
];

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
    refetchSources,
  } = useSources();
  const { brand, loading: brandLoading, error: brandError } = useBrand();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("chatgpt");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedLockedModel, setSelectedLockedModel] = useState("");
  const [hoveredPieData, setHoveredPieData] = useState<any>(null);
  const [visibilityData, setVisibilityData] = useState<any[]>([]);
  const [competitorVisibilityData, setCompetitorVisibilityData] = useState<
    any[]
  >([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  // Refetch data when component mounts or when there are errors
  useEffect(() => {
    const refetchData = async () => {
      try {
        console.log('🔄 DashboardOverview: Refetching all data...');
        await Promise.all([
          fetchVisibilityData(),
          refetchSources(),
        ]);
        console.log('✅ DashboardOverview: All data refetched successfully');
      } catch (error) {
        console.error('❌ DashboardOverview: Error refetching data:', error);
      }
    };

    // Only refetch if we're not already loading
    if (!brandLoading && !sourcesLoading) {
      refetchData();
    }
  }, [brandLoading, sourcesLoading]);

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
        
        // Generate proper date range based on timeRange selection
        const getDaysCount = () => {
          switch (timeRange) {
            case "7d": return 7;
            case "14d": return 14;
            case "30d": return 30;
            default: return 7;
          }
        };
        
        // Find the earliest date from actual data
        let earliestDate: Date | null = null;
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            const itemDate = item.date || item.timestamp || item.created_at;
            if (itemDate) {
              const date = new Date(itemDate);
              if (!earliestDate || date < earliestDate) {
                earliestDate = date;
              }
            }
          });
        }
        
        const today = new Date();
        const requestedDaysCount = getDaysCount();
        
        // Calculate actual days since account creation/first data
        let actualDaysCount = requestedDaysCount;
        if (earliestDate) {
          const daysSinceCreation = Math.ceil((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          // Use minimum of requested days and actual days since creation (with minimum of 2 days)
          actualDaysCount = Math.max(2, Math.min(requestedDaysCount, daysSinceCreation));
        }
        
        const uniqueDates: string[] = [];
        
        // Generate dates from earliest to today (only for actual days)
        for (let i = actualDaysCount - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          uniqueDates.push(date.toISOString().split("T")[0]);
        }
        
        console.log(`📅 Generated date range for ${timeRange}:`, uniqueDates);
        console.log(`📅 Account created: ${earliestDate ? earliestDate.toISOString().split('T')[0] : 'unknown'}`);
        console.log(`📅 Days shown: ${actualDaysCount} (requested: ${requestedDaysCount})`);

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
        // Use Redux competitors for consistent domain values
        if (Array.isArray(competitors) && competitors.length > 0) {
          competitors.forEach((userComp: any) => {
            const brandName = userComp.name || userComp.brand_name || userComp.brand;
            if (brandName) {
              const analysisItem = analysisMap.get(brandName.toLowerCase());
              
              // Use domain from Redux store (source of truth from CompetitorsPage)
              let domain = userComp.domain || userComp.website || "";
              
              // Clean domain if it exists
              if (domain) {
                domain = domain
                  .replace(/^https?:\/\//i, "")
                  .replace(/^www\./i, "")
                  .replace(/\/.*$/, "");
              }
              
              // Only fallback to .com if no domain at all
              if (!domain) {
                domain = `${brandName.toLowerCase().replace(/\s+/g, "")}.com`;
              }

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

        // Convert to array, include ALL brands (even with 0% visibility), and sort
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

            const visibility = Number(item.avg_visibility) || 0;
            const hasVisibility = visibility > 0;

            return {
              id: index + 1,
              brand: item.brand_name,
              domain: domain,
              logo: getDomainLogo(domain, item.logo, item.brand_name),
              visibility: `${Math.round(visibility)}%`,
              sentiment: hasVisibility && Number.isFinite(Number(item.avg_sentiment))
                ? Math.round(Number(item.avg_sentiment))
                : null,
              position: hasVisibility ? `#${index + 1}` : null,
              color: BRAND_COLORS[index % BRAND_COLORS.length],
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
      logo: getDomainLogo(domain, comp.logo, comp.name),
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

  // Show loading screen if either brand or sources are still loading (initial load)
  // This ensures all data is loaded before showing the dashboard
  if (brandLoading || sourcesLoading) {
    return <LoadingScreen text="Loading dashboard data..." />;
  }

  // Show error state with retry button if there are errors
  if (brandError || sourcesError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground">
            {brandError || sourcesError || "Failed to load dashboard data"}
          </p>
          <Button 
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] h-9 justify-between font-normal"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={AI_MODELS.find(m => m.id === selectedModel)?.icon}
                    alt={AI_MODELS.find(m => m.id === selectedModel)?.name}
                    className="w-4 h-4"
                  />
                  <span>{AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {AI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => {
                    if (model.locked) {
                      setSelectedLockedModel(model.name);
                      setShowUpgradeDialog(true);
                    } else {
                      setSelectedModel(model.id);
                    }
                  }}
                  className="cursor-pointer flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={model.icon}
                      alt={model.name}
                      className="w-4 h-4"
                    />
                    <span className={model.locked ? "text-muted-foreground" : ""}>
                      {model.name}
                    </span>
                  </div>
                  {model.locked ? (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  ) : selectedModel === model.id ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
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
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
                {competitorVisibilityData.length > 0
                  ? competitorVisibilityData
                      .filter((competitor) => 
                        !hoveredBrand || competitor.brand === hoveredBrand
                      )
                      .map((competitor, index) => {
                        // Find original index for consistent color
                        const originalIndex = competitorVisibilityData.findIndex(
                          c => c.brand === competitor.brand
                        );
                        const color = BRAND_COLORS[originalIndex % BRAND_COLORS.length];
                        return (
                          <Line
                            key={competitor.brand}
                            type="monotone"
                            dataKey={competitor.brand}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 6,
                              fill: color,
                              strokeWidth: 2,
                              stroke: "#fff",
                            }}
                            connectNulls={false}
                            isAnimationActive={false}
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
                  const color = BRAND_COLORS[index % BRAND_COLORS.length];
                  return (
                    <div
                      key={competitor.brand}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-900"
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
                          <div className="flex items-center justify-end gap-1">
                            <span>Visibility</span>
                            <UITooltipProvider delayDuration={0}>
                              <UITooltip>
                                <UITooltipTrigger asChild>
                                  <button className="inline-flex items-center justify-center cursor-pointer">
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </button>
                                </UITooltipTrigger>
                                <UITooltipContent side="top" className="max-w-xs bg-white border-gray-200">
                                  <p className="text-xs text-gray-700">
                                    Percentage of AI conversations where this brand was mentioned in the response
                                  </p>
                                </UITooltipContent>
                              </UITooltip>
                            </UITooltipProvider>
                          </div>
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4 border-r">
                          <div className="flex items-center justify-end gap-1">
                            <span>Sentiment</span>
                            <UITooltipProvider delayDuration={0}>
                              <UITooltip>
                                <UITooltipTrigger asChild>
                                  <button className="inline-flex items-center justify-center cursor-pointer">
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </button>
                                </UITooltipTrigger>
                                <UITooltipContent side="top" className="max-w-xs bg-white border-gray-200">
                                  <p className="text-xs text-gray-700">
                                    Average sentiment score (0-100) indicating how positively the brand is mentioned
                                  </p>
                                </UITooltipContent>
                              </UITooltip>
                            </UITooltipProvider>
                          </div>
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <span>Position</span>
                            <UITooltipProvider delayDuration={0}>
                              <UITooltip>
                                <UITooltipTrigger asChild>
                                  <button className="inline-flex items-center justify-center cursor-pointer">
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </button>
                                </UITooltipTrigger>
                                <UITooltipContent side="top" className="max-w-xs bg-white border-gray-200">
                                  <p className="text-xs text-gray-700">
                                    Ranking position based on visibility percentage. Higher visibility = better position
                                  </p>
                                </UITooltipContent>
                              </UITooltip>
                            </UITooltipProvider>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitorVisibilityData.map((competitor, index) => {
                        const isOurBrand = competitor.brand === brand?.name;
                        const isHovered = hoveredBrand === competitor.brand;
                        return (
                          <TableRow
                            key={competitor.id || index}
                            className={`hover:bg-muted/50 border-b last:border-0 transition-colors ${
                              isOurBrand
                                ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30"
                                : ""
                            }`}
                            onMouseEnter={() => setHoveredBrand(competitor.brand)}
                            onMouseLeave={() => setHoveredBrand(null)}
                          >
                            <TableCell className="text-xs text-muted-foreground pl-6 py-3 border-r">
                              <div className="flex items-center justify-start min-w-[24px]">
                                {isHovered ? (
                                  <div
                                    className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-900"
                                    style={{ backgroundColor: competitor.color }}
                                  />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 border-r">
                              <div className="flex items-center gap-2.5">
                                <BrandAvatar
                                  brandName={competitor.brand}
                                  domain={competitor.domain}
                                  logoUrl={competitor.logo}
                                  size="md"
                                  highlighted={isOurBrand}
                                />
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
                              {competitor.sentiment !== null && typeof competitor.sentiment === "number" ? (
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
                              {competitor.position !== null ? (
                                competitor.position
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
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
              {sourcesTypeData.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-4xl font-bold text-muted-foreground mb-2">
                    0
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    No Sources Data
                  </div>
                  <div className="text-[8px] text-muted-foreground mt-1">
                    Add sources to see distribution
                  </div>
                </div>
              )}
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
                  {topSourcesData.length > 0 ? (
                    topSourcesData.map((source) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center mb-2">
                            <Globe2 className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-medium">No domain data available</p>
                          <p className="text-xs mt-1">Domain information will appear here once available</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Chats Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Recent Chats</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Chats that mentioned {brand?.name || "your brand"}
            </p>
          </div>
        </div>

        {recentChats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentChats.map((chat, index) => (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300 border-border/40"
                onClick={() => {
                  setSelectedChat(chat);
                  setIsDialogOpen(true);
                }}
              >
                <CardContent className="p-3.5">
                  {/* Country Flag & Prompt */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {(() => {
                        const location = chat.location || chat.country || chat.region;
                        if (location) {
                          const countryFlag = getCountryFlag(location);
                          if (countryFlag) {
                            return <span className="text-sm">{countryFlag}</span>;
                          }
                        }
                        return <Globe className="w-3 h-3 text-muted-foreground" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Backend sends prompt field */}
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                        {chat.prompt || chat.question || chat.query || chat.user_query || chat.title || "Chat message"}
                      </p>
                    </div>
                  </div>

                  {/* AI Response Preview */}
                  <div className="mb-2.5">
                    {/* Backend sends response field */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {(chat.response || chat.answer || chat.ai_response || "No response available")
                        .replace(/[*#_`\[\]]/g, '') // Remove markdown symbols
                        .substring(0, 120)}
                      {(chat.response || chat.answer || chat.ai_response || "").length > 120 && '...'}
                    </p>
                  </div>

                  {/* Meta Info - AI Model and Time */}
                  <div className="pt-2.5 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {getModelLogo(chat) && (
                          <img 
                            src={getModelLogo(chat)} 
                            alt="AI" 
                            className="w-4 h-4 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-xs text-muted-foreground font-medium">
                          {formatModelName(chat)}
                        </span>
                        
                        {/* Brand Mentions - Compact with logos */}
                        {(() => {
                          const mentions = chat.mentions || chat.brands || chat.brand_mentions;
                          if (!mentions || (typeof mentions === 'object' && Object.keys(mentions).length === 0)) {
                            return null;
                          }
                          
                          const brandEntries = Object.entries(mentions).filter(([_, count]) => Number(count) > 0);
                          if (brandEntries.length === 0) {
                            return null;
                          }
                          
                          return (
                            <div className="flex items-center gap-1 ml-2">
                              {brandEntries.slice(0, 3).map(([brandName, count]: [string, any], index: number) => {
                                const domain = `${brandName.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')}.com`;
                                return (
                                  <img 
                                    key={index}
                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                                    alt={brandName}
                                    className="w-3 h-3 rounded"
                                    title={brandName}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                );
                              })}
                              {brandEntries.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{brandEntries.length - 3}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(() => {
                          // Backend sends created_at field
                          const dateValue = chat.created_at || chat.timestamp || chat.date || chat.chat_date || chat.created;
                          return dateValue ? getTimeAgo(dateValue) : 'Recent';
                        })()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium">No recent chats available</p>
              <p className="text-xs text-muted-foreground mt-1">Conversations will appear here once available</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          {selectedChat ? (
            <>
              {/* Header with Badges */}
              <div className="px-6 py-5 border-b bg-white">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  {/* Success Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-md">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium text-green-700">Succeeded</span>
                  </div>

                  {/* AI Model Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border rounded-md">
                    {getModelLogo(selectedChat) && (
                      <img 
                        src={getModelLogo(selectedChat)} 
                        alt="AI" 
                        className="w-4 h-4 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      {formatModelName(selectedChat) === 'GPT' ? 'ChatGPT' : formatModelName(selectedChat)}
                    </span>
                  </div>

                  {/* Country Badge */}
                  {(selectedChat.location || selectedChat.country) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border rounded-md">
                      <span className="text-sm">{getCountryFlag(selectedChat.location || selectedChat.country)}</span>
                      <span className="text-xs font-medium text-foreground">
                        {selectedChat.location || selectedChat.country || "India"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Layout: Main Content + Sidebar */}
              <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Chat Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/20">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* User Message - Right Side */}
                    <div className="flex justify-end">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="flex-1 bg-black text-white rounded-lg p-3.5">
                          <p className="text-sm leading-relaxed break-words">
                            {selectedChat.prompt ||
                              selectedChat.question ||
                              selectedChat.query ||
                              selectedChat.user_query ||
                              "No prompt available"}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* AI Response - Left Side */}
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[90%]">
                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center flex-shrink-0">
                          {getModelLogo(selectedChat) ? (
                            <img 
                              src={getModelLogo(selectedChat)} 
                              alt="AI" 
                              className="w-4 h-4 rounded-full"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const botIcon = document.createElement('div');
                                  botIcon.innerHTML = '<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                                  parent.appendChild(botIcon);
                                }
                              }}
                            />
                          ) : (
                            <Bot className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 bg-white dark:bg-gray-800 border rounded-lg p-4">
                          <div 
                            className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdownToHTML(
                                selectedChat.response ||
                                selectedChat.answer ||
                                selectedChat.ai_response ||
                                "No response available"
                              )
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Brands & Sources */}
                <div className="w-72 border-l bg-white overflow-y-auto">
                  <div className="p-4 space-y-5">
                    {/* Brands Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Brands</h3>
                      <div className="space-y-2">
                        {(() => {
                          // Backend sends mentions as object: { "BrandName": count, ... }
                          const mentions = selectedChat.mentions || selectedChat.brands || selectedChat.brand_mentions;
                          
                          if (!mentions || (typeof mentions === 'object' && Object.keys(mentions).length === 0)) {
                            return (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>No brands mentioned</span>
                              </div>
                            );
                          }

                          // Convert mentions object to array and filter brands with count > 0
                          const brandEntries = Object.entries(mentions).filter(([_, count]) => Number(count) > 0);
                          
                          if (brandEntries.length === 0) {
                            return (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>No brands mentioned</span>
                              </div>
                            );
                          }

                          return brandEntries.map(([brandName, count]: [string, any], index: number) => {
                            // Generate domain from brand name
                            const domain = `${brandName.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')}.com`;
                            
                            return (
                              <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                    alt=""
                                    className="w-4 h-4 rounded"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <span className="text-xs font-medium text-foreground">{brandName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold">×{count}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Sources Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Sources</h3>
                      <div className="space-y-3">
                        {(() => {
                          // Backend sends sources as array of domain strings: ["data.ai", "appfollow.io"]
                          const sources = selectedChat.sources || selectedChat.citations || selectedChat.source_urls || [];
                          const sourceArray = Array.isArray(sources) ? sources : [];
                          
                          if (sourceArray.length === 0) {
                            return (
                              <p className="text-sm text-muted-foreground">No sources found</p>
                            );
                          }

                          return sourceArray.map((sourceItem: any, index: number) => {
                            try {
                              // Backend sends domain strings, construct full URL
                              let domain = '';
                              let url = '';
                              
                              if (typeof sourceItem === 'string') {
                                // If it's already a URL
                                if (sourceItem.startsWith('http://') || sourceItem.startsWith('https://')) {
                                  url = sourceItem;
                                  const urlObj = new URL(sourceItem);
                                  domain = urlObj.hostname.replace('www.', '');
                                } else {
                                  // It's just a domain like "data.ai"
                                  domain = sourceItem.replace('www.', '');
                                  url = `https://${domain}`;
                                }
                              } else if (sourceItem && typeof sourceItem === 'object') {
                                domain = sourceItem.domain || sourceItem.url || '';
                                url = sourceItem.url || `https://${domain}`;
                              }
                              
                              if (!domain) return null;
                              
                              const displayTitle = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
                              
                              return (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors group"
                                >
                                  <div className="w-5 h-5 bg-muted rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <img 
                                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                      alt=""
                                      className="w-3.5 h-3.5"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-medium text-foreground mb-0.5 truncate group-hover:text-blue-600">
                                      {displayTitle}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {domain}
                                    </p>
                                  </div>
                                </a>
                              );
                            } catch (e) {
                              return null;
                            }
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6">
              <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No chat selected</p>
              <p className="text-xs text-muted-foreground mt-1">Select a chat to view details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog for Locked Models */}
      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        featureName={selectedLockedModel}
      />
    </div>
  );
};

export default DashboardOverview;
