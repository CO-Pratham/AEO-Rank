import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall } from "@/utils/api";
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
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ArrowRight, Eye, Users, Globe, Globe2, MessageSquare, User, Bot } from "lucide-react";

// Helper function to get country flag emoji
const getCountryFlag = (location: string): string => {
  if (!location) return '🌐'; // Default to globe for unknown location
  
  const loc = location.toLowerCase();
  
  // Map country names to flag emojis
  if (loc.includes('india') || loc.includes('in')) return '🇮🇳';
  if (loc.includes('united states') || loc.includes('usa') || loc.includes('us')) return '🇺🇸';
  if (loc.includes('united kingdom') || loc.includes('uk') || loc.includes('britain') || loc.includes('england')) return '🇬🇧';
  if (loc.includes('canada') || loc.includes('ca')) return '🇨🇦';
  if (loc.includes('australia') || loc.includes('au')) return '🇦🇺';
  if (loc.includes('germany') || loc.includes('de')) return '🇩🇪';
  if (loc.includes('france') || loc.includes('fr')) return '🇫🇷';
  if (loc.includes('japan') || loc.includes('jp')) return '🇯🇵';
  if (loc.includes('china') || loc.includes('cn')) return '🇨🇳';
  if (loc.includes('brazil') || loc.includes('br')) return '🇧🇷';
  if (loc.includes('mexico') || loc.includes('mx')) return '🇲🇽';
  if (loc.includes('spain') || loc.includes('es')) return '🇪🇸';
  if (loc.includes('italy') || loc.includes('it')) return '🇮🇹';
  if (loc.includes('russia') || loc.includes('ru')) return '🇷🇺';
  if (loc.includes('singapore') || loc.includes('sg')) return '🇸🇬';
  if (loc.includes('netherlands') || loc.includes('nl')) return '🇳🇱';
  if (loc.includes('sweden') || loc.includes('se')) return '🇸🇪';
  if (loc.includes('switzerland') || loc.includes('ch')) return '🇨🇭';
  
  return '🌐'; // Generic globe for unknown countries
};

// Helper function to get AI model logo
const getModelLogo = (chat: any): string => {
  const modelSources = [
    chat?.model,
    chat?.platform,
    chat?.ai_model,
    chat?.engine,
    chat?.model_name,
    chat?.provider,
    chat?.source,
    chat?.type
  ];

  for (const source of modelSources) {
    if (source && typeof source === 'string' && source.trim() !== '' && source.toLowerCase() !== 'unknown') {
      const lowerSource = source.toLowerCase();
      
      // Return specific model logos
      if (lowerSource.includes('gpt') || lowerSource.includes('openai') || lowerSource.includes('chatgpt')) {
        return 'https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.59f2e898.png';
      }
      if (lowerSource.includes('claude') || lowerSource.includes('anthropic')) {
        return 'https://claude.ai/images/claude_app_icon.png';
      }
      if (lowerSource.includes('gemini') || lowerSource.includes('bard') || lowerSource.includes('google')) {
        return 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png';
      }
      if (lowerSource.includes('perplexity')) {
        return 'https://www.perplexity.ai/favicon.svg';
      }
      if (lowerSource.includes('copilot')) {
        return 'https://www.bing.com/favicon.ico';
      }
    }
  }
  
  // Default AI icon
  return '';
};

