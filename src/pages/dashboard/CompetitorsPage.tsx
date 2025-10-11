import { useState, useEffect } from "react";
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
import { Plus, MoreHorizontal, Swords } from "lucide-react";
import { useCompetitors } from "@/context/CompetitorsContext";

interface SuggestedCompetitor {
  id: number;
  name: string;
  logo: string;
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
  const { competitors, addCompetitor, removeCompetitor } = useCompetitors();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorLogo, setNewCompetitorLogo] = useState("");
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<SuggestedCompetitor[]>([]);

  useEffect(() => {
    const fetchSuggestedCompetitors = async () => {
      try {
        // ====== BACKEND ENDPOINT ======
        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/competitors/suggested');
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggested competitors');
        }
        
        const data = await response.json();
        setSuggestedCompetitors(data);
      } catch (err) {
        console.error('Error fetching suggested competitors:', err);
        setSuggestedCompetitors([]);
      }
    };

    fetchSuggestedCompetitors();
  }, []);

  const yourCompetitors: YourCompetitor[] = competitors.map(comp => ({
    id: comp.id,
    name: comp.brand,
    logo: comp.logo,
    website: comp.brand.toLowerCase() + ".com",
    isYourBrand: comp.brand === "APPSTORYS"
  }));

  const handleTrack = (competitor: SuggestedCompetitor) => {
    addCompetitor({
      brand: competitor.name,
      logo: competitor.logo,
      visibility: "0%",
      sentiment: "—",
      position: "—",
    });
    setSuggestedCompetitors(
      suggestedCompetitors.filter((c) => c.id !== competitor.id)
    );
  };

  const handleReject = (competitorId: number) => {
    setSuggestedCompetitors(
      suggestedCompetitors.filter((c) => c.id !== competitorId)
    );
  };

  const handleRemoveCompetitor = (competitorId: number) => {
    removeCompetitor(competitorId);
  };

  const handleAddCompetitor = () => {
    if (!newCompetitorName.trim()) {
      alert("Please enter a competitor name");
      return;
    }

    addCompetitor({
      brand: newCompetitorName,
      logo: newCompetitorLogo || newCompetitorName[0].toUpperCase(),
      visibility: "0%",
      sentiment: "—",
      position: "—",
    });

    setNewCompetitorName("");
    setNewCompetitorLogo("");
    setAddDialogOpen(false);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Swords className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">Competitors</h1>
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
        <h2 className="text-base font-medium text-foreground">Suggested Competitors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestedCompetitors.map((competitor) => (
            <Card 
              key={competitor.id} 
              className="border border-border/50 bg-gradient-to-br from-rose-50/40 to-pink-50/30 hover:from-rose-50/60 hover:to-pink-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-border/30 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-2xl font-bold text-gray-800">
                      {competitor.logo}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-base text-foreground leading-tight">
                      {competitor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {competitor.mentions} Mentions
                    </p>
                  </div>
                  <div className="flex gap-2 w-full pt-2">
                    <Button
                      className="flex-1 bg-black hover:bg-black/90 text-white h-9 text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
                      onClick={() => handleTrack(competitor)}
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
      </div>

      {/* Your Competitors */}
      <div className="space-y-4">
        <h2 className="text-base font-medium text-foreground">Your Competitors</h2>
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
                      {competitor.logo}
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
                          onClick={() =>
                            console.log("View details", competitor.name)
                          }
                          className="text-sm cursor-pointer"
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => console.log("Edit", competitor.name)}
                          className="text-sm cursor-pointer"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 text-sm cursor-pointer"
                          onClick={() => handleRemoveCompetitor(competitor.id)}
                        >
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
      </div>

      {/* Add Competitor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Competitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Competitor Name</Label>
              <Input
                id="name"
                placeholder="Enter competitor name"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo (emoji or text)</Label>
              <Input
                id="logo"
                placeholder="🔵 or first letter"
                value={newCompetitorLogo}
                onChange={(e) => setNewCompetitorLogo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCompetitor}
              className="bg-black hover:bg-black/90 text-white"
            >
              Add Competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompetitorsPage;
