import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BarChart3, Info } from "lucide-react";
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { RootState, AppDispatch } from "@/store";
import { setLoading, setError, setRankingData, setPromptRankingData } from "@/store/slices/rankingSlice";
import { processRankingData, getRankingData, isRankingDataFresh } from "@/utils/rankingUtils";
import {
  Tooltip as UITooltip,
  TooltipContent as UITooltipContent,
  TooltipProvider as UITooltipProvider,
  TooltipTrigger as UITooltipTrigger,
} from "@/components/ui/tooltip";

interface RankingItem {
  id: number;
  brand: string;
  logo: string;
  visibility: string;
  sentiment: number | string;
  position: string;
}

const RankingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const promptId = searchParams.get('prompt_id');
  
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("all");
  
  // Get data from Redux store
  const { rankingData, promptRankingData, loading, error, lastUpdated, promptId: storePromptId } = useSelector((state: RootState) => state.ranking);
  
  // Use appropriate data based on promptId
  const currentRankingData = promptId && storePromptId === promptId ? promptRankingData : rankingData;

  useEffect(() => {
    const fetchRankingData = async () => {
      // Check if we have fresh data in Redux store for the correct context (general or prompt-specific)
      const isCorrectContext = promptId ? (storePromptId === promptId) : (storePromptId === null);
      if (currentRankingData.length > 0 && isRankingDataFresh(lastUpdated) && isCorrectContext) {
        return; // Use cached data
      }

      dispatch(setLoading(true));
      dispatch(setError(null));
      
      try {
        const token = localStorage.getItem('accessToken');
        // Use prompt-specific endpoint if prompt_id is provided, otherwise use general endpoint
        const url = promptId 
          ? `https://aeotest-production.up.railway.app/analyse/brand/prompt/get?prompt_id=${promptId}`
          : `https://aeotest-production.up.railway.app/analyse/brand/get`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch ranking data');
        }
        
        const data = await response.json();
        console.log('Fetched ranking data:', data);
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Use the new ranking utility for proper processing
          const processedData = processRankingData(data, !!promptId);
          console.log('Processed ranking data:', processedData);
          
          if (promptId) {
            dispatch(setPromptRankingData({ promptId, data: processedData }));
          } else {
            dispatch(setRankingData(processedData));
          }
        } else {
          if (promptId) {
            dispatch(setPromptRankingData({ promptId, data: [] }));
          } else {
            dispatch(setRankingData([]));
          }
        }
      } catch (err) {
        console.error('Error fetching ranking data:', err);
        dispatch(setError('Failed to load ranking data'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchRankingData();
  }, [timeRange, selectedModel, promptId, dispatch, storePromptId]);

  if (loading && currentRankingData.length === 0) {
    return <LoadingScreen text="Loading ranking data..." />;
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">
            {promptId ? "Prompt Competitors" : "Ranking"}
          </h1>
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

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Ranking</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading ranking data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-red-600">Error: {error}</div>
            </div>
          ) : currentRankingData.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-6">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No ranking data available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {promptId ? "No brands found for this prompt" : "Add competitors to see ranking data"}
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
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
                  {currentRankingData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 border-b last:border-0"
                  >
                    <TableCell className="text-xs text-muted-foreground pl-6 py-3 border-r">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-3 border-r">
                      <div className="flex items-center gap-2.5">
                        <BrandAvatar
                          brandName={item.brand}
                          logoUrl={item.logo}
                          size="md"
                        />
                        <span className="text-sm font-medium">{item.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold py-3 border-r">
                      {item.visibility}
                    </TableCell>
                    <TableCell className="text-right py-3 border-r">
                      {typeof item.sentiment === "number" && item.sentiment !== null ? (
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-0.5 h-3.5 bg-green-500 rounded"></div>
                          <span className="text-sm font-medium text-green-600">
                            {item.sentiment}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium pr-6 py-3">
                      {item.position || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingPage;