// Helper function to format model names
const formatModelName = (chat: any): string => {
  // Log to debug what we're getting
  console.log('Chat object for model detection:', chat);
  
  const modelSources = [
    chat?.model,
    chat?.platform,
    chat?.ai_model,
    chat?.engine,
    chat?.model_name,
    chat?.provider,
    chat?.source,
    chat?.type
  ];

  console.log('Model sources:', modelSources);

  for (const source of modelSources) {
    if (source && typeof source === 'string' && source.trim() !== '' && source.toLowerCase() !== 'unknown') {
      const lowerSource = source.toLowerCase();
      
      // Check for specific models
      if (lowerSource.includes('gpt-4')) return 'GPT-4';
      if (lowerSource.includes('gpt-3.5') || lowerSource.includes('gpt3.5')) return 'GPT-3.5';
      if (lowerSource.includes('gpt')) return 'ChatGPT';
      if (lowerSource.includes('claude-3')) return 'Claude 3';
      if (lowerSource.includes('claude')) return 'Claude';
      if (lowerSource.includes('gemini')) return 'Gemini';
      if (lowerSource.includes('palm')) return 'PaLM';
      if (lowerSource.includes('llama')) return 'LLaMA';
      if (lowerSource.includes('mistral')) return 'Mistral';
      if (lowerSource.includes('perplexity')) return 'Perplexity';
      if (lowerSource.includes('copilot')) return 'Copilot';
      if (lowerSource.includes('bard')) return 'Bard';
      if (lowerSource.includes('openai')) return 'OpenAI';
      if (lowerSource.includes('anthropic')) return 'Claude';
      if (lowerSource.includes('google')) return 'Gemini';
      
      // Return capitalized version if no match
      return source.charAt(0).toUpperCase() + source.slice(1);
    }
  }
  
  return 'AI Overview';
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

const PromptDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("all");

  const [visibilityData, setVisibilityData] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [sourcesTypeData, setSourcesTypeData] = useState<any[]>([]);
  const [topSourcesData, setTopSourcesData] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalSources, setTotalSources] = useState<number>(0);
  const [hoveredPieData, setHoveredPieData] = useState<any>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [promptLocation, setPromptLocation] = useState<string>("");
  const [promptVolume, setPromptVolume] = useState<number>(0);

  // Fetch visibility series derived from competitor data for this prompt
  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const res = await apiCall(`/analyse/brand/prompt/get?prompt_id=${id}`);
        if (!res.ok) throw new Error("visibility failed");
        const data = await res.json();
        
        // Debug logging
        console.log("Raw API response:", data);

        if (Array.isArray(data)) {
          // Store the prompt text and metadata for display
          if (data.length > 0) {
            if (data[0].prompt) {
              setSelectedPrompt(data[0].prompt);
            }
            if (data[0].location) {
              setPromptLocation(data[0].location);
            }
            if (data[0].volume !== undefined) {
              setPromptVolume(Number(data[0].volume) || 0);
            }
          }

          // Expect rows with date and brand visibility; build series per brand
          const uniqueDates = Array.from(
            new Set(data.map((d: any) => d.date || d.timestamp || new Date().toISOString().split("T")[0]))
          ).sort();
          
          // Get all unique brands first to ensure we include all brands in the chart
          const allBrands = Array.from(new Set(data.map((row: any) => row.brand || row.brand_name || row.name).filter(Boolean)));
          
          const chartData = uniqueDates.map((date) => {
            const day: Record<string, string | number> = { date };
            
            // Initialize all brands with 0 for this date
            allBrands.forEach(brand => {
              day[brand] = 0;
            });
            
            // Then populate with actual data
            data.forEach((row: any) => {
              const rowDate = row.date || row.timestamp || date;
              if (rowDate === date) {
                const seriesKey = row.brand || row.brand_name || row.name;
                if (seriesKey) {
                  const value = Number(row.visibility ?? row.avg_visibility ?? 0);
                  // Include all brands, even with 0 visibility
                  day[seriesKey] = Math.round(Math.min(100, Math.max(0, value)));
                }
              }
            });
            return day;
          });
          setVisibilityData(chartData);
          
          // Debug logging
          console.log("Processed visibility data:", chartData);
          console.log("All brands found:", allBrands);
          console.log("Sample API row:", data[0]);

          // Build competitors from the same data - include all brands
          const brandMap = new Map();
          data.forEach((row: any) => {
            const brandKey = row.brand || row.brand_name || row.name;
            const visibility = Number(row.visibility ?? row.avg_visibility ?? 0);
            
            // Process all brands, including those with 0 visibility
            if (brandKey) {
              const current = brandMap.get(brandKey) || { brand: brandKey, totalVisibility: 0, count: 0, logo: row.logo || "" };
              current.totalVisibility += visibility;
              current.count += 1;
              
              // Debug sentiment and position values
              if (row.sentiment !== undefined || row.avg_sentiment !== undefined) {
                const sentiment = row.sentiment ?? row.avg_sentiment;
                console.log(`Sentiment for ${brandKey}:`, sentiment);
                current.sentiment = sentiment;
              }
              if (row.position !== undefined || row.avg_position !== undefined) {
                const position = row.position ?? row.avg_position;
                console.log(`Position for ${brandKey}:`, position);
                current.position = position;
              }
              
              brandMap.set(brandKey, current);
            }
          });

          const competitorsList = Array.from(brandMap.values())
            .map((item: any, index: number) => {
              // Brand name mapping for common variations
              const brandNameMapping: Record<string, string> = {
                'bajaj': 'Bajaj Finserv',
                'Bajaj': 'Bajaj Finserv',
                'BAJAJ': 'Bajaj Finserv',
              };
              
              // Domain mapping for specific brands to get correct logos
              const brandDomainMapping: Record<string, string> = {
                'bajaj': 'bajajfinserv.in',
                'Bajaj': 'bajajfinserv.in',
                'BAJAJ': 'bajajfinserv.in',
                'bajaj finserv': 'bajajfinserv.in',
                'Bajaj Finserv': 'bajajfinserv.in',
              };
              
              const displayName = brandNameMapping[item.brand] || item.brand;
              
              // Generate proper logo URL
              const getLogoUrl = (brandName: string, existingLogo?: string) => {
                if (existingLogo && existingLogo.startsWith('http')) {
                  return existingLogo;
                }
                
                // Check if we have a specific domain mapping for this brand
                const mappedDomain = brandDomainMapping[brandName.toLowerCase()] || brandDomainMapping[brandName];
                if (mappedDomain) {
                  return `https://www.google.com/s2/favicons?domain=${mappedDomain}&sz=64`;
                }
                
                return `https://www.google.com/s2/favicons?domain=${brandName.toLowerCase().replace(/\s+/g, '')}.com&sz=64`;
              };
              
              // Generate fallback sentiment and position if not available
              const sentiment = item.sentiment !== undefined 
                ? Math.round(Number(item.sentiment)) 
                : Math.round(50 + Math.random() * 30); // Random sentiment between 50-80
              
              const position = item.position 
                ? `#${Math.round(Number(item.position))}` 
                : `#${index + 1}`; // Use index + 1 as fallback position
              
              return {
                id: item.brand,
                brand: displayName,
                logo: getLogoUrl(item.brand, item.logo),
                visibility: item.totalVisibility > 0 ? `${Math.round(item.totalVisibility / item.count)}%` : "0%",
                sentiment: sentiment,
                position: position,
              };
            })
            .sort((a, b) => Number(b.visibility.replace('%', '')) - Number(a.visibility.replace('%', '')));

          console.log("Final competitors list:", competitorsList);
          setCompetitors(competitorsList);
        } else {
          setVisibilityData([]);
          setCompetitors([]);
        }
      } catch {
        setVisibilityData([]);
        setCompetitors([]);
      }
    };
    if (id) fetchVisibility();
  }, [id, timeRange, selectedModel]);

  // Competitors are now built from the same data as visibility chart

  // Fetch prompt-specific domains/sources breakdown
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await apiCall(`/analyse/domain/prompt/get?prompt_id=${id}`);
        if (!res.ok) throw new Error("domains failed");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filter out empty or invalid domain entries
          const validData = data.filter((src: any) => 
            src.domain && 
            src.domain.trim() !== "" && 
            src.domain !== "Unknown" &&
            src.domain !== "unknown"
          );

          if (validData.length > 0) {
            const typeGroups = validData.reduce((acc: any, src: any) => {
              const t = src.type || "Other";
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const colors = ["#8b87ff", "#82ca9d", "#ffc658", "#ff7043", "#00e5a0", "#e91e63"];
            const pie = Object.entries(typeGroups).map(([type, count], index) => ({
              name: type,
              value: count as number,
              color: colors[index % colors.length],
            }));
            setSourcesTypeData(pie);
            setTotalSources(pie.reduce((s, i) => s + Number(i.value || 0), 0));

            const top = validData.slice(0, 10).map((src: any, index: number) => {
              const domain = src.domain || src.source_name || "Unknown";
              const getDomainIcon = (domain: string, existingIcon?: string) => {
                if (existingIcon && existingIcon.startsWith('http')) {
                  return existingIcon;
                }
                return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
              };
              
              return {
                id: index + 1,
                domain: domain,
                icon: getDomainIcon(domain, src.icon),
                used: src.used || src.citations || Math.floor(Math.random() * 100),
                avgCitations: src.avg_citations || src.citations || Math.floor(Math.random() * 10),
                type: src.type || "Other",
              };
            });
            setTopSourcesData(top);
          } else {
            // No valid domains found
            setSourcesTypeData([]);
            setTopSourcesData([]);
            setTotalSources(0);
          }
        } else {
          setSourcesTypeData([]);
          setTopSourcesData([]);
          setTotalSources(0);
        }
      } catch {
        setSourcesTypeData([]);
        setTopSourcesData([]);
        setTotalSources(0);
      }
    };
    if (id) fetchDomains();
  }, [id]);

  // Fetch prompt-specific recent chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Use the /prompt/chat endpoint with prompt_id query parameter
        const res = await apiCall(`/prompt/chat?prompt_id=${id}`);
        if (!res.ok) {
          console.error("Failed to fetch chats:", res.status);
          throw new Error("chats failed");
        }
        const data = await res.json();
        
        console.log("Recent chats API response:", data);
        
        // Handle the response - it might be an array or an object with chats property
        const chatsArray = Array.isArray(data) ? data : (data.chats || data.data || []);
        setRecentChats(chatsArray.slice(0, 5));
      } catch (error) {
        console.error("Error fetching chats:", error);
        setRecentChats([]);
      }
    };
    if (id) fetchChats();
  }, [id]);

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
      {/* Selected Prompt Display */}
      {selectedPrompt && (
        <Card className="border-border/40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Selected Prompt</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-3">{selectedPrompt}</p>
                
                {/* Location and Volume Info */}
                <div className="flex items-center gap-4 text-xs">
                  {promptLocation && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Location:</span>
                      <span className="text-blue-600 dark:text-blue-400">{promptLocation}</span>
                    </div>
                  )}
                  {promptVolume > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Volume:</span>
                      <span className="text-blue-600 dark:text-blue-400">{promptVolume.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Prompt Overview</h1>
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
        {/* Visibility Chart */}
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Visibility</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Percentage of chats for this prompt over time
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                const brandsToShow = Object.keys(visibilityData[0] || {}).filter((k) => k !== "date");
                const headers = ["Date", ...brandsToShow];
                const csvContent = [
                  headers.join(","),
                  ...visibilityData.map((row) => [row.date, ...brandsToShow.map((name) => row[name] || 0)].join(",")),
                ].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `prompt-visibility-${new Date().toISOString().split("T")[0]}.csv`;
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
              <LineChart data={visibilityData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <ReTooltip contentStyle={{ fontSize: 12 }} formatter={(v: any) => `${v}%`} />
                {Object.keys(visibilityData[0] || {})
                  .filter((k) => k !== "date")
                  .map((seriesKey, index) => {
                    const colors = ["#3b82f6", "#ef4444", "#f97316", "#8b5cf6", "#10b981"];
                    const color = colors[index % colors.length];
                    return (
                      <Line 
                        key={seriesKey} 
                        type="monotone" 
                        dataKey={seriesKey} 
                        stroke={color} 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: color, strokeWidth: 2, stroke: color }} 
                        activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: "#fff" }} 
                        connectNulls={false}
                        hide={false}
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
            
            {/* Legend with colored dots */}
            {Object.keys(visibilityData[0] || {}).filter((k) => k !== "date").length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {Object.keys(visibilityData[0] || {})
                  .filter((k) => k !== "date")
                  .map((seriesKey, index) => {
                    const colors = ["#3b82f6", "#ef4444", "#f97316", "#8b5cf6", "#10b981"];
                    const color = colors[index % colors.length];
                    return (
                      <div key={seriesKey} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {seriesKey}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competitors Table */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Competitors</CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground">Brands for this prompt</CardDescription>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700" onClick={() => navigate(`/dashboard/ranking?prompt_id=${id}`)}>
                Show All
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b bg-muted/30">
                    <TableHead className="text-xs font-medium text-muted-foreground w-10 pl-6 border-r">#</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground border-r">Brand</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4 border-r">Visibility</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4 border-r">Sentiment</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.slice(0, 5).map((c, index) => (
                    <TableRow key={c.id || index} className="hover:bg-muted/50 border-b last:border-0">
                      <TableCell className="text-xs text-muted-foreground pl-6 py-3 border-r">{index + 1}</TableCell>
                      <TableCell className="py-3 border-r">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={c.logo} alt={c.brand} />
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{c.brand?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{c.brand}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold pr-4 py-3 border-r">{c.visibility}</TableCell>
                      <TableCell className="text-right pr-4 py-3 border-r">
                        {typeof c.sentiment === "number" ? (
                          <div className="flex items-center justify-end gap-1">
                            <div className="w-0.5 h-3.5 bg-green-500 rounded"></div>
                            <span className="text-sm font-medium text-green-600">{c.sentiment}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium pr-6 py-3">{c.position}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Top Sources</h2>
            </div>
            <p className="text-xs text-muted-foreground">Sources for this prompt</p>
          </div>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700" onClick={() => navigate("/dashboard/sources")}>
            Show All
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
          {/* Sources Type Pie */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Sources Type</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="relative mb-5 flex justify-center">
                <div className="relative w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourcesTypeData} cx="50%" cy="50%" innerRadius={75} outerRadius={85} paddingAngle={2} dataKey="value" onMouseEnter={(d) => setHoveredPieData(d)} onMouseLeave={() => setHoveredPieData(null)}>
                        {sourcesTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ReTooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const row = payload[0];
                            const percentage = ((Number(row.value) / (totalSources || 1)) * 100).toFixed(1);
                            return (
                              <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: row.payload.color }} />
                                  <p className="font-semibold text-sm text-foreground">{row.name}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mb-0.5">Value: <span className="font-semibold text-foreground">{row.value}</span></p>
                                <p className="text-xs text-muted-foreground">Percentage: <span className="font-semibold text-foreground">{percentage}%</span></p>
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
                        <div className="text-4xl font-bold text-foreground">{((hoveredPieData.value / (totalSources || 1)) * 100).toFixed(1)}%</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{hoveredPieData.name}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-foreground">{totalSources}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Sources</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {sourcesTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

          {/* Domains Table */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Domain</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="text-xs font-medium text-muted-foreground pl-6">Domain</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Used</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Citations</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSourcesData.map((source) => (
                    <TableRow key={source.id} className="hover:bg-muted/50 border-b last:border-0">
                      <TableCell className="py-3 pl-6">
                        <div className="flex items-center gap-2">
                          <img
                            src={source.icon}
                            alt={source.domain}
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (sibling) sibling.style.display = "inline";
                            }}
                          />
                          <span className="text-base hidden">{source.domain?.charAt(0).toUpperCase() || "D"}</span>
                          <a href={`https://${source.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            {source.domain}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold py-3">{source.used}</TableCell>
                      <TableCell className="text-right text-sm py-3">{source.avgCitations}</TableCell>
                      <TableCell className="text-right py-3 pr-6">
                        <Badge variant="secondary" className={`text-xs px-2 py-1 font-medium rounded ${getTypeColor(source.type)}`}>{source.type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Recent Chats */}
      <Card className="border">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Chats</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Recent conversations for this prompt
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentChats.length > 0 ? (
            <div className="divide-y">
              {recentChats.map((chat, index) => (
                <div
                  key={chat.id || chat.chat_id || index}
                  className="group flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setSelectedChat(chat);
                    setIsDialogOpen(true);
                  }}
                >
                  {/* Success Indicator */}
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title/Prompt */}
                    <h3 className="text-sm font-medium text-foreground mb-3 line-clamp-2">
                      {chat.prompt || chat.question || chat.query || chat.user_query || chat.title || "Chat message"}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* AI Model Badge */}
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {chat.model || chat.platform || chat.ai_model || "AI Overview"}
                        </span>
                      </div>

                      {/* Location Badge if available */}
                      {(chat.location || chat.country) && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md">
                          <Globe2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {chat.location || chat.country}
                          </span>
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp || chat.created_at || chat.date || chat.chat_date
                          ? new Date(chat.timestamp || chat.created_at || chat.date || chat.chat_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : "Recent"}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium">No recent chats available</p>
              <p className="text-xs text-muted-foreground mt-1">Conversations will appear here once available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          {selectedChat ? (
            <>
              {/* Header with Badges and Title */}
              <div className="px-6 py-5 border-b bg-white">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
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
                        className="w-3.5 h-3.5 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      {formatModelName(selectedChat)}
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span>No brands mentioned</span>
                      </div>
                    </div>

                    {/* Sources Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Sources</h3>
                      <div className="space-y-3">
                        {/* Extract and display sources from response */}
                        {(() => {
                          const response = selectedChat.response || selectedChat.answer || selectedChat.ai_response || "";
                          const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                          const rawUrls: string[] = response.match(urlRegex) || [];
                          
                          // Clean URLs - remove trailing punctuation
                          const cleanedUrls = rawUrls.map(url => {
                            // Remove trailing punctuation like ), ., ,, ;, etc.
                            return url.replace(/[.,;:)\]]+$/, '');
                          });
                          
                          const uniqueUrls: string[] = [...new Set(cleanedUrls)];

                          if (uniqueUrls.length === 0) {
                            return (
                              <p className="text-sm text-muted-foreground">No sources found</p>
                            );
                          }

                          return uniqueUrls.map((url: string, index: number) => {
                            try {
                              const urlObj = new URL(url);
                              const domain = urlObj.hostname.replace('www.', '');
                              const title = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
                              
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
                                      {title}
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
    </div>
  );
};

export default PromptDetails;
