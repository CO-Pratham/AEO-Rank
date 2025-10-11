import { useState, useEffect } from "react";
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
import { BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RankingItem {
  id: number;
  brand: string;
  logo: string;
  visibility: string;
  sentiment: number | string;
  position: string;
}

const RankingPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedModel, setSelectedModel] = useState("all");
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankingData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ====== BACKEND ENDPOINT ======
        // TODO: Replace with your actual API endpoint
        const response = await fetch(`/api/ranking?timeRange=${timeRange}&model=${selectedModel}`);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // API not implemented yet, show empty state
          setRankingData([]);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch ranking data');
        }
        
        const data = await response.json();
        setRankingData(Array.isArray(data) ? data : []);
      } catch (err) {
        // If API is not available, show empty state instead of error
        console.log('API not available, showing empty state:', err);
        setRankingData([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [timeRange, selectedModel]);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Ranking</h1>
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
          ) : rankingData.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-6">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No ranking data available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add competitors to see ranking data
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-xs font-medium text-muted-foreground w-10 pl-6">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground">
                    Brand
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right">
                    Visibility{" "}
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted text-muted-foreground ml-1 text-[10px]">
                      ?
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right">
                    Sentiment{" "}
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted text-muted-foreground ml-1 text-[10px]">
                      ?
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground text-right pr-6">
                    Position{" "}
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted text-muted-foreground ml-1 text-[10px]">
                      ?
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 border-b last:border-0"
                  >
                    <TableCell className="text-xs text-muted-foreground pl-6 py-3">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.logo} alt={item.brand} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {item.brand.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{item.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold py-3">
                      {item.visibility}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      {typeof item.sentiment === "number" ? (
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
                    <TableCell className="text-right text-sm text-muted-foreground pr-6 py-3">
                      {item.position}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingPage;
